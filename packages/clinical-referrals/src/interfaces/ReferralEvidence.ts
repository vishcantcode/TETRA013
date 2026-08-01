import { GuidelineSource } from '@healthsense/clinical-models';

export interface ReferralEvidence {
  clinicalBiomarkers: { metric: string; value: string | number }[];
  highestContributingRiskFactors: string[];
  triggeredGuidelines: { source: GuidelineSource; title: string; section: string }[];
  confidenceScore: number;
}
