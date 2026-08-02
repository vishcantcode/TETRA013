export interface ClinicalReasoningItem {
  disease: string;
  icdCode: string;
  riskCategory: 'Low' | 'Moderate' | 'High' | 'Critical';
  riskPercentage: number;
  clinicalSummary: string;
  riskExplanation: string;
  evidenceUsed: string[];
  confidenceLevel: 'High' | 'Medium' | 'Low';
  confidenceScore: number;
  remainingUncertainty: string;
}

export interface FeatureContribution {
  id: string;
  featureName: string;
  type: 'Positive' | 'Negative' | 'Unknown';
  contributionLevel: 'Very High' | 'High' | 'Medium' | 'Low';
  impactWeightPercent: number; // e.g. +38% or -15%
  valueObserved: string;
  clinicalImportance: string;
  pathophysiology: string;
}

export interface EvidenceParameter {
  id: string;
  parameter: string;
  observedValue: string;
  referenceRange: string;
  status: 'Normal' | 'Abnormal' | 'Elevated' | 'High' | 'Low' | 'Borderline';
  clinicalSignificance: string;
}

export interface ConfidenceAnalysis {
  overallLevel: 'High' | 'Medium' | 'Low';
  overallScore: number;
  highConfidenceReasons: string[];
  reducedConfidenceReasons: string[];
  dataCompletenessRatio: number;
}

export interface MissingInformationItem {
  id: string;
  informationMissing: string;
  potentialEffect: string;
  suggestedInvestigation: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface GuidelineMatchItem {
  id: string;
  recommendation: string;
  supportingGuideline: string; // e.g., "ADA Guideline 2026", "KDIGO 2025"
  reason: string;
  status: 'Recommended' | 'Strongly Recommended' | 'Consider';
}

export interface NextBestAction {
  id: string;
  priority: 'High' | 'Medium' | 'Low';
  action: string;
  reason: string;
  expectedOutcome: string;
}

export interface PatientExplanation {
  headline: string;
  simplifiedExplanation: string;
  keyTakeaways: string[];
  reassuringNote: string;
}

export interface DoctorExplanation {
  majorFindings: string[];
  riskAssessmentSummary: string;
  suggestedWorkup: string[];
  referralAdvice: string;
  clinicalConsiderations: string[];
}

export interface ExplainableAiResult {
  disease: string;
  patientId: string;
  patientName: string;
  generatedAt: string;
  clinicalReasoning: ClinicalReasoningItem;
  featureContributions: FeatureContribution[];
  evidenceParameters: EvidenceParameter[];
  confidenceAnalysis: ConfidenceAnalysis;
  missingInformation: MissingInformationItem[];
  guidelineMatches: GuidelineMatchItem[];
  nextBestActions: NextBestAction[];
  patientExplanation: PatientExplanation;
  doctorExplanation: DoctorExplanation;
  disclaimer: string;
}
