export interface FeatureAttribution {
  featureName: string;
  value: string | number;
  weightPercentage: number; // SHAP-style % contribution
  direction: 'positive' | 'negative' | 'neutral';
  clinicalImpact: string;
}

export interface DiseaseFeatureAttribution {
  diseaseId: string;
  diseaseName: string;
  topPositiveContributors: FeatureAttribution[];
  topNegativeContributors: FeatureAttribution[];
  missingDataImpact: string[];
}
