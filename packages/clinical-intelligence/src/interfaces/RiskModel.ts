import { RiskSeverityTier } from '@healthsense/clinical-models';
import { ClinicalFeatureVector } from './PatientSnapshot';

export interface ContributingFactor {
  metric: string;
  value: string | number;
  impactPercentage: number;
  rationale: string;
}

export interface DiseaseRiskResult {
  diseaseId: 'diabetes' | 'hypertension' | 'ckd' | 'cvd' | 'stroke';
  diseaseName: string;
  riskScore: number; // 0 to 100
  severityTier: RiskSeverityTier;
  confidenceScore: number; // 0 to 1.0
  contributingFactors: ContributingFactor[];
  requiredInputs: string[];
  missingInputs: string[];
}

export interface IDiseaseRiskModel {
  diseaseId: 'diabetes' | 'hypertension' | 'ckd' | 'cvd' | 'stroke';
  diseaseName: string;
  calculateRisk(features: ClinicalFeatureVector): DiseaseRiskResult;
  calculateConfidence(features: ClinicalFeatureVector): number;
  requiredInputs(): string[];
  missingInputs(features: ClinicalFeatureVector): string[];
  riskCategory(score: number): RiskSeverityTier;
}
