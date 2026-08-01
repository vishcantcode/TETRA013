export type WorkflowState = 'CREATED' | 'INITIALIZED' | 'COLLECTING_INPUTS' | 'VALIDATING' | 'READY_FOR_KERNEL' | 'KERNEL_EXECUTION' | 'POST_PROCESSING' | 'PERSISTING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface WorkflowMetadata {
  name: string;
  version: string;
  description: string;
}

export interface WorkflowContext {
  workflowId: string;
  sessionId: string;
  patientId: string;
  correlationId: string;
  featureFlags: Record<string, boolean>;
  locale: string;
  timezone: string;
  executionMode: 'sync' | 'async';
  connectivityState: 'online' | 'offline';
  workflowVersion: string;
  capabilityMetadata: any;
  permissions: string[];
  requestMetadata: any;
  auditMetadata: any;
  currentState: WorkflowState;
  data: any;
}

export interface WorkflowStep<TInput, TOutput> {
  name: string;
  onBeforeExecute?: (context: WorkflowContext) => void;
  execute(context: WorkflowContext, input: TInput): Promise<TOutput>;
  onAfterExecute?: (context: WorkflowContext) => void;
}

export interface WorkflowDefinition {
  metadata: WorkflowMetadata;
  steps: WorkflowStep<any, any>[];
  onTransition?: (from: WorkflowState, to: WorkflowState, context: WorkflowContext) => void;
}

export interface WorkflowResult<T> {
  success: boolean;
  state: WorkflowState;
  data?: T;
  error?: Error;
}

export interface ExecutionResult {
  sessionId: string;
  finalState: WorkflowState;
  durationMs: number;
}
