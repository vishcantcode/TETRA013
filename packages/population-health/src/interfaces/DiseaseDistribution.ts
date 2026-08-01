export interface DiseasePrevalence {
  diseaseId: 'diabetes' | 'hypertension' | 'ckd' | 'cvd' | 'stroke';
  diseaseName: string;
  casesCount: number;
  prevalencePercentage: number;
}

export interface RiskTierProportions {
  lowPercentage: number;
  moderatePercentage: number;
  highPercentage: number;
  severePercentage: number;
}

export interface MultimorbidityOverlap {
  singleDiseaseCount: number;
  twoDiseasesCount: number;
  threeOrMoreDiseasesCount: number;
  multimorbidPercentage: number;
}
