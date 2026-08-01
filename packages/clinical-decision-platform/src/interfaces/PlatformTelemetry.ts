export interface StepExecutionTelemetry {
  stepName: string;
  durationMs: number;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  details?: string;
}

export interface EvaluationTelemetryTrace {
  evaluationId: string;
  patientId: string;
  totalDurationMs: number;
  steps: StepExecutionTelemetry[];
}
