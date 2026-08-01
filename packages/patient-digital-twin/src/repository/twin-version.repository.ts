import { IDbExecutor } from './db-connection';
import { TwinState, deserializeTwinState } from '../domain';

export interface TwinVersionRecord {
  id: string;
  twinId: string;
  patientId: string;
  version: number;
  deltaJson: unknown;
  snapshot: TwinState;
  createdAt: string;
}

export class TwinVersionRepository {
  private defaultExecutor: IDbExecutor;

  constructor(defaultExecutor: IDbExecutor) {
    this.defaultExecutor = defaultExecutor;
  }

  /**
   * Persists a historical snapshot and delta log entry for audit and state rollbacks.
   */
  public async saveVersion(
    twinId: string,
    patientId: string,
    version: number,
    delta: unknown,
    snapshot: TwinState,
    executor?: IDbExecutor
  ): Promise<void> {
    const exec = executor || this.defaultExecutor;
    const query = `
      INSERT INTO twin_versions (twin_id, patient_id, version, delta_json, snapshot_json, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT (patient_id, version) DO UPDATE
      SET delta_json = EXCLUDED.delta_json, snapshot_json = EXCLUDED.snapshot_json;
    `;

    await exec.query(query, [
      twinId,
      patientId,
      version,
      JSON.stringify(delta),
      JSON.stringify(snapshot)
    ]);
  }

  /**
   * Queries paginated version history snapshots for a patient.
   */
  public async getVersionHistory(
    patientId: string,
    limit: number = 20,
    offset: number = 0,
    executor?: IDbExecutor
  ): Promise<TwinVersionRecord[]> {
    const exec = executor || this.defaultExecutor;
    const query = `
      SELECT id, twin_id, patient_id, version, delta_json, snapshot_json, created_at
      FROM twin_versions
      WHERE patient_id = $1
      ORDER BY version DESC
      LIMIT $2 OFFSET $3;
    `;

    const res = await exec.query(query, [patientId, limit, offset]);

    return res.rows.map((row) => ({
      id: row.id,
      twinId: row.twin_id,
      patientId: row.patient_id,
      version: row.version,
      deltaJson: row.delta_json,
      snapshot: deserializeTwinState(row.snapshot_json),
      createdAt: row.created_at
    }));
  }
}
