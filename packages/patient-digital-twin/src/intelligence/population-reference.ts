export interface PopulationBaseline {
  mean: number;
  stdDev: number;
}

const POPULATION_NORMS: Record<string, PopulationBaseline> = {
  heartRate: { mean: 72.0, stdDev: 10.0 },
  bpSystolic: { mean: 120.0, stdDev: 12.0 },
  bpDiastolic: { mean: 80.0, stdDev: 8.0 },
  spo2: { mean: 98.0, stdDev: 1.5 },
  respiratoryRate: { mean: 16.0, stdDev: 2.5 },
  temperature: { mean: 37.0, stdDev: 0.4 }
};

export class PopulationReferenceEngine {
  /**
   * Calculates the Z-score of a metric value relative to population baselines: Z = (x - mu) / sigma
   */
  public static calculateZScore(metric: string, value: number): number {
    const norm = POPULATION_NORMS[metric];
    if (!norm || norm.stdDev === 0) return 0.0;
    return Number(((value - norm.mean) / norm.stdDev).toFixed(3));
  }

  /**
   * Calculates approximate percentile rank from Z-score.
   */
  public static calculatePercentileRank(zScore: number): number {
    // Standard normal CDF approximation
    const t = 1 / (1 + 0.2316419 * Math.abs(zScore));
    const d = 0.3989423 * Math.exp((-zScore * zScore) / 2);
    const p =
      d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    const cdf = zScore >= 0 ? 1 - p : p;
    return Number((cdf * 100).toFixed(1));
  }
}
