export type DecisionSeverity = 'low' | 'moderate' | 'high' | 'critical';
export type DecisionPriority = 'routine' | 'urgent' | 'emergency';
export type DecisionCategory = 'triage' | 'preventive' | 'chronic_management' | 'medication';

export interface DecisionEvidence {
  sourceEngine: string; // e.g. 'symptom-triage', 'chronic-disease'
  confidence: number;
  data: any; // Raw output from the source engine
  timestamp: Date;
}

export interface DecisionAction {
  id: string;
  type: string;
  description: string;
  executable: boolean;
  target?: string;
}

export interface DecisionConflict {
  id: string;
  description: string;
  involvedActions: string[];
  resolutionStrategy: 'override' | 'merge' | 'escalate';
  resolvedActionId?: string;
}

export interface DecisionConfidence {
  overallScore: number; // 0 to 1
  factors: string[];
  isActionable: boolean;
}

export interface DecisionExplanation {
  patientFriendlySummary: string;
  clinicalRationale: string;
  evidenceChain: string[];
  conflictResolutions: string[];
}

export interface DecisionRecommendation {
  id: string;
  category: DecisionCategory;
  severity: DecisionSeverity;
  priority: DecisionPriority;
  actions: DecisionAction[];
  contraindications: string[];
}

export interface DecisionOutcome {
  id: string;
  predictedEffect: string;
  monitoringRequirements: string[];
}

export interface DecisionMetadata {
  generatedAt: Date;
  version: string;
  patientId: string;
  sessionId: string;
}

export interface DecisionSnapshot {
  id: string;
  decisionId: string;
  state: any;
  timestamp: Date;
}

export class ClinicalDecision {
  public readonly id: string;
  public readonly metadata: DecisionMetadata;
  public readonly recommendations: DecisionRecommendation[];
  public readonly explanation: DecisionExplanation;
  public readonly confidence: DecisionConfidence;
  public readonly evidence: DecisionEvidence[];
  public readonly conflicts: DecisionConflict[];
  public readonly outcomes: DecisionOutcome[];

  constructor(
    id: string,
    metadata: DecisionMetadata,
    recommendations: DecisionRecommendation[],
    explanation: DecisionExplanation,
    confidence: DecisionConfidence,
    evidence: DecisionEvidence[],
    conflicts: DecisionConflict[],
    outcomes: DecisionOutcome[]
  ) {
    this.id = id;
    this.metadata = metadata;
    this.recommendations = recommendations;
    this.explanation = explanation;
    this.confidence = confidence;
    this.evidence = evidence;
    this.conflicts = conflicts;
    this.outcomes = outcomes;
  }
}
