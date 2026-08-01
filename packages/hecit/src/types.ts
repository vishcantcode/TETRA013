// ============================================================================
// HECIT – Explainable Clinical Intelligence & Trust Platform
// Shared Types & Interfaces
// ============================================================================

import { HCKEPEvidenceChain } from '@healthsense/hckep';

// ---------------------------------------------------------------------------
// Capability 1 – Decision Trace
// ---------------------------------------------------------------------------

export interface HECITReasoningStep {
  stepIndex: number;
  phase: string;
  findingOrObservation: string;
  ruleApplied: string;
  evidenceRef: string;
  guidelineVersion: string;
}

export interface HECITDecisionTrace {
  traceId: string;
  patientId: string;
  primaryRecommendation: string;
  patientFindings: string[];
  derivedObservations: string[];
  rulesApplied: string[];
  evidenceReferences: string[];
  guidelineVersions: string[];
  reasoningSequence: HECITReasoningStep[];
}

// ---------------------------------------------------------------------------
// Capability 2 – Evidence Explorer
// ---------------------------------------------------------------------------

export interface HECITEvidenceItem {
  evidenceId: string;
  title: string;
  source: string; // e.g. "USPSTF 2024", "ACC/AHA 2017", "NEJM 2021"
  type: 'SUPPORTING' | 'CONTRADICTING' | 'NEUTRAL';
  evidenceStrength: 'HIGH' | 'MODERATE' | 'LOW';
  evidenceQuality: 'META_ANALYSIS' | 'RCT' | 'OBSERVATIONAL' | 'EXPERT_CONSENSUS';
  summary: string;
}

export interface HECITEvidenceExploration {
  recommendationTopic: string;
  supportingEvidence: HECITEvidenceItem[];
  contradictingEvidence: HECITEvidenceItem[];
  overallStrength: 'HIGH' | 'MODERATE' | 'LOW';
  primaryGuidelineSource: string;
}

// ---------------------------------------------------------------------------
// Capability 3 – Confidence Decomposition
// ---------------------------------------------------------------------------

export interface HECITConfidenceFactor {
  factorName: string;
  impactScore: number; // e.g. +0.25 or -0.10
  description: string;
}

export interface HECITConfidenceDecomposition {
  overallConfidenceScore: number; // 0-1
  confidencePercentage: string;    // e.g. "92.5%"
  dataCompletenessScore: number;   // 0-1
  contributingFactors: HECITConfidenceFactor[];
  uncertaintyFactors: HECITConfidenceFactor[];
  conflictingSignals: string[];
}

// ---------------------------------------------------------------------------
// Capability 4 – Alternative Pathways
// ---------------------------------------------------------------------------

export interface HECITAlternativePathway {
  pathwayId: string;
  pathwayName: string;
  description: string;
  expectedBenefits: string[];
  expectedRisks: string[];
  confidence: number;
  supportingRationale: string;
  reasonNotSelectedAsPrimary: string;
}

// ---------------------------------------------------------------------------
// Capability 5 – Clinical Explanation Timeline
// ---------------------------------------------------------------------------

export interface HECITTimelineEvent {
  date: Date;
  eventCategory: 'LAB' | 'DIAGNOSIS' | 'MEDICATION' | 'LIFESTYLE' | 'INTERVENTION';
  description: string;
  contributionToCurrentRecommendation: string;
}

export interface HECITExplanationTimeline {
  patientId: string;
  chronologicalEvents: HECITTimelineEvent[];
  summaryTrajectory: string;
}

// ---------------------------------------------------------------------------
// Capability 6 – AI Audit Log
// ---------------------------------------------------------------------------

export interface HECITAuditRecord {
  auditId: string;
  timestamp: Date;
  patientId: string;
  inputSnapshotSummary: {
    age: number;
    sex: string;
    chronicConditionsCount: number;
    medicationsCount: number;
    vitalsCount: number;
    labsCount: number;
  };
  outputRecommendationSummary: string;
  evidenceConsulted: string[];
  policiesApplied: string[];
  simulationsExecuted: number;
  personalizationDecisions: string[];
  auditHash: string; // SHA-256 integrity hash
}

// ---------------------------------------------------------------------------
// Capability 7 – Clinician Summary
// ---------------------------------------------------------------------------

export interface HECITClinicianSummary {
  patientId: string;
  headlineSummary: string;
  keyFindings: string[];
  topRisks: string[];
  recommendedActions: { action: string; priority: 'URGENT' | 'HIGH' | 'ROUTINE' }[];
  evidenceSummary: string;
  followUpPriorities: string[];
  evaluatedAt: Date;
}

// ---------------------------------------------------------------------------
// Capability 8 – Patient-Friendly Explanation
// ---------------------------------------------------------------------------

export interface HECITPatientExplanation {
  patientId: string;
  simpleSummary: string;
  whyThisIsRecommended: string[];
  whatYouShouldDoNext: string[];
  keyQuestionsToAskYourDoctor: string[];
  lifestyleTips: string[];
}

// ---------------------------------------------------------------------------
// Full HECIT Evaluation Result
// ---------------------------------------------------------------------------

export interface HECITEvaluationResult {
  evaluationId: string;
  patientId: string;
  decisionTrace: HECITDecisionTrace;
  evidenceExploration: HECITEvidenceExploration;
  confidenceDecomposition: HECITConfidenceDecomposition;
  alternativePathways: HECITAlternativePathway[];
  explanationTimeline: HECITExplanationTimeline;
  auditRecord: HECITAuditRecord;
  clinicianSummary: HECITClinicianSummary;
  patientExplanation: HECITPatientExplanation;
  explainabilityChain: HCKEPEvidenceChain;
  telemetryPublished: boolean;
  evaluatedAt: Date;
  latencyMs: number;
}
