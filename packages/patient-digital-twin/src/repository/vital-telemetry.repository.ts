import { IDbExecutor } from './db-connection';
import { Vital, VitalMetric, validateVital } from '../domain';

export interface VitalAggregateBucket {
  bucket: string;
  metric: string;
  avgValue: number;
  minValue: number;
  maxValue: number;
  count: number;
}

export class VitalTelemetryRepository {
  private defaultExecutor: IDbExecutor;

  constructor(defaultExecutor: IDbExecutor) {
    this.defaultExecutor = defaultExecutor;
  }

  /**
   * High-throughput multi-row batch insert into vitals_telemetry hypertable.
   */
  public async bulkInsertVitals(vitals: Vital[], executor?: IDbExecutor): Promise<void> {
    if (vitals.length === 0) return;
    const exec = executor || this.defaultExecutor;

    const valueClauses: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    for (const v of vitals) {
      const validated = validateVital(v);
      valueClauses.push(
        `($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, $${paramIndex + 4}, $${paramIndex + 5}, $${paramIndex + 6})`
      );
      params.push(
        validated.timestamp,
        validated.patientId,
        validated.metric,
        validated.value,
        validated.unit,
        validated.confidence,
        validated.halfLifeMs
      );
      paramIndex += 7;
    }

    const query = `
      INSERT INTO vitals_telemetry (timestamp, patient_id, metric, value, unit, confidence, half_life_ms)
      VALUES ${valueClauses.join(', ')}
      ON CONFLICT (timestamp, patient_id, metric) DO UPDATE
      SET value = EXCLUDED.value, confidence = EXCLUDED.confidence;
    `;

    await exec.query(query, params);
  }

  /**
   * Queries time-series telemetry for a specific patient and metric.
   */
  public async queryTimeRange(
    patientId: string,
    metric: VitalMetric,
    startTime: string,
    endTime: string,
    limit: number = 500,
    executor?: IDbExecutor
  ): Promise<Vital[]> {
    const exec = executor || this.defaultExecutor;
    const query = `
      SELECT timestamp, patient_id, metric, value, unit, confidence, half_life_ms
      FROM vitals_telemetry
      WHERE patient_id = $1 AND metric = $2 AND timestamp BETWEEN $3 AND $4
      ORDER BY timestamp DESC
      LIMIT $5;
    `;

    const res = await exec.query(query, [patientId, metric, startTime, endTime, limit]);

    return res.rows.map((row) =>
      validateVital({
        id: crypto.randomUUID(),
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

  /**
   * TimescaleDB / SQL bucket downsampling query computing hourly average/min/max.
   */
  public async queryHourlyAggregates(
    patientId: string,
    metric: VitalMetric,
    startTime: string,
    endTime: string,
    executor?: IDbExecutor
  ): Promise<VitalAggregateBucket[]> {
    const exec = executor || this.defaultExecutor;
    const query = `
      SELECT date_trunc('hour', timestamp) AS bucket,
             metric,
             AVG(value) AS avg_value,
             MIN(value) AS min_value,
             MAX(value) AS max_value,
             COUNT(*)::int AS sample_count
      FROM vitals_telemetry
      WHERE patient_id = $1 AND metric = $2 AND timestamp BETWEEN $3 AND $4
      GROUP BY bucket, metric
      ORDER BY bucket ASC;
    `;

    const res = await exec.query(query, [patientId, metric, startTime, endTime]);

    return res.rows.map((row) => ({
      bucket: new Date(row.bucket).toISOString(),
      metric: row.metric,
      avgValue: Number(row.avg_value),
      minValue: Number(row.min_value),
      maxValue: Number(row.max_value),
      count: Number(row.sample_count)
    }));
  }
}
