import { IDbExecutor } from './db-connection';
import { Biomarker, validateBiomarker } from '../domain';

export class BiomarkerRepository {
  private defaultExecutor: IDbExecutor;

  constructor(defaultExecutor: IDbExecutor) {
    this.defaultExecutor = defaultExecutor;
  }

  /**
   * Saves a lab biomarker reading.
   */
  public async saveBiomarker(biomarker: Biomarker, executor?: IDbExecutor): Promise<Biomarker> {
    const exec = executor || this.defaultExecutor;
    const validated = validateBiomarker(biomarker);

    const query = `
      INSERT INTO biomarkers (id, patient_id, loinc_code, name, value, unit, status, reference_range, confidence, timestamp, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      ON CONFLICT (id) DO UPDATE
      SET value = EXCLUDED.value, status = EXCLUDED.status, confidence = EXCLUDED.confidence;
    `;

    await exec.query(query, [
      validated.id,
      validated.patientId,
      validated.loincCode,
      validated.name,
      validated.value,
      validated.unit,
      validated.status,
      validated.referenceRange || null,
      validated.confidence,
      validated.timestamp
    ]);

    return validated;
  }

  /**
   * Batch inserts biomarkers.
   */
  public async saveBiomarkersBatch(
    biomarkers: Biomarker[],
    executor?: IDbExecutor
  ): Promise<void> {
    if (biomarkers.length === 0) return;
    const exec = executor || this.defaultExecutor;

    for (const item of biomarkers) {
      await this.saveBiomarker(item, exec);
    }
  }

  /**
   * Fetches latest biomarker for each LOINC code for a patient.
   */
  public async findLatestBiomarkers(
    patientId: string,
    executor?: IDbExecutor
  ): Promise<Record<string, Biomarker>> {
    const exec = executor || this.defaultExecutor;
    const query = `
      SELECT DISTINCT ON (loinc_code) id, patient_id, loinc_code, name, value, unit, status, reference_range, confidence, timestamp
      FROM biomarkers
      WHERE patient_id = $1
      ORDER BY loinc_code, timestamp DESC;
    `;

    const res = await exec.query(query, [patientId]);
    const result: Record<string, Biomarker> = {};

    for (const row of res.rows) {
      const b = validateBiomarker({
        id: row.id,
        patientId: row.patient_id,
        loincCode: row.loinc_code,
        name: row.name,
        value: Number(row.value),
        unit: row.unit,
        status: row.status,
        referenceRange: row.reference_range || undefined,
        confidence: Number(row.confidence),
        timestamp: new Date(row.timestamp).toISOString()
      });
      result[b.loincCode] = b;
    }

    return result;
  }

  /**
   * Queries historical lab values for a specific LOINC code.
   */
  public async queryBiomarkersByLoinc(
    patientId: string,
    loincCode: string,
    limit: number = 50,
    executor?: IDbExecutor
  ): Promise<Biomarker[]> {
    const exec = executor || this.defaultExecutor;
    const query = `
      SELECT id, patient_id, loinc_code, name, value, unit, status, reference_range, confidence, timestamp
      FROM biomarkers
      WHERE patient_id = $1 AND loinc_code = $2
      ORDER BY timestamp DESC
      LIMIT $3;
    `;

    const res = await exec.query(query, [patientId, loincCode, limit]);

    return res.rows.map((row) =>
      validateBiomarker({
        id: row.id,
        patientId: row.patient_id,
        loincCode: row.loinc_code,
        name: row.name,
        value: Number(row.value),
        unit: row.unit,
        status: row.status,
        referenceRange: row.reference_range || undefined,
        confidence: Number(row.confidence),
        timestamp: new Date(row.timestamp).toISOString()
      })
    );
  }
}
