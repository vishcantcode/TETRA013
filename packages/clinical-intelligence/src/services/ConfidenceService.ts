import { DiseaseRiskResult } from '../interfaces/RiskModel';

export class ConfidenceService {
  public static calculateOverallConfidence(results: DiseaseRiskResult[]): number {
    if (!results.length) return 0.50;
    const sum = results.reduce((acc, curr) => acc + curr.confidenceScore, 0);
    return Number((sum / results.length).toFixed(2));
  }
}
