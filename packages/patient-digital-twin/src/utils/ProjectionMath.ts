import { TrajectoryProjection, ProgressionScenario } from '../interfaces/Projection';
import { UnifiedRiskAssessment } from '@healthsense/clinical-intelligence';

export class ProjectionMath {
  public static calculateProjections(assessment: UnifiedRiskAssessment): TrajectoryProjection[] {
    const baseRisk = assessment.overallRiskScore;
    const scenarios: { name: ProgressionScenario; delta12: number; delta36: number }[] = [
      { name: 'No Intervention (Natural Trajectory)', delta12: +8, delta36: +18 },
      { name: 'Lifestyle Improvement (Diet & Exercise)', delta12: -12, delta36: -22 },
      { name: 'Medication Adherence (Optimal Pharma)', delta12: -18, delta36: -32 },
      { name: 'Delayed Treatment (Sub-optimal)', delta12: +15, delta36: +28 }
    ];

    const projections: TrajectoryProjection[] = [];

    for (const sc of scenarios) {
      const risk12 = Math.min(100, Math.max(5, baseRisk + sc.delta12));
      const risk36 = Math.min(100, Math.max(5, baseRisk + sc.delta36));

      projections.push({
        scenario: sc.name,
        monthsAhead: 12,
        projectedRiskScore: risk12,
        projectedRiskTier: risk12 >= 85 ? 'severe' : risk12 >= 60 ? 'high' : risk12 >= 25 ? 'moderate' : 'low',
        biomarkerProjections: [
          { metric: 'Projected Risk Shift', projectedValue: `${sc.delta12 > 0 ? '+' : ''}${sc.delta12}%` }
        ],
        assumptions: ['Assumes constant medication compliance & lifestyle status.'],
        confidenceScore: 0.85
      });

      projections.push({
        scenario: sc.name,
        monthsAhead: 36,
        projectedRiskScore: risk36,
        projectedRiskTier: risk36 >= 85 ? 'severe' : risk36 >= 60 ? 'high' : risk36 >= 25 ? 'moderate' : 'low',
        biomarkerProjections: [
          { metric: 'Projected Risk Shift', projectedValue: `${sc.delta36 > 0 ? '+' : ''}${sc.delta36}%` }
        ],
        assumptions: ['Longitudinal statistical model assumption over 36 months.'],
        confidenceScore: 0.78
      });
    }

    return projections;
  }
}
