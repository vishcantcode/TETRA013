import { FHIRPatient, FHIRObservation, FHIRCondition, FHIRMedicationRequest, FHIRDiagnosticReport } from '@healthsense/clinical-models';
import { UnifiedRiskAssessment } from '@healthsense/clinical-intelligence';
import { CompleteExplainabilityReport } from '@healthsense/clinical-explainability';
import { ReferralDecision } from '@healthsense/clinical-referrals';
import { PersonalizedEducationPlan } from '@healthsense/patient-engagement';
import { DigitalTwin } from '@healthsense/patient-digital-twin';
import { PopulationSnapshot } from '@healthsense/population-health';
import { MedicalDocumentPayload } from '@healthsense/medical-document-intelligence';

export interface ClinicalEvaluationRequest {
  patient: FHIRPatient;
  uploadedDocument?: MedicalDocumentPayload;
  vitals?: FHIRObservation[];
  labs?: FHIRObservation[];
  conditions?: FHIRCondition[];
  medications?: FHIRMedicationRequest[];
  preferredLanguage?: 'en' | 'hi' | 'gu';
}

export interface FinalClinicalDecisionResult {
  evaluationId: string;
  evaluatedAt: string;
  patientId: string;
  pipelineDurationMs: number;
  riskAssessment: UnifiedRiskAssessment;
  explainabilityReport: CompleteExplainabilityReport;
  referralDecision: ReferralDecision;
  educationPlan: PersonalizedEducationPlan;
  digitalTwin: DigitalTwin;
  populationSnapshot: PopulationSnapshot;
  ocrExtractionPerformed: boolean;
  ocrDiagnosticReport?: FHIRDiagnosticReport;
  auditLogId: string;
}
