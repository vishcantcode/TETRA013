import { GuidelineSource } from '@healthsense/clinical-models';
import { ClinicalFeatureVector } from './PatientSnapshot';

export interface TriggeredClinicalRule {
  ruleId: string;
  source: GuidelineSource;
  title: string;
  section: string;
  description: string;
  actionRequired?: string;
}

export interface IRuleExecutor {
  evaluateRules(features: ClinicalFeatureVector): TriggeredClinicalRule[];
}
