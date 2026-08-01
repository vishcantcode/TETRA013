export interface ScreeningMetric {
  investigationName: string;
  coveragePercentage: number;
  missingPercentage: number;
  completedScreeningsCount: number;
  pendingScreeningsCount: number;
}

export interface RegionalScreeningGaps {
  metrics: ScreeningMetric[];
  priorityDeficitRegions: { regionName: string; missingTest: string; deficitPercentage: number }[];
}
