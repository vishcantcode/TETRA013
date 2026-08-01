import { IDbExecutor } from './db-connection';
import { Vital, VitalMetric, validateVital } from '../domain';

export class VitalRepository {
  private defaultExecutor: IDbExecutor;

  constructor(defaultExecutor: IDbExecutor) {
    this.defaultExecutor = defaultExecutor;
  }

  /**
   * Persists a single vital sign reading.
   */
  public async saveVital(vital: Vital, executor?: IDbExecutor): Promise<Vital> {
    const exec = executor || this.defaultExecutor;
    const validated = validateVital(vital);

    const query = `
      INSERT INTO vitals (id, patient_id, metric, value, unit, confidence, timestamp, half_life_ms, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      ON CONFLICT (id) DO UPDATE
      SET value = EXCLUDED.value, confidence = EXCLUDED.confidence;
    `;

    await exec.query(query, [
      validated.id,
      validated.patientId,
      validated.metric,
      validated.value,
      validated.unit,
      validated.confidence,
      validated.timestamp,
      validated.halfLifeMs
    ]);

    return validated;
  }

  /**
   * Batch inserts a list of vitals in a single transaction.
   */
  public async saveVitalsBatch(vitals: Vital[], executor?: IDbExecutor): Promise<void> {
    if (vitals.length === 0) return;
    const exec = executor || this.defaultExecutor;

    for (const item of vitals) {
      await this.saveVital(item, exec);
    }
  }

  /**
   * Fetches the latest reading for each vital metric category for a patient.
   */
  public async findLatestVitals(
    patientId: string,
    executor?: IDbExecutor
  ): Promise<Record<string, Vital>> {
    const exec = executor || this.defaultExecutor;
    const query = `
      SELECT DISTINCT ON (metric) id, patient_id, metric, value, unit, confidence, timestamp, half_life_ms
      FROM vitals
      WHERE patient_id = $1
      ORDER BY metric, timestamp DESC;
    `;

    const res = await exec.query(query, [patientId]);
    const result: Record<string, Vital> = {};

    for (const row of res.rows) {
      const v = validateVital({
        id: row.id,
        patientId: row.patient_id,
        metric: row.metric,
        value: Number(row.value),
        unit: row.unit,
        confidence: Number(row.confidence),
        timestamp: new Date(row.timestamp).toISOString(),
        halfLifeMs: Number(row.half_life_ms)
      });
      result[v.metric] = v;
    }

    return result;
  }

  /**
   * Queries historical vitals for a metric within a specific time range.
   */
  public async queryVitalsByTimeRange(
    patientId: string,
    metric: VitalMetric,
    startTime: string,
    endTime: string,
    limit: number = 100,
    executor?: IDbExecutor
  ): Promise<Vital[]> {
    const exec = executor || this.defaultExecutor;
    const query = `
      SELECT id, patient_id, metric, value, unit, confidence, timestamp, half_life_ms
      FROM vitals
      WHERE patient_id = $1 AND metric = $2 AND timestamp BETWEEN $3 AND $4
      ORDER BY timestamp DESC
      LIMIT $5;
    `;

    const res = await exec.query(query, [patientId, metric, startTime, endTime, limit]);

    return res.rows.map((row) =>
      validateVital({
        id: row.id,
        patientId: row.patient_id,
        metric: row.metric,
        value: Number(row.value),
        unit: row.unit,
        confidence: Number(row.confidence),
        timestamp: new Date(row.timestamp).toISOString(),
        halfLifeMs: Number(row.half_life_ms)
      })
    );
  }
}
