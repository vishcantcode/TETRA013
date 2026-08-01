export interface ConfidenceBreakdown {
  overallConfidenceScore: number; // 0 to 1.0
  percentageText: string;
  dataCompletenessScore: number;
  recencyScore: number;
  observationConsistencyScore: number;
  rationale: string[];
}
