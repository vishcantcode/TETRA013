export interface StepTrace {
  stepName: string;
  durationMs: number;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  confidence?: number;
  errorDetails?: string;
}

export class TelemetryTracer {
  private startTime: number = Date.now();
  private traces: StepTrace[] = [];

  public startStepTimer(): () => number {
    const start = Date.now();
    return () => Date.now() - start;
  }

  public recordStep(trace: StepTrace): void {
    this.traces.push(trace);
  }

  public getTraceSummary() {
    return {
      totalDurationMs: Date.now() - this.startTime,
      stepTraces: this.traces
    };
  }
}
