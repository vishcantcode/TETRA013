import { GuidelineSource } from '@healthsense/clinical-models';

export interface FeatureContribution {
  featureName: string;
  value: string | number;
  weightPercentage: number; // SHAP-style % attribution
  direction: 'positive' | 'negative';
}

export interface GuidelineEvidence {
  source: GuidelineSource;
  title: string;
  section: string;
  citationText: string;
  url?: string;
}

export interface RecommendationReason {
  finding: string;
  rationale: string;
  evidence: GuidelineEvidence[];
}

export interface Explanation {
  patientId: string;
  diseaseId: string;
  clinicianSummary: string;
  patientFriendlySummary: string;
  featureAttributions: FeatureContribution[];
  guidelineEvidence: GuidelineEvidence[];
}
