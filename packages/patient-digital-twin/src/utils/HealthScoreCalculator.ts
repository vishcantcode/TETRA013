import { HealthState } from '../interfaces/HealthState';
import { UnifiedRiskAssessment } from '@healthsense/clinical-intelligence';

export class HealthScoreCalculator {
  public static calculateHealthState(assessment: UnifiedRiskAssessment): HealthState {
    const overallHealthScore = assessment.overallHealthScore;
    const trendStatus: HealthState['trendStatus'] =
      assessment.overallTier === 'severe' || assessment.overallTier === 'high' ? 'Declining' :
      assessment.overallTier === 'moderate' ? 'Stable' : 'Improving';

    const drivers: string[] = [];
    const f = assessment.snapshot.features;

    if (f.hba1c !== null && f.hba1c >= 7.0) drivers.push(`Uncontrolled Glycemia (HbA1c ${f.hba1c}%)`);
    if (f.systolicBP !== null && f.systolicBP >= 140) drivers.push(`Stage 2 Hypertension (${f.systolicBP} mmHg)`);
    if (f.egfr !== null && f.egfr < 60) drivers.push(`Kidney Filtration Decline (eGFR ${f.egfr} mL/min)`);

    if (drivers.length === 0) drivers.push('Normoglycemia & Normal Blood Pressure');

    return {
      overallHealthScore,
      trendStatus,
      primaryRiskDrivers: drivers,
      influencingFactors: [
        { metric: 'HbA1c Weight', impact: '35%' },
        { metric: 'BP Weight', impact: '30%' },
        { metric: 'Renal Function Weight', impact: '25%' },
        { metric: 'Demographic Weight', impact: '10%' }
      ]
    };
  }
}
