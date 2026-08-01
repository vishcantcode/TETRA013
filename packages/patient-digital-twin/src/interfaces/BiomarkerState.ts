export interface BiomarkerTrendPoint {
  date: string;
  value: number;
  unit: string;
}

export interface BiomarkerHistory {
  metricName: string;
  loincCode: string;
  currentValue: number;
  unit: string;
  trendDirection: 'improving' | 'stable' | 'deteriorating';
  velocityPerMonth: number;
  historyPoints: BiomarkerTrendPoint[];
}
