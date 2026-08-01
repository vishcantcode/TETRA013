import { IDbExecutor } from './db-connection';
import { RiskScore, validateRiskScore } from '../domain';

export class RiskScoreRepository {
  private defaultExecutor: IDbExecutor;

  constructor(defaultExecutor: IDbExecutor) {
    this.defaultExecutor = defaultExecutor;
  }

  /**
   * Saves an evaluated clinical risk score record.
   */
  public async saveRiskScore(riskScore: RiskScore, executor?: IDbExecutor): Promise<RiskScore> {
    const exec = executor || this.defaultExecutor;
    const validated = validateRiskScore(riskScore);

    const query = `
      INSERT INTO risk_scores (id, patient_id, risk_type, score, trend, confidence, evidence_ids, timestamp, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      ON CONFLICT (id) DO UPDATE
      SET score = EXCLUDED.score, trend = EXCLUDED.trend, confidence = EXCLUDED.confidence, evidence_ids = EXCLUDED.evidence_ids;
    `;

    await exec.query(query, [
      validated.id,
      validated.patientId,
      validated.riskType,
      validated.score,
      validated.trend,
      validated.confidence,
      JSON.stringify(validated.evidenceIds),
      validated.timestamp
    ]);

    return validated;
  }

  /**
   * Batch inserts/updates risk scores.
   */
  public async saveRiskScoresBatch(
    riskScores: RiskScore[],
    executor?: IDbExecutor
  ): Promise<void> {
    if (riskScores.length === 0) return;
    const exec = executor || this.defaultExecutor;

    for (const item of riskScores) {
      await this.saveRiskScore(item, exec);
    }
  }

  /**
   * Fetches latest risk score by category for a patient.
   */
  public async findLatestRiskScores(
    patientId: string,
    executor?: IDbExecutor
  ): Promise<Record<string, RiskScore>> {
    const exec = executor || this.defaultExecutor;
    const query = `
      SELECT DISTINCT ON (risk_type) id, patient_id, risk_type, score, trend, confidence, evidence_ids, timestamp
      FROM risk_scores
      WHERE patient_id = $1
      ORDER BY risk_type, timestamp DESC;
    `;

    const res = await exec.query(query, [patientId]);
    const result: Record<string, RiskScore> = {};

    for (const row of res.rows) {
      const r = validateRiskScore({
        id: row.id,
        patientId: row.patient_id,
        riskType: row.risk_type,
        score: Number(row.score),
        trend: row.trend,
        confidence: Number(row.confidence),
        evidenceIds: Array.isArray(row.evidence_ids) ? row.evidence_ids : JSON.parse(row.evidence_ids || '[]'),
        timestamp: new Date(row.timestamp).toISOString()
      });
      result[r.riskType] = r;
    }

    return result;
  }

  /**
   * Queries risk score evaluation history for a given category.
   */
  public async queryRiskHistory(
    patientId: string,
    riskType: string,
    limit: number = 50,
    executor?: IDbExecutor
  ): Promise<RiskScore[]> {
    const exec = executor || this.defaultExecutor;
    const query = `
      SELECT id, patient_id, risk_type, score, trend, confidence, evidence_ids, timestamp
      FROM risk_scores
      WHERE patient_id = $1 AND risk_type = $2
      ORDER BY timestamp DESC
      LIMIT $3;
    `;

    const res = await exec.query(query, [patientId, riskType, limit]);

    return res.rows.map((row) =>
      validateRiskScore({
        id: row.id,
        patientId: row.patient_id,
        riskType: row.risk_type,
        score: Number(row.score),
        trend: row.trend,
        confidence: Number(row.confidence),
        evidenceIds: Array.isArray(row.evidence_ids) ? row.evidence_ids : JSON.parse(row.evidence_ids || '[]'),
        timestamp: new Date(row.timestamp).toISOString()
      })
    );
  }
}
