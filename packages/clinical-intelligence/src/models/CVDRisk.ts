import { RiskSeverityTier } from '@healthsense/clinical-models';
import { ClinicalFeatureVector } from '../interfaces/PatientSnapshot';
import { IDiseaseRiskModel, DiseaseRiskResult, ContributingFactor } from '../interfaces/RiskModel';
import { getRiskTierFromScore } from '../utils/RiskCategory';

export class CVDRiskModel implements IDiseaseRiskModel {
  public diseaseId: 'cvd' = 'cvd';
  public diseaseName = 'Cardiovascular Disease (ASCVD)';

  public requiredInputs(): string[] {
    return ['Systolic Blood Pressure', 'Total Cholesterol', 'Age', 'Smoking Status'];
  }

  public missingInputs(features: ClinicalFeatureVector): string[] {
    const missing: string[] = [];
    if (features.systolicBP === null) missing.push('Systolic Blood Pressure');
    if (features.totalCholesterol === null) missing.push('Total Cholesterol');
    return missing;
  }

  public calculateConfidence(features: ClinicalFeatureVector): number {
    let score = 0.50;
    if (features.systolicBP !== null) score += 0.25;
    if (features.totalCholesterol !== null) score += 0.25;
    return Number(Math.min(1.0, Math.max(0.1, score)).toFixed(2));
  }

  public riskCategory(score: number): RiskSeverityTier {
    return getRiskTierFromScore(score);
  }

  public calculateRisk(features: ClinicalFeatureVector): DiseaseRiskResult {
    const factors: ContributingFactor[] = [];
    let riskScore = 10;

    // 1. Age Factor (WHO / ASCVD Matrix)
    if (features.age >= 65) {
      riskScore += 25;
      factors.push({ metric: 'Age', value: `${features.age} yrs`, impactPercentage: 20, rationale: 'Advanced vascular age factor (≥ 65 yrs)' });
    } else if (features.age >= 50) {
      riskScore += 15;
      factors.push({ metric: 'Age', value: `${features.age} yrs`, impactPercentage: 15, rationale: 'Elevated baseline cardiovascular risk (50-64 yrs)' });
    }

    // 2. Blood Pressure Impact
    const sbp = features.systolicBP ?? 120;
    if (sbp >= 160) {
      riskScore += 35;
      factors.push({ metric: 'Systolic BP', value: `${sbp} mmHg`, impactPercentage: 30, rationale: 'Severe Systolic Hypertension (≥ 160 mmHg)' });
    } else if (sbp >= 140) {
      riskScore += 25;
      factors.push({ metric: 'Systolic BP', value: `${sbp} mmHg`, impactPercentage: 20, rationale: 'Stage 2 Systolic Hypertension (140-159 mmHg)' });
    }

    // 3. Cholesterol Level
    if (features.totalCholesterol !== null) {
      if (features.totalCholesterol >= 240) {
        riskScore += 25;
        factors.push({ metric: 'Total Cholesterol', value: `${features.totalCholesterol} mg/dL`, impactPercentage: 20, rationale: 'Severe Hypercholesterolemia (≥ 240 mg/dL)' });
      } else if (features.totalCholesterol >= 200) {
        riskScore += 15;
        factors.push({ metric: 'Total Cholesterol', value: `${features.totalCholesterol} mg/dL`, impactPercentage: 15, rationale: 'Borderline high cholesterol (200-239 mg/dL)' });
      }
    }

    // 4. Diabetes Multiplier
    if (features.hba1c !== null && features.hba1c >= 6.5) {
      riskScore += 20;
      factors.push({ metric: 'Type 2 Diabetes', value: `HbA1c ${features.hba1c}%`, impactPercentage: 20, rationale: 'Diabetes mellitus is a major independent ASCVD risk multiplier' });
    }

    // 5. Smoking Status
    if (features.smoking) {
      riskScore += 20;
      factors.push({ metric: 'Tobacco Use', value: 'Active Smoker', impactPercentage: 20, rationale: 'Active smoking significantly elevates vascular occlusion risk' });
    }

    const finalScore = Math.min(100, Math.max(5, riskScore));
    return {
      diseaseId: this.diseaseId,
      diseaseName: this.diseaseName,
      riskScore: finalScore,
      severityTier: this.riskCategory(finalScore),
      confidenceScore: this.calculateConfidence(features),
      contributingFactors: factors,
      requiredInputs: this.requiredInputs(),
      missingInputs: this.missingInputs(features)
    };
  }
}
