import { TwinState } from '../domain';
import { RiskInsight, RiskInsightSchema } from './types';

export class RiskIntelligenceEngine {
  /**
   * Computes deterministic rule-based risk aggregation scores.
   */
  public static evaluateRisk(state: TwinState, previousState?: TwinState): RiskInsight {
    const riskScores = Object.values(state.riskScores);

    // 1. Composite risk aggregation
    let sumRisk = 0;
    for (const r of riskScores) {
      sumRisk += r.score;
    }
    const compositeRiskScore = riskScores.length > 0 ? Math.min(1.0, sumRisk / riskScores.length) : 0.0;

    // 2. Risk delta & acceleration
    let riskDelta = 0;
    let riskAcceleration = 0;

    if (previousState) {
      const prevScores = Object.values(previousState.riskScores);
      const prevComposite = prevScores.length > 0 ? prevScores.reduce((acc, r) => acc + r.score, 0) / prevScores.length : 0.0;
      riskDelta = Number((compositeRiskScore - prevComposite).toFixed(4));
    }

    const patientStabilityScore = Number((1.0 - compositeRiskScore).toFixed(4));

    return RiskInsightSchema.parse({
      compositeRiskScore: Number(compositeRiskScore.toFixed(4)),
      compositeMedicationRisk: 0.0,
      compositeBiomarkerRisk: 0.0,
      compositePhysiologicalRisk: compositeRiskScore,
      patientStabilityScore,
      riskDelta,
      riskAcceleration
    });
  }
}
