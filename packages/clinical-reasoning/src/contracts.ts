export interface ReasoningConfiguration {
  enableStrictValidation: boolean;
  priorityThreshold: number;
  maxHypotheses: number;
  safetyMode: 'strict' | 'permissive';
}

export interface ReasoningMetadata {
  traceId: string;
  patientId: string;
  sessionId: string;
  timestamp: Date;
  executionMode: 'live' | 'replay';
  activeConditions?: string[];
}

export interface ReasoningContext {
  config: ReasoningConfiguration;
  metadata: ReasoningMetadata;
}

export interface ReasoningRequest {
  patientId: string;
  sessionId: string;
  rawEvidence: any[];
}

export interface EvidenceBundle {
  source: string;
  payload: any;
  timestamp: Date;
  confidence: number;
}

export interface ValidatedEvidence {
  id: string;
  bundle: EvidenceBundle;
  normalizedData: Record<string, any>;
}

export interface PrioritizedEvidence {
  evidence: ValidatedEvidence;
  priorityScore: number;
  reasoning: string;
}

export interface ClinicalHypothesis {
  id: string;
  description: string;
  supportingEvidenceIds: string[];
  confidence: number;
}

export interface ReasoningResult {
  hypotheses: ClinicalHypothesis[];
  inferredActions: any[];
  overallConfidence: number;
}

export interface SafetyAssessment {
  isSafe: boolean;
  violations: string[];
  warnings: string[];
}

export interface DecisionDraft {
  actions: any[];
  severity: string;
  priority: string;
  confidence: number;
}

export interface FinalClinicalDecision {
  id: string;
  draft: DecisionDraft;
  safety: SafetyAssessment;
  explanation: any;
}

export interface ReasoningMetrics {
  stageLatenciesMs: Record<string, number>;
  totalLatencyMs: number;
  evidenceCount: number;
  hypothesesGenerated: number;
  validationFailures: number;
}

export interface ReasoningTrace {
  id: string;
  metadata: ReasoningMetadata;
  stages: {
    stageName: string;
    inputHash: string;
    outputHash: string;
    durationMs: number;
    errors: string[];
    warnings: string[];
  }[];
  finalOutputHash: string;
}
