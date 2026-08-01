// ============================================================================
// HPPM – Precision & Personalized Medicine Platform
// Shared Types & Interfaces
// ============================================================================

import { HCKEPEvidenceChain } from '@healthsense/hckep';

// ---------------------------------------------------------------------------
// Capability 1 – Personalized Care Profile
// ---------------------------------------------------------------------------

export interface HPPMTreatmentRecord {
  medication: string;
  startDate: Date;
  endDate?: Date;
  response: 'EXCELLENT' | 'GOOD' | 'PARTIAL' | 'POOR' | 'ADVERSE';
  notes: string;
}

export interface HPPMPatientPreferences {
  preferGeneric: boolean;
  avoidInjections: boolean;
  preferOnceDailyDosing: boolean;
  dietaryPreference: 'NONE' | 'VEGETARIAN' | 'VEGAN' | 'HALAL' | 'KOSHER' | 'GLUTEN_FREE';
  exercisePreference: 'LOW_IMPACT' | 'MODERATE' | 'HIGH_INTENSITY' | 'NONE';
  communicationPreference: 'IN_PERSON' | 'TELEHEALTH' | 'EITHER';
}

export interface HPPMCareProfile {
  patientId: string;
  demographics: { age: number; sex: 'M' | 'F'; ethnicity?: string };
  chronicConditions: string[];
  allergies: string[];
  currentMedications: string[];
  treatmentHistory: HPPMTreatmentRecord[];
  lifestyleSnapshot: {
    smokingStatus: 'NEVER' | 'FORMER' | 'CURRENT';
    physicalActivityMinPerWeek: number;
    sleepHoursPerNight: number;
    dietQuality: 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT';
  };
  adherenceHistory: {
    medicationAdherencePercent: number;
    appointmentAdherencePercent: number;
    screeningAdherencePercent: number;
    lifestyleAdherencePercent: number;
  };
  preferences: HPPMPatientPreferences;
  previousInterventions: { intervention: string; outcome: 'SUCCESS' | 'PARTIAL' | 'FAILURE'; date: Date }[];
  vitalSigns: { metric: string; value: number; unit: string }[];
  laboratoryResults: { test: string; value: number; unit: string }[];
  familyHistory: string[];
}

// ---------------------------------------------------------------------------
// Capability 2 – Personalized Treatment Recommendations
// ---------------------------------------------------------------------------

export interface HPPMPersonalizedRecommendation {
  category: 'MEDICATION' | 'LIFESTYLE' | 'MONITORING' | 'REFERRAL' | 'EDUCATION';
  recommendation: string;
  adaptationRationale: string[];
  confidence: number;
  alternativeConsidered: string;
  evidenceReference: string;
}

// ---------------------------------------------------------------------------
// Capability 3 – Response Learning
// ---------------------------------------------------------------------------

export type TreatmentResponseTrend = 'IMPROVING' | 'STABLE' | 'DECLINING';

export interface HPPMResponseInsight {
  medication: string;
  currentResponse: HPPMTreatmentRecord['response'];
  trend: TreatmentResponseTrend;
  recommendedAction: string;
  reasoning: string;
}

// ---------------------------------------------------------------------------
// Capability 4 – Personalized Goals
// ---------------------------------------------------------------------------

export interface HPPMPersonalizedGoal {
  domain: string;
  target: string;
  currentValue: string;
  rationale: string;
  timeframe: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

// ---------------------------------------------------------------------------
// Capability 5 – Adherence Intelligence
// ---------------------------------------------------------------------------

export type AdherenceDomain = 'MEDICATION' | 'APPOINTMENT' | 'SCREENING' | 'LIFESTYLE';

export interface HPPMAdherenceAlert {
  domain: AdherenceDomain;
  currentPercent: number;
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  severity: 'INFO' | 'WARNING' | 'ACTION_REQUIRED';
  intervention: string;
}

export interface HPPMAdherenceAssessment {
  overallAdherenceScore: number;
  alerts: HPPMAdherenceAlert[];
  riskOfNonAdherence: 'LOW' | 'MODERATE' | 'HIGH';
}

// ---------------------------------------------------------------------------
// Capability 6 – Shared Decision Support
// ---------------------------------------------------------------------------

export interface HPPMCareOption {
  optionName: string;
  description: string;
  expectedBenefits: string[];
  risks: string[];
  uncertainty: string;
  evidenceQuality: 'HIGH' | 'MODERATE' | 'LOW';
  patientSpecificConsiderations: string[];
  suitabilityScore: number;  // 0-100
}

export interface HPPMSharedDecisionReport {
  clinicalQuestion: string;
  options: HPPMCareOption[];
  recommendedOption: string;
  recommendationRationale: string;
}

// ---------------------------------------------------------------------------
// Capability 7 – Future-Ready Interfaces
// ---------------------------------------------------------------------------

export interface HPPMGenomicDataSlot {
  available: boolean;
  pharmacogenomicProfile?: Record<string, string>;
  geneticRiskFactors?: string[];
}

export interface HPPMWearableDataSlot {
  available: boolean;
  avgDailySteps?: number;
  avgRestingHR?: number;
  avgSleepScore?: number;
  lastSyncDate?: Date;
}

export interface HPPMRemoteMonitoringSlot {
  available: boolean;
  connectedDevices?: string[];
  latestReadings?: { metric: string; value: number; timestamp: Date }[];
}

export interface HPPMFutureReadyProfile {
  genomicData: HPPMGenomicDataSlot;
  wearableData: HPPMWearableDataSlot;
  remoteMonitoring: HPPMRemoteMonitoringSlot;
  extensionPoints: string[];
}

// ---------------------------------------------------------------------------
// Full HPPM Evaluation Result
// ---------------------------------------------------------------------------

export interface HPPMEvaluationResult {
  evaluationId: string;
  patientId: string;
  careProfile: HPPMCareProfile;
  personalizedRecommendations: HPPMPersonalizedRecommendation[];
  responseInsights: HPPMResponseInsight[];
  personalizedGoals: HPPMPersonalizedGoal[];
  adherenceAssessment: HPPMAdherenceAssessment;
  sharedDecisionReport: HPPMSharedDecisionReport;
  futureReadyProfile: HPPMFutureReadyProfile;
  explainabilityChain: HCKEPEvidenceChain;
  telemetryPublished: boolean;
  evaluatedAt: Date;
  latencyMs: number;
}
