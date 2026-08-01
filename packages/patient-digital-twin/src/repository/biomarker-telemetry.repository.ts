import { IDbExecutor } from './db-connection';
import { Biomarker, validateBiomarker } from '../domain';

export class BiomarkerTelemetryRepository {
  private defaultExecutor: IDbExecutor;

  constructor(defaultExecutor: IDbExecutor) {
    this.defaultExecutor = defaultExecutor;
  }

  /**
   * Bulk inserts lab biomarker telemetry entries into TimescaleDB hypertable.
   */
  public async bulkInsertBiomarkers(
    biomarkers: Biomarker[],
    executor?: IDbExecutor
  ): Promise<void> {
    if (biomarkers.length === 0) return;
    const exec = executor || this.defaultExecutor;

    const valueClauses: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    for (const b of biomarkers) {
      const validated = validateBiomarker(b);
      valueClauses.push(
        `($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, $${paramIndex + 4}, $${paramIndex + 5}, $${paramIndex + 6}, $${paramIndex + 7}, $${paramIndex + 8})`
      );
      params.push(
        validated.timestamp,
        validated.patientId,
        validated.loincCode,
        validated.name,
        validated.value,
        validated.unit,
        validated.status,
        validated.referenceRange || null,
        validated.confidence
      );
      paramIndex += 9;
    }

    const query = `
      INSERT INTO biomarkers_telemetry (timestamp, patient_id, loinc_code, name, value, unit, status, reference_range, confidence)
      VALUES ${valueClauses.join(', ')}
      ON CONFLICT (timestamp, patient_id, loinc_code) DO UPDATE
      SET value = EXCLUDED.value, status = EXCLUDED.status, confidence = EXCLUDED.confidence;
    `;

    await exec.query(query, params);
  }

  /**
   * Queries longitudinal biomarker trend over time for a patient and LOINC code.
   */
  public async queryLongitudinalTrend(
    patientId: string,
    loincCode: string,
    startTime: string,
    endTime: string,
    limit: number = 200,
    executor?: IDbExecutor
  ): Promise<Biomarker[]> {
    const exec = executor || this.defaultExecutor;
    const query = `
      SELECT timestamp, patient_id, loinc_code, name, value, unit, status, reference_range, confidence
      FROM biomarkers_telemetry
      WHERE patient_id = $1 AND loinc_code = $2 AND timestamp BETWEEN $3 AND $4
      ORDER BY timestamp DESC
      LIMIT $5;
    `;

    const res = await exec.query(query, [patientId, loincCode, startTime, endTime, limit]);

    return res.rows.map((row) =>
      validateBiomarker({
        id: crypto.randomUUID(),
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
