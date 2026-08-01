export type ProgressionScenario =
  | 'No Intervention (Natural Trajectory)'
  | 'Lifestyle Improvement (Diet & Exercise)'
  | 'Medication Adherence (Optimal Pharma)'
  | 'Delayed Treatment (Sub-optimal)';

export interface TrajectoryProjection {
  scenario: ProgressionScenario;
  monthsAhead: 12 | 36;
  projectedRiskScore: number;
  projectedRiskTier: 'low' | 'moderate' | 'high' | 'severe';
  biomarkerProjections: { metric: string; projectedValue: string | number }[];
  assumptions: string[];
  confidenceScore: number;
}
