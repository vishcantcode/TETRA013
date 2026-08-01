import { IDbExecutor } from './db-connection';
import { RiskScore, validateRiskScore } from '../domain';

export class RiskTelemetryRepository {
  private defaultExecutor: IDbExecutor;

  constructor(defaultExecutor: IDbExecutor) {
    this.defaultExecutor = defaultExecutor;
  }

  /**
   * Bulk inserts clinical risk score history into TimescaleDB hypertable.
   */
  public async bulkInsertRiskScores(
    riskScores: RiskScore[],
    executor?: IDbExecutor
  ): Promise<void> {
    if (riskScores.length === 0) return;
    const exec = executor || this.defaultExecutor;

    const valueClauses: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    for (const r of riskScores) {
      const validated = validateRiskScore(r);
      valueClauses.push(
        `($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, $${paramIndex + 4}, $${paramIndex + 5}, $${paramIndex + 6})`
      );
      params.push(
        validated.timestamp,
        validated.patientId,
        validated.riskType,
        validated.score,
        validated.trend,
        validated.confidence,
        JSON.stringify(validated.evidenceIds)
      );
      paramIndex += 7;
    }

    const query = `
      INSERT INTO risk_scores_telemetry (timestamp, patient_id, risk_type, score, trend, confidence, evidence_ids)
      VALUES ${valueClauses.join(', ')}
      ON CONFLICT (timestamp, patient_id, risk_type) DO UPDATE
      SET score = EXCLUDED.score, trend = EXCLUDED.trend, confidence = EXCLUDED.confidence;
    `;

    await exec.query(query, params);
  }

  /**
   * Queries risk score evaluation timeline for a specific risk type.
   */
  public async queryRiskTimeline(
    patientId: string,
    riskType: string,
    startTime: string,
    endTime: string,
    limit: number = 100,
    executor?: IDbExecutor
  ): Promise<RiskScore[]> {
    const exec = executor || this.defaultExecutor;
    const query = `
      SELECT timestamp, patient_id, risk_type, score, trend, confidence, evidence_ids
      FROM risk_scores_telemetry
      WHERE patient_id = $1 AND risk_type = $2 AND timestamp BETWEEN $3 AND $4
      ORDER BY timestamp DESC
      LIMIT $5;
    `;

    const res = await exec.query(query, [patientId, riskType, startTime, endTime, limit]);

    return res.rows.map((row) =>
      validateRiskScore({
        id: crypto.randomUUID(),
        patientId: row.patient_id,
        riskType: row.risk_type,
        score: Number(row.score),
        trend: row.trend,
        confidence: Number(row.confidence),
        evidenceIds: Array.isArray(row.evidence_ids)
          ? row.evidence_ids
          : JSON.parse(row.evidence_ids || '[]'),
        timestamp: new Date(row.timestamp).toISOString()
      })
    );
  }
}
