import { GuidelineSource } from '@healthsense/clinical-models';

export interface GuidelineCitation {
  source: GuidelineSource;
  title: string;
  version: string;
  section: string;
  evidenceLevel: 'Level A (High)' | 'Level B (Moderate)' | 'Level C (Expert Consensus)';
  clinicalRationale: string;
  url?: string;
}
