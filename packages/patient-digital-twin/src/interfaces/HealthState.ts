export interface HealthState {
  overallHealthScore: number; // 0 to 100
  trendStatus: 'Improving' | 'Stable' | 'Declining';
  primaryRiskDrivers: string[];
  influencingFactors: { metric: string; impact: string }[];
}
