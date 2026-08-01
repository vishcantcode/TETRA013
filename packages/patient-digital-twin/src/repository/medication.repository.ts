import { IDbExecutor } from './db-connection';
import { MedicationState, validateMedicationState } from '../domain';

export class MedicationRepository {
  private defaultExecutor: IDbExecutor;

  constructor(defaultExecutor: IDbExecutor) {
    this.defaultExecutor = defaultExecutor;
  }

  /**
   * Saves or updates a patient medication state entry.
   */
  public async saveMedicationState(
    medication: MedicationState,
    executor?: IDbExecutor
  ): Promise<MedicationState> {
    const exec = executor || this.defaultExecutor;
    const validated = validateMedicationState(medication);

    const query = `
      INSERT INTO patient_medications (id, patient_id, rxnorm_code, name, dosage, frequency, plasma_concentration_est, last_administered_at, active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE
      SET dosage = EXCLUDED.dosage, frequency = EXCLUDED.frequency, plasma_concentration_est = EXCLUDED.plasma_concentration_est, last_administered_at = EXCLUDED.last_administered_at, active = EXCLUDED.active, updated_at = NOW();
    `;

    await exec.query(query, [
      validated.id,
      validated.patientId,
      validated.rxNormCode,
      validated.name,
      validated.dosage,
      validated.frequency,
      validated.plasmaConcentrationEst,
      validated.lastAdministeredAt || null,
      validated.active
    ]);

    return validated;
  }

  /**
   * Batch inserts/updates medications.
   */
  public async saveMedicationsBatch(
    medications: MedicationState[],
    executor?: IDbExecutor
  ): Promise<void> {
    if (medications.length === 0) return;
    const exec = executor || this.defaultExecutor;

    for (const item of medications) {
      await this.saveMedicationState(item, exec);
    }
  }

  /**
   * Queries all active medications for a patient.
   */
  public async findActiveMedications(
    patientId: string,
    executor?: IDbExecutor
  ): Promise<MedicationState[]> {
    const exec = executor || this.defaultExecutor;
    const query = `
      SELECT id, patient_id, rxnorm_code, name, dosage, frequency, plasma_concentration_est, last_administered_at, active
      FROM patient_medications
      WHERE patient_id = $1 AND active = TRUE
      ORDER BY name ASC;
    `;

    const res = await exec.query(query, [patientId]);

    return res.rows.map((row) =>
      validateMedicationState({
        id: row.id,
        patientId: row.patient_id,
        rxNormCode: row.rxnorm_code,
        name: row.name,
        dosage: row.dosage,
        frequency: row.frequency,
        plasmaConcentrationEst: Number(row.plasma_concentration_est),
        lastAdministeredAt: row.last_administered_at
          ? new Date(row.last_administered_at).toISOString()
          : undefined,
        active: Boolean(row.active)
      })
    );
  }

  /**
   * Toggles the active status of a medication record.
   */
  public async updateMedicationActiveStatus(
    medicationId: string,
    active: boolean,
    executor?: IDbExecutor
  ): Promise<boolean> {
    const exec = executor || this.defaultExecutor;
    const query = `
      UPDATE patient_medications
      SET active = $1, updated_at = NOW()
      WHERE id = $2;
    `;

    const res = await exec.query(query, [active, medicationId]);
    return (res.rowCount ?? 0) > 0;
  }
}
