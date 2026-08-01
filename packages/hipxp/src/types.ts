// ============================================================================
// HIPXP – Intelligent Patient Experience Platform
// Shared Patient Experience & Companion Types
// ============================================================================

import { HPPHIEvaluationResult as HPPHIPatientEvaluationResult } from '@healthsense/hpphi';
import { HPPMEvaluationResult } from '@healthsense/hppm';
import { HCSOFEvaluationResult } from '@healthsense/hcsof';
import { HECITEvaluationResult } from '@healthsense/hecit';

export type SupportedLanguage = 'en' | 'es' | 'fr';

export interface PersonalHealthCommandCenterView {
  patientId: string;
  patientName: string;
  healthSummary: string;
  activeMedications: { name: string; dosage: string; frequency: string; instructions: string }[];
  allergies: string[];
  recentLabs: { test: string; result: string; status: 'NORMAL' | 'HIGH' | 'LOW'; date: Date }[];
  upcomingAppointments: { appointmentId: string; provider: string; specialty: string; date: Date; location: string }[];
  preventiveRecommendations: HPPHIPatientEvaluationResult;
  personalizedCarePlan: HPPMEvaluationResult;
  healthSimulationSummary?: HCSOFEvaluationResult;
  plainLanguageExplanation?: HECITEvaluationResult;
}

export interface CompanionQuery {
  patientId: string;
  language?: SupportedLanguage;
  questionText: string;
}

export interface CompanionResponse {
  questionText: string;
  answerText: string; // Simplified, patient-friendly language
  simplifiedTerms: { term: string; plainLanguageDefinition: string }[];
  suggestedFollowUpQuestions: string[];
  latencyMs: number;
}

export interface HealthGoal {
  goalId: string;
  title: string;
  category: 'BLOOD_PRESSURE' | 'GLUCOSE' | 'EXERCISE' | 'WEIGHT' | 'MEDICATION_ADHERENCE';
  targetValue: string;
  currentValue: string;
  progressPercent: number;
  status: 'IN_PROGRESS' | 'ACHIEVED' | 'NEEDS_ATTENTION';
}

export interface JourneyMilestone {
  milestoneId: string;
  title: string;
  description: string;
  achievedAt?: Date;
  completed: boolean;
}

export interface PatientMessage {
  messageId: string;
  sender: 'PATIENT' | 'CARE_TEAM' | 'AI_COMPANION';
  content: string;
  sentAt: Date;
}

export interface HomeVitalsLog {
  logId: string;
  patientId: string;
  metric: 'Systolic BP' | 'Diastolic BP' | 'Heart Rate' | 'Blood Glucose' | 'Weight';
  value: number;
  unit: string;
  loggedAt: Date;
}

export interface PatientAchievement {
  achievementId: string;
  badgeName: string;
  description: string;
  unlockedAt: Date;
  icon: string;
}

export interface AccessibilityConfig {
  language: SupportedLanguage;
  fontScale: 'NORMAL' | 'LARGE' | 'EXTRA_LARGE';
  highContrastMode: boolean;
  screenReaderOptimized: boolean;
}
