import { ReasoningMetrics } from './contracts';

export class MetricsCollector {
  private metrics: ReasoningMetrics = {
    stageLatenciesMs: {},
    totalLatencyMs: 0,
    evidenceCount: 0,
    hypothesesGenerated: 0,
    validationFailures: 0
  };

  public recordStageLatency(stage: string, ms: number) {
    this.metrics.stageLatenciesMs[stage] = ms;
  }

  public setTotalLatency(ms: number) {
    this.metrics.totalLatencyMs = ms;
  }

  public incrementEvidenceCount(count: number = 1) {
    this.metrics.evidenceCount += count;
  }

  public incrementHypotheses(count: number = 1) {
    this.metrics.hypothesesGenerated += count;
  }

  public incrementValidationFailures() {
    this.metrics.validationFailures++;
  }

  public getMetrics(): ReasoningMetrics {
    // Return a clone to maintain immutability
    return JSON.parse(JSON.stringify(this.metrics));
  }
}
