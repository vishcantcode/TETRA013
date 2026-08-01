// ============================================================================
// HCQSG – Clinical Quality, Safety & Governance Platform
// Shared Types & Interfaces
// ============================================================================

import { HCKEPEvidenceChain } from '@healthsense/hckep';
import { HPPMCareProfile } from '@healthsense/hppm';

// ---------------------------------------------------------------------------
// Capability 1 – Clinical Quality Scoring
// ---------------------------------------------------------------------------

export interface HCQSGQualityFactor {
  factorName: string;
  score: number;      // 0-100
  weight: number;     // 0-1
  status: 'OPTIMAL' | 'ACCEPTABLE' | 'NEEDS_ATTENTION';
  rationale: string;
}

export interface HCQSGQualityScore {
  overallScore: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  factors: HCQSGQualityFactor[];
  strengths: string[];
  improvementOpportunities: string[];
}

// ---------------------------------------------------------------------------
// Capability 2 – Guideline Compliance
// ---------------------------------------------------------------------------

export interface HCQSGComplianceViolation {
  violationType: 'OUTDATED_GUIDANCE' | 'CONFLICTING_GUIDANCE' | 'MISSING_EVIDENCE' | 'INCOMPLETE_RECOMMENDATION';
  description: string;
  guidelineSource: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  remediationAction: string;
}

export interface HCQSGComplianceReport {
  overallCompliancePercent: number;
  compliant: boolean;
  checkedGuidelinesCount: number;
  violations: HCQSGComplianceViolation[];
}

// ---------------------------------------------------------------------------
// Capability 3 – Safety Validation
// ---------------------------------------------------------------------------

export type SafetySeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface HCQSGSafetyAlert {
  alertId: string;
  category: 'CONTRAINDICATION' | 'DUPLICATE_RECOMMENDATION' | 'UNSAFE_COMBINATION' | 'MISSING_FOLLOWUP' | 'ABNORMAL_RESULT_ESCALATION';
  severity: SafetySeverity;
  description: string;
  affectedItem: string;
  requiredAction: string;
}

export interface HCQSGSafetyValidationResult {
  safetyStatus: 'PASS' | 'WARNING' | 'CRITICAL_ALERT';
  alerts: HCQSGSafetyAlert[];
  isSafeForExecution: boolean;
}

// ---------------------------------------------------------------------------
// Capability 4 – Continuous Validation
// ---------------------------------------------------------------------------

export interface HCQSGContinuousValidationMetrics {
  clinicianAcceptanceRatePercent: number;
  clinicianOverrideRatePercent: number;
  treatmentOutcomeSuccessPercent: number;
  simulationAccuracyPercent: number;
  preventiveEffectivenessPercent: number;
  flaggedForReview: boolean;
  reviewReasons: string[];
}

// ---------------------------------------------------------------------------
// Capability 5 – Governance Dashboard Backend
// ---------------------------------------------------------------------------

export interface HCQSGGovernanceDashboardData {
  averageQualityScore: number;
  totalSafetyAlerts: { info: number; warning: number; critical: number };
  guidelineComplianceRatePercent: number;
  totalAuditedRecommendations: number;
  recommendationDistribution: { category: string; percent: number }[];
  clinicianFeedbackSummary: {
    totalFeedbackCount: number;
    positivePercent: number;
    topOverrideReasons: string[];
  };
}

// ---------------------------------------------------------------------------
// Capability 6 – Clinical KPI Engine
// ---------------------------------------------------------------------------

export interface HCQSGClinicalKPIs {
  medicationAdherenceRatePercent: number;
  preventiveScreeningCompletionPercent: number;
  referralCompletionPercent: number;
  carePlanCompletionPercent: number;
  followUpCompliancePercent: number;
  outcomeImprovementPercent: number;
  overallKPIHealthScore: number; // 0-100
}

// ---------------------------------------------------------------------------
// Capability 7 – Model & Knowledge Versioning
// ---------------------------------------------------------------------------

export interface HCQSGVersionMetadata {
  recommendationVersion: string;
  knowledgeBaseVersion: string;
  guidelineVersion: string;
  simulationVersion: string;
  personalizationVersion: string;
  versionHash: string; // SHA-256 hash of all versions combined
  isReproducible: boolean;
}

// ---------------------------------------------------------------------------
// Capability 8 – Enterprise Audit Reports
// ---------------------------------------------------------------------------

export interface HCQSGEnterpriseAuditReport {
  reportId: string;
  generatedAt: Date;
  patientId: string;
  qualityScore: HCQSGQualityScore;
  complianceReport: HCQSGComplianceReport;
  safetyValidation: HCQSGSafetyValidationResult;
  versionMetadata: HCQSGVersionMetadata;
  clinicalKPIs: HCQSGClinicalKPIs;
  auditTrailSummary: string;
}

// ---------------------------------------------------------------------------
// Full HCQSG Evaluation Result
// ---------------------------------------------------------------------------

export interface HCQSGEvaluationResult {
  evaluationId: string;
  patientId: string;
  qualityScore: HCQSGQualityScore;
  complianceReport: HCQSGComplianceReport;
  safetyValidation: HCQSGSafetyValidationResult;
  continuousValidation: HCQSGContinuousValidationMetrics;
  governanceDashboard: HCQSGGovernanceDashboardData;
  clinicalKPIs: HCQSGClinicalKPIs;
  versionMetadata: HCQSGVersionMetadata;
  enterpriseReport: HCQSGEnterpriseAuditReport;
  explainabilityChain: HCKEPEvidenceChain;
  telemetryPublished: boolean;
  evaluatedAt: Date;
  latencyMs: number;
}
