import { BenefitRiskScore, BenefitRiskScoreSchema, ClinicalGoalScore } from './cdis-types';

export class BenefitRiskAnalyzer {
  /**
   * Calculates MCDA Net Clinical Value Vc:
   * Vc = sum(wj * Gcj) - alpha * Rc - beta * Pcontra
   */
  public static calculateNetClinicalValue(
    goalScores: ClinicalGoalScore[],
    adverseRiskScore: number = 0.0,
    isContraindicated: boolean = false,
    alpha: number = 1.5,
    beta: number = 100.0
  ): BenefitRiskScore {
    // 1. Benefit Score: Weighted sum of goal satisfaction scores
    let benefitScore = 0;
    for (const g of goalScores) {
      benefitScore += g.weight * g.satisfactionScore;
    }
    benefitScore = Number(Math.max(0.0, Math.min(1.0, benefitScore)).toFixed(4));

    // 2. Risk Score
    const riskScore = Number(Math.max(0.0, Math.min(1.0, adverseRiskScore)).toFixed(4));

    // 3. Contraindication Penalty
    const contraindicationPenalty = isContraindicated ? beta : 0.0;

    // 4. Net Clinical Value Vc
    const netClinicalValue = Number(
      (benefitScore - alpha * riskScore - contraindicationPenalty).toFixed(4)
    );

    return BenefitRiskScoreSchema.parse({
      benefitScore,
      riskScore,
      contraindicationPenalty,
      netClinicalValue
    });
  }
}
