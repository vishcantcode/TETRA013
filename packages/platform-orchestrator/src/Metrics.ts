export class MetricsAggregator {
  private static totalEvaluations = 0;
  private static totalErrors = 0;

  public static recordEvaluationSuccess(): void {
    MetricsAggregator.totalEvaluations++;
  }

  public static recordEvaluationError(): void {
    MetricsAggregator.totalErrors++;
  }

  public static getMetrics() {
    return {
      totalEvaluations: MetricsAggregator.totalEvaluations,
      totalErrors: MetricsAggregator.totalErrors,
      errorRate: MetricsAggregator.totalEvaluations > 0 ? (MetricsAggregator.totalErrors / MetricsAggregator.totalEvaluations) * 100 : 0
    };
  }
}
