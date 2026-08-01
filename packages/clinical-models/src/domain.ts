/**
 * HealthSense AI CDSS — HL7 FHIR R4 Aligned Domain Models
 * Standardized interfaces for clinical patient state, laboratory panels,
 * disease risk assessments, missing investigations, referrals, and education.
 */

export type ClinicalGender = 'male' | 'female' | 'other' | 'unknown';
export type RiskSeverityTier = 'low' | 'moderate' | 'high' | 'severe';
export type ReferralUrgency = 'routine' | 'urgent' | 'emergency';
export type GuidelineSource = 'ICMR' | 'ADA' | 'KDIGO' | 'AHA' | 'WHO';

export interface FHIRHumanName {
  use?: 'official' | 'usual';
  text?: string;
  family?: string;
  given?: string[];
}

export interface FHIRCoding {
  system: string;
  code: string;
  display?: string;
}

export interface FHIRCodeableConcept {
  coding: FHIRCoding[];
  text?: string;
}

export interface FHIRQuantity {
  value: number;
  unit: string;
  system?: string;
  code?: string;
}

export interface FHIRPatient {
  resourceType: 'Patient';
  id: string;
  identifier?: { system: string; value: string }[];
  active?: boolean;
  name: FHIRHumanName[];
  gender: ClinicalGender;
  birthDate: string; // YYYY-MM-DD
  telecom?: { system: 'phone' | 'email'; value: string }[];
  address?: { text?: string; city?: string; state?: string; postalCode?: string }[];
  meta?: { versionId?: string; lastUpdated?: string };
}

export interface FHIRObservation {
  resourceType: 'Observation';
  id: string;
  status: 'final' | 'amended' | 'preliminary';
  category?: FHIRCodeableConcept[];
  code: FHIRCodeableConcept; // LOINC code
  subject: { reference: string };
  effectiveDateTime: string;
  valueQuantity?: FHIRQuantity;
  valueString?: string;
  interpretation?: FHIRCodeableConcept;
  referenceRange?: { low?: FHIRQuantity; high?: FHIRQuantity; text?: string }[];
}

export interface FHIRCondition {
  resourceType: 'Condition';
  id: string;
  clinicalStatus?: 'active' | 'recurrence' | 'inactive' | 'remission';
  verificationStatus?: 'confirmed' | 'provisional' | 'differential';
  code: FHIRCodeableConcept; // ICD-10 or SNOMED-CT code
  subject: { reference: string };
  onsetDateTime?: string;
  note?: string[];
}

export interface FHIRMedicationRequest {
  resourceType: 'MedicationRequest';
  id: string;
  status: 'active' | 'completed' | 'cancelled' | 'on-hold';
  intent: 'order' | 'plan';
  medicationCodeableConcept: FHIRCodeableConcept;
  subject: { reference: string };
  authoredOn: string;
  dosageInstruction?: { text?: string; timing?: { repeat?: { frequency?: number; period?: number } } }[];
}

export interface FHIRDiagnosticReport {
  resourceType: 'DiagnosticReport';
  id: string;
  status: 'final' | 'partial';
  code: FHIRCodeableConcept;
  subject: { reference: string };
  effectiveDateTime: string;
  result?: { reference: string }[]; // Reference to FHIRObservation IDs
  conclusion?: string;
}

export interface IndividualDiseaseRisk {
  diseaseId: 'diabetes' | 'hypertension' | 'ckd' | 'cvd' | 'stroke';
  diseaseName: string;
  riskScore: number; // 0 to 100
  severityTier: RiskSeverityTier;
  confidenceScore: number; // 0 to 1.0
  contributingFactors: {
    metric: string;
    value: string | number;
    impactPercentage: number; // SHAP-style attribution %
    rationale: string;
  }[];
  guidelineCitations: {
    source: GuidelineSource;
    title: string;
    section: string;
    url?: string;
  }[];
}

export interface FHIRRiskAssessment {
  resourceType: 'RiskAssessment';
  id: string;
  status: 'final';
  subject: { reference: string };
  occurrenceDateTime: string;
  overallRiskScore: number; // 0 to 100
  overallTier: RiskSeverityTier;
  diseaseRisks: IndividualDiseaseRisk[];
  mitigationStrategies: string[];
}

export interface MissingInvestigation {
  id: string;
  testName: string;
  loincCode?: string;
  reasoning: string;
  urgency: ReferralUrgency;
  guidelineSource: GuidelineSource;
  guidelineRef: string;
}

export interface FHIRServiceRequest {
  resourceType: 'ServiceRequest';
  id: string;
  status: 'active' | 'completed' | 'draft';
  intent: 'order';
  category?: FHIRCodeableConcept;
  specialty: string;
  urgency: ReferralUrgency;
  code: FHIRCodeableConcept;
  subject: { reference: string };
  occurrenceDateTime: string;
  reasonCode?: FHIRCodeableConcept[];
  reasonText: string;
  performerType?: FHIRCodeableConcept;
}

export interface ClinicalRecommendation {
  id: string;
  patientId: string;
  assessmentId: string;
  riskAssessment: FHIRRiskAssessment;
  missingInvestigations: MissingInvestigation[];
  referral?: FHIRServiceRequest;
  summaryRationale: string;
  generatedAt: string;
}

export interface PatientEducationAdvice {
  language: 'en' | 'hi' | 'gu';
  title: string;
  summary: string;
  keyActionSteps: string[];
  dietaryAdvice: string[];
  warningSignsToWatch: string[];
  translatedAt: string;
}
