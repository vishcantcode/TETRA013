import { SupportedLanguage } from './LanguageProfile';
import { VernacularHealthSummary } from './PatientSummary';
import { LifestylePlan } from './LifestylePlan';
import { ReminderPlan } from './ReminderPlan';

export interface ActionPlanGoals {
  topThreePriorities: string[];
  dailyGoals: string[];
  weeklyGoals: string[];
  monthlyFollowupGoals: string[];
  redFlagSymptoms: string[];
  emergencyContactInstructions: string;
}

export interface AudioGuidancePayload {
  language: SupportedLanguage;
  scriptText: string;
  estimatedDurationSeconds: number;
  readyForTTS: boolean;
}

export interface PersonalizedEducationPlan {
  patientId: string;
  createdAt: string;
  selectedLanguage: SupportedLanguage;
  summary: VernacularHealthSummary;
  lifestylePlan: LifestylePlan;
  reminderPlan: ReminderPlan;
  actionPlan: ActionPlanGoals;
  audioGuidance: AudioGuidancePayload;
  printableSheetHtml: string;
}
