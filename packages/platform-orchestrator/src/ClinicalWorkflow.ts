import { FHIRPatient, FHIRObservation, FHIRCondition, FHIRMedicationRequest, FHIRDiagnosticReport } from '@healthsense/clinical-models';
import { MedicalDocumentPayload } from '@healthsense/medical-document-intelligence';
import { UnifiedRiskAssessment } from '@healthsense/clinical-intelligence';
import { CompleteExplainabilityReport } from '@healthsense/clinical-explainability';
import { ReferralDecision } from '@healthsense/clinical-referrals';
import { PersonalizedEducationPlan } from '@healthsense/patient-engagement';
import { DigitalTwin } from '@healthsense/patient-digital-twin';
import { PopulationSnapshot } from '@healthsense/population-health';

export interface WorkflowRequestInput {
  patient: FHIRPatient;
  uploadedDocument?: MedicalDocumentPayload;
  vitals?: FHIRObservation[];
  labs?: FHIRObservation[];
  conditions?: FHIRCondition[];
  medications?: FHIRMedicationRequest[];
  preferredLanguage?: 'en' | 'hi' | 'gu';
}

export interface WorkflowContext {
  readonly executionId: string;
  readonly patientId: string;
  readonly request: WorkflowRequestInput;
  ocrDiagnosticReport?: FHIRDiagnosticReport;
  ocrObservations: FHIRObservation[];
  riskAssessment?: UnifiedRiskAssessment;
  explainabilityReport?: CompleteExplainabilityReport;
  referralDecision?: ReferralDecision;
  educationPlan?: PersonalizedEducationPlan;
  digitalTwin?: DigitalTwin;
  populationSnapshot?: PopulationSnapshot;
  errors: { step: string; error: string }[];
  warnings: { step: string; warning: string }[];
}
