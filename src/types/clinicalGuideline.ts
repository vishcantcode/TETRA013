import { Patient, Vitals } from '../types';

export type Priority = 'Urgent' | 'High' | 'Medium' | 'Low';

export type DiseaseCategory = 'Diabetes' | 'Hypertension' | 'CKD' | 'Cardiovascular' | 'Stroke';

export interface GuidelineRule {
  ruleId: string;
  ruleName: string;
  disease: DiseaseCategory;
  conditionsDescription: string;
  evaluateCondition: (patient: Patient, customVitals?: Partial<Vitals>) => boolean;
  clinicalReason: string;
  recommendation: string;
  priority: Priority;
  supportingGuideline: string; // e.g. "ADA Standards of Care 2026", "ACC/AHA HTN Guideline", "KDIGO 2025"
}

export type DoctorApprovalStatus = 'Pending' | 'Approved' | 'Modified' | 'Rejected';

export interface GuidelineRuleResult {
  rule: GuidelineRule;
  triggered: boolean;
  approvalStatus: DoctorApprovalStatus;
  doctorNotes?: string;
  modifiedRecommendation?: string;
}

export interface MissingInvestigation {
  id: string;
  investigation: string; // HbA1c, Lipid Profile, Urine Albumin, ECG, eGFR, Fundus Examination, CBC, LFT
  reason: string;
  clinicalImportance: 'Critical' | 'High' | 'Moderate' | 'Routine';
  priority: Priority;
  status: 'Recommended' | 'Overdue' | 'Optional';
  diseaseOrigin: DiseaseCategory;
}

export interface ReferralRecommendation {
  id: string;
  specialist: 'General Physician' | 'Endocrinologist' | 'Cardiologist' | 'Nephrologist' | 'Neurologist' | 'Nutritionist';
  reason: string;
  priority: Priority;
  suggestedTimeline: 'Immediate (< 24h)' | 'Within 1-2 Weeks' | 'Within 1 Month' | 'Routine (3 Months)';
  referralSummary: string;
  diseaseOrigin: DiseaseCategory;
}

export interface FollowUpSchedule {
  id: string;
  interval: '2 weeks' | '1 month' | '3 months' | '6 months' | 'Annual';
  title: string;
  reason: string;
  focusArea: string;
  recommendedTests: string[];
}

export type AlertLevel = 'Normal' | 'Attention Needed' | 'High Risk' | 'Urgent Review' | 'Emergency Referral';

export interface ClinicalAlert {
  id: string;
  alertLevel: AlertLevel;
  title: string;
  reason: string;
  supportingFindings: string[];
  recommendedAction: string;
}

export interface DiseaseRiskSummary {
  disease: DiseaseCategory;
  riskLevel: 'Normal' | 'Attention' | 'High' | 'Critical';
  summary: string;
  triggeredRulesCount: number;
}

export interface GuidelineEngineResult {
  patientId: string;
  evaluatedAt: string;
  allRulesEvaluated: GuidelineRuleResult[];
  triggeredRules: GuidelineRuleResult[];
  missingInvestigations: MissingInvestigation[];
  referrals: ReferralRecommendation[];
  followUpSchedules: FollowUpSchedule[];
  alerts: ClinicalAlert[];
  diseaseRiskSummaries: DiseaseRiskSummary[];
}

export interface PatientCarePlan {
  patientName: string;
  patientMrn: string;
  generatedDate: string;
  plainLanguageSummary: string;
  nextTests: { name: string; reason: string; timeframe: string }[];
  lifestyleAdvice: { category: string; advice: string }[];
  medicationReminders: { name: string; instruction: string }[];
  referralDetails: { specialist: string; purpose: string; timeline: string }[];
  followUpDate: string;
  doctorApprovedBy: string;
}
