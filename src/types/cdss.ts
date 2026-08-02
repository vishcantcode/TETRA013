export interface ValidationIssue {
  parameter: string;
  value: any;
  severity: 'Warning' | 'Caution' | 'Error';
  message: string;
  recommendation: string;
}

export interface ValidationResult {
  isValid: boolean;
  qualityScore: number; // 0 to 100
  issues: ValidationIssue[];
  missingMandatoryFields: string[];
  dataCompletenessText: string;
}

export interface FeatureImportance {
  id: string;
  feature: string;
  parameterName: string;
  value: string | number;
  contribution: 'Very High' | 'High' | 'Medium' | 'Low';
  numericalImpactScore: number; // e.g., +32
  reason: string;
  clinicalSignificance: string;
  badgeColor: string;
}

export interface DiseasePrediction {
  disease: string;
  diseaseCode?: string; // e.g. ICD-10
  riskPercentage: number; // 0 to 100
  category: 'Low' | 'Moderate' | 'High';
  confidence: 'High' | 'Medium' | 'Low';
  confidenceScore: number; // e.g., 0.94
  modelVersion: string; // e.g. "v2.4-XGB-Ensemble"
  timestamp: string;
  description: string;
  contributoryFeatures: FeatureImportance[];
}

export interface GuidelineRuleRecommendation {
  id: string;
  ruleId: string;
  guidelineSource: string; // e.g. "ADA 2026 Guidelines Section 10", "ACC/AHA 2025"
  recommendation: string;
  category: 'Lab Test' | 'Vital Check' | 'Screening' | 'Therapeutic Adjustment';
  priority: 'Urgent' | 'High' | 'Recommended' | 'Routine';
  reason: string;
  triggerCondition: string;
  status: 'Missing' | 'Recommended' | 'Completed' | 'Overdue';
}

export interface RuleEngineResult {
  recommendations: GuidelineRuleRecommendation[];
  compliancePercentage: number; // e.g. 68%
  completedCount: number;
  missingCount: number;
  overdueCount: number;
}

export interface EarlyWarningAlert {
  id: string;
  severity: 'Critical' | 'High' | 'Moderate' | 'Low';
  title: string;
  evidence: string;
  observation: string;
  recommendedAction: string;
  timeframe: string;
  badgeColor: string;
}

export interface SpecialistReferral {
  id: string;
  specialist: 'Endocrinologist' | 'Cardiologist' | 'Nephrologist' | 'Neurologist' | 'General Physician' | 'Nutritionist' | 'Ophthalmologist';
  reason: string;
  priority: 'Urgent' | 'High' | 'Recommended' | 'Routine';
  timeline: string; // e.g. "Within 24-48 Hours", "Within 1 Week", "Within 30 Days"
  icd10Context?: string;
  suggestedWorkup: string[];
}

export interface GeminiReasoningOutput {
  executiveSummary: string;
  clinicalSynthesis: string;
  doctorSummaryMarkdown: string;
  patientFriendlySummaryMarkdown: string;
  whyRecommendationsMade: string[];
  followUpAdvice: string;
  isAiGenerated: boolean;
}

export interface PatientEducation {
  doctorVersion: {
    diagnosisConsiderations: string;
    therapeuticPlan: string;
    medicalNutritionTherapy: string;
    exerciseAndFollowUp: string;
    guidelineCitations: string[];
  };
  patientVersion: {
    whatResultsMean: string;
    healthyEatingTips: string[];
    physicalActivityGuidance: string;
    medicationAndMonitoringTips: string;
    redFlagSymptomsToWatch: string[];
  };
}

export interface ConfidenceBreakdown {
  overallConfidenceScore: number; // e.g. 94%
  confidenceLevel: 'High' | 'Medium' | 'Low';
  confidenceDrivers: string[];
  missingInformation: string[];
  suggestedAdditionalTestsToBoostConfidence: string[];
  dataQualityRating: string;
}

export interface StructuredClinicalReport {
  reportId: string;
  generatedAt: string;
  patientHeader: {
    id: string;
    mrn: string;
    name: string;
    age: number;
    gender: string;
    doctorName: string;
  };
  executiveSummary: string;
  dataValidationSummary: ValidationResult;
  diseaseRiskMatrix: DiseasePrediction[];
  topRiskFactors: FeatureImportance[];
  ruleBasedRecommendations: GuidelineRuleRecommendation[];
  earlyWarningAlerts: EarlyWarningAlert[];
  referralRecommendations: SpecialistReferral[];
  patientEducation: PatientEducation;
  confidenceBreakdown: ConfidenceBreakdown;
  doctorNotes?: string;
}

export interface CdssPipelineResult {
  validation: ValidationResult;
  predictions: DiseasePrediction[];
  featureImportance: FeatureImportance[];
  ruleEngine: RuleEngineResult;
  earlyWarnings: EarlyWarningAlert[];
  referrals: SpecialistReferral[];
  patientEducation: PatientEducation;
  confidence: ConfidenceBreakdown;
  report: StructuredClinicalReport;
  geminiReasoning?: GeminiReasoningOutput;
}

/**
 * Predictor Interface so that future trained ML models (e.g., Python microservices,
 * ONNX models, or custom API endpoints) can be plugged in seamlessly.
 */
export interface PredictorInterface {
  predictRisk(patientData: any): Promise<DiseasePrediction[]> | DiseasePrediction[];
}
