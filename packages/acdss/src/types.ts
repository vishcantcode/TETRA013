// ============================================================================
// ACDSS – Advanced Clinical Decision Support System
// Shared Types & Interfaces
// ============================================================================

import { HCKEPEvidenceChain } from '@healthsense/hckep';
import { HCPIPatientProfile } from '@healthsense/hcpi';
import { HCPIRiskEvolution } from '@healthsense/hcpi';

// ---------------------------------------------------------------------------
// Patient Case Input
// ---------------------------------------------------------------------------

export interface ACDSSPatientCase {
  patientId: string;
  symptoms: string[];
  vitalSigns: { metric: string; value: number; unit: string }[];
  laboratoryResults: { test: string; value: number; unit: string; referenceRange?: string }[];
  medications: string[];
  allergies: string[];
  chronicConditions: string[];
  age: number;
  sex: 'M' | 'F';
}

// ---------------------------------------------------------------------------
// Differential Diagnosis
// ---------------------------------------------------------------------------

export type RecommendationStrength = 'STRONG' | 'MODERATE' | 'WEAK' | 'CONDITIONAL';

export interface ACDSSDifferentialDiagnosis {
  condition: string;
  confidence: number;
  supportingFindings: string[];
  contradictingFindings: string[];
  evidenceReferences: string[];
  recommendationStrength: RecommendationStrength;
}

// ---------------------------------------------------------------------------
// Multi-Condition Reasoning
// ---------------------------------------------------------------------------

export interface ACDSSConditionInteraction {
  conditions: string[];
  interactionType: 'SYNERGISTIC_RISK' | 'TREATMENT_CONFLICT' | 'SHARED_PATHWAY' | 'COMPOUNDING';
  description: string;
  clinicalImplication: string;
  adjustedRiskModifier: number;
}

export interface ACDSSMultiConditionAssessment {
  detectedInteractions: ACDSSConditionInteraction[];
  holisticRecommendations: string[];
  combinedRiskScore: number;
}

// ---------------------------------------------------------------------------
// Medication Safety
// ---------------------------------------------------------------------------

export type MedicationAlertSeverity = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface ACDSSMedicationAlert {
  type: 'DRUG_DRUG' | 'DRUG_ALLERGY' | 'DUPLICATE_THERAPY' | 'CONTRAINDICATION' | 'DOSE_SAFETY' | 'DISEASE_INTERACTION';
  severity: MedicationAlertSeverity;
  medications: string[];
  description: string;
  recommendation: string;
}

export interface ACDSSMedicationSafetyResult {
  alerts: ACDSSMedicationAlert[];
  criticalCount: number;
  highCount: number;
  moderateCount: number;
  lowCount: number;
  overallSafetyStatus: 'SAFE' | 'REVIEW_RECOMMENDED' | 'INTERVENTION_REQUIRED' | 'CRITICAL_STOP';
}

// ---------------------------------------------------------------------------
// Disease Progression
// ---------------------------------------------------------------------------

export type ProgressionTrajectory = 'IMPROVING' | 'STABLE' | 'DETERIORATING';

export interface ACDSSProgressionEstimate {
  condition: string;
  trajectory: ProgressionTrajectory;
  projectedEvolution: string;
  contributingFactors: string[];
  timeHorizon: string;
  confidence: number;
}

// ---------------------------------------------------------------------------
// Clinical Pathways
// ---------------------------------------------------------------------------

export interface ACDSSPathwayStep {
  order: number;
  action: string;
  category: 'ASSESSMENT' | 'LIFESTYLE' | 'MEDICATION' | 'MONITORING' | 'FOLLOW_UP' | 'REFERRAL' | 'EDUCATION';
  timeframe: string;
  details: string;
}

export interface ACDSSClinicalPathway {
  condition: string;
  steps: ACDSSPathwayStep[];
  guidelineReference: string;
}

// ---------------------------------------------------------------------------
// Referral Intelligence
// ---------------------------------------------------------------------------

export type ReferralUrgency = 'ROUTINE' | 'SOON' | 'URGENT' | 'EMERGENT';

export interface ACDSSReferralRecommendation {
  specialty: string;
  urgency: ReferralUrgency;
  reasoning: string;
  triggeringFindings: string[];
}

// ---------------------------------------------------------------------------
// Clinical Prioritization
// ---------------------------------------------------------------------------

export type ClinicalPriority = 'ROUTINE' | 'URGENT' | 'HIGH_PRIORITY' | 'EMERGENCY';

export interface ACDSSPrioritization {
  priority: ClinicalPriority;
  reasoning: string[];
  contributingFactors: string[];
}

// ---------------------------------------------------------------------------
// Explainability
// ---------------------------------------------------------------------------

export interface ACDSSExplainabilityReport {
  evidenceChain: HCKEPEvidenceChain;
  supportingObservations: string[];
  consultedGuidelines: string[];
  confidence: number;
  uncertainty: string;
  recommendationRationale: string;
}

// ---------------------------------------------------------------------------
// Full ACDSS Evaluation Result
// ---------------------------------------------------------------------------

export interface ACDSSEvaluationResult {
  caseId: string;
  patientId: string;
  differentialDiagnoses: ACDSSDifferentialDiagnosis[];
  multiConditionAssessment: ACDSSMultiConditionAssessment;
  medicationSafety: ACDSSMedicationSafetyResult;
  progressionEstimates: ACDSSProgressionEstimate[];
  clinicalPathways: ACDSSClinicalPathway[];
  referrals: ACDSSReferralRecommendation[];
  prioritization: ACDSSPrioritization;
  explainability: ACDSSExplainabilityReport;
  telemetryPublished: boolean;
  evaluatedAt: Date;
  latencyMs: number;
}
