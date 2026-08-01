import { DiseaseRiskResult } from '../interfaces/RiskModel';

export class RiskNormalizer {
  public static normalizeScore(rawScore: number): number {
    return Math.min(100, Math.max(0, Math.round(rawScore)));
  }

  public static sanitizeResult(result: DiseaseRiskResult): DiseaseRiskResult {
    return {
      ...result,
      riskScore: RiskNormalizer.normalizeScore(result.riskScore),
      confidenceScore: Number(Math.min(1.0, Math.max(0.1, result.confidenceScore)).toFixed(2))
    };
  }
}
