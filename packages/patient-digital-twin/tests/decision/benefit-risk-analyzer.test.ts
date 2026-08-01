import { describe, it, expect } from 'vitest';
import { BenefitRiskAnalyzer, ClinicalGoalScore } from '../../src';

describe('EWP-011: BenefitRiskAnalyzer MCDA Scoring Tests', () => {
  it('calculates Net Clinical Value Vc = sum(w * G) - alpha * R - beta * Pcontra', () => {
    const goals: ClinicalGoalScore[] = [
      { goalName: 'Maintain Perfusion', weight: 0.5, satisfactionScore: 1.0, priority: 'critical' },
      { goalName: 'Ensure Oxygenation', weight: 0.5, satisfactionScore: 0.8, priority: 'critical' }
    ];

    // Benefit = 0.5*1.0 + 0.5*0.8 = 0.90
    // Risk = 0.10
    // Net Vc = 0.90 - (1.5 * 0.10) - 0.0 = 0.75
    const score = BenefitRiskAnalyzer.calculateNetClinicalValue(goals, 0.10, false, 1.5, 100.0);

    expect(score.benefitScore).toBe(0.9);
    expect(score.riskScore).toBe(0.1);
    expect(score.netClinicalValue).toBe(0.75);
  });

  it('applies beta contraindication penalty on contraindicated candidates', () => {
    const goals: ClinicalGoalScore[] = [
      { goalName: 'Maintain Perfusion', weight: 1.0, satisfactionScore: 1.0, priority: 'critical' }
    ];

    const score = BenefitRiskAnalyzer.calculateNetClinicalValue(goals, 0.0, true, 1.5, 100.0);

    expect(score.contraindicationPenalty).toBe(100.0);
    expect(score.netClinicalValue).toBeLessThan(-90.0);
  });
});
