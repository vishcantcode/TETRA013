export class ReasoningError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'ReasoningError';
  }
}

export class ValidationError extends ReasoningError {
  constructor(message: string) {
    super(message, 'VALIDATION_FAILED');
    this.name = 'ValidationError';
  }
}

export class SafetyViolation extends ReasoningError {
  constructor(message: string) {
    super(message, 'SAFETY_VIOLATION');
    this.name = 'SafetyViolation';
  }
}

export class PipelineFailure extends ReasoningError {
  constructor(message: string, public readonly stage: string) {
    super(`Pipeline failed at ${stage}: ${message}`, 'PIPELINE_FAILURE');
    this.name = 'PipelineFailure';
  }
}

export class EvidenceConflict extends ReasoningError {
  constructor(message: string) {
    super(message, 'EVIDENCE_CONFLICT');
    this.name = 'EvidenceConflict';
  }
}

export class ConfigurationError extends ReasoningError {
  constructor(message: string) {
    super(message, 'CONFIGURATION_ERROR');
    this.name = 'ConfigurationError';
  }
}
