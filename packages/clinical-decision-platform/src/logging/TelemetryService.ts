import { StepExecutionTelemetry, EvaluationTelemetryTrace } from '../interfaces/PlatformTelemetry';

export class TelemetryTracer {
  private startTime: number = Date.now();
  private steps: StepExecutionTelemetry[] = [];

  public recordStep(stepName: string, durationMs: number, status: 'SUCCESS' | 'WARNING' | 'FAILED' = 'SUCCESS', details?: string) {
    this.steps.push({
      stepName,
      durationMs,
      status,
      details
    });
  }

  public completeTrace(evaluationId: string, patientId: string): EvaluationTelemetryTrace {
    const totalDurationMs = Date.now() - this.startTime;
    return {
      evaluationId,
      patientId,
      totalDurationMs,
      steps: this.steps
    };
  }
}
