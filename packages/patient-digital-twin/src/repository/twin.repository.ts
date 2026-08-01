import { IDbExecutor, OptimisticLockError } from './db-connection';
import { TwinState, validateTwinState, serializeTwinState, deserializeTwinState } from '../domain';

export class TwinRepository {
  private defaultExecutor: IDbExecutor;

  constructor(defaultExecutor: IDbExecutor) {
    this.defaultExecutor = defaultExecutor;
  }

  /**
   * Saves or updates a TwinState instance.
   * Enforces optimistic concurrency control using state.version.
   */
  public async saveTwin(state: TwinState, executor?: IDbExecutor): Promise<TwinState> {
    const exec = executor || this.defaultExecutor;
    const validated = validateTwinState(state);

    const existingRes = await exec.query(
      `SELECT version FROM patient_twins WHERE patient_id = $1`,
      [validated.patientId]
    );

    if (existingRes.rows.length === 0) {
      // Insert new record
      const insertQuery = `
        INSERT INTO patient_twins (patient_id, version, status, state_json, updated_at)
        VALUES ($1, $2, $3, $4, NOW())
        RETURNING patient_id, version, status, state_json, updated_at;
      `;
      const res = await exec.query(insertQuery, [
        validated.patientId,
        validated.version,
        validated.status,
        serializeTwinState(validated)
      ]);

      const row = res.rows[0];
      return deserializeTwinState(row.state_json);
    } else {
      // Update existing record with optimistic locking
      const currentVersion = existingRes.rows[0].version;
      const expectedOldVersion = validated.version - 1;

      if (currentVersion !== expectedOldVersion && currentVersion !== validated.version) {
        throw new OptimisticLockError(validated.patientId, expectedOldVersion, currentVersion);
      }

      const updateQuery = `
        UPDATE patient_twins
        SET version = $1, status = $2, state_json = $3, updated_at = NOW()
        WHERE patient_id = $4 AND (version = $5 OR version = $1)
        RETURNING state_json;
      `;

      const res = await exec.query(updateQuery, [
        validated.version,
        validated.status,
        serializeTwinState(validated),
        validated.patientId,
        expectedOldVersion
      ]);

      if (res.rows.length === 0) {
        throw new OptimisticLockError(validated.patientId, expectedOldVersion, currentVersion);
      }

      return deserializeTwinState(res.rows[0].state_json);
    }
  }

  /**
   * Finds a Patient Digital Twin state by patient UUID.
   */
  public async findTwinByPatientId(
    patientId: string,
    executor?: IDbExecutor
  ): Promise<TwinState | null> {
    const exec = executor || this.defaultExecutor;
    const res = await exec.query(
      `SELECT state_json FROM patient_twins WHERE patient_id = $1`,
      [patientId]
    );

    if (res.rows.length === 0) {
      return null;
    }

    return deserializeTwinState(res.rows[0].state_json);
  }

  /**
   * Deletes a Twin state record.
   */
  public async deleteTwin(patientId: string, executor?: IDbExecutor): Promise<boolean> {
    const exec = executor || this.defaultExecutor;
    const res = await exec.query(`DELETE FROM patient_twins WHERE patient_id = $1`, [patientId]);
    return (res.rowCount ?? 0) > 0;
  }
}
