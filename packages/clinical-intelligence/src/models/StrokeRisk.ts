import { RiskSeverityTier } from '@healthsense/clinical-models';
import { ClinicalFeatureVector } from '../interfaces/PatientSnapshot';
import { IDiseaseRiskModel, DiseaseRiskResult, ContributingFactor } from '../interfaces/RiskModel';
import { getRiskTierFromScore } from '../utils/RiskCategory';

export class StrokeRiskModel implements IDiseaseRiskModel {
  public diseaseId: 'stroke' = 'stroke';
  public diseaseName = 'Ischemic Stroke Risk';

  public requiredInputs(): string[] {
    return ['Blood Pressure', 'Age', 'Diabetes Status', 'Prior Vascular Disease'];
  }

  public missingInputs(features: ClinicalFeatureVector): string[] {
    const missing: string[] = [];
    if (features.systolicBP === null) missing.push('Systolic Blood Pressure');
    return missing;
  }

  public calculateConfidence(features: ClinicalFeatureVector): number {
    let score = 0.60;
    if (features.systolicBP !== null) score += 0.30;
    if (features.hba1c !== null) score += 0.10;
    return Number(Math.min(1.0, Math.max(0.1, score)).toFixed(2));
  }

  public riskCategory(score: number): RiskSeverityTier {
    return getRiskTierFromScore(score);
  }

  public calculateRisk(features: ClinicalFeatureVector): DiseaseRiskResult {
    const factors: ContributingFactor[] = [];
    let riskScore = 6;

    // 1. CHA2DS2-VASc Age Factor
    if (features.age >= 75) {
      riskScore += 35;
      factors.push({ metric: 'Age', value: `${features.age} yrs`, impactPercentage: 30, rationale: 'Age ≥ 75 yrs (+2 CHA2DS2-VASc score equivalent)' });
    } else if (features.age >= 65) {
      riskScore += 20;
      factors.push({ metric: 'Age', value: `${features.age} yrs`, impactPercentage: 20, rationale: 'Age 65-74 yrs (+1 CHA2DS2-VASc score equivalent)' });
    }

    // 2. Hypertension Factor
    const sbp = features.systolicBP ?? 120;
    if (sbp >= 160) {
      riskScore += 35;
      factors.push({ metric: 'Systolic BP', value: `${sbp} mmHg`, impactPercentage: 30, rationale: 'Severe Hypertensive strain on cerebral vasculature' });
    } else if (sbp >= 140) {
      riskScore += 25;
      factors.push({ metric: 'Systolic BP', value: `${sbp} mmHg`, impactPercentage: 20, rationale: 'Stage 2 Hypertension stroke risk multiplier' });
    }

    // 3. Diabetes Factor
    if (features.hba1c !== null && features.hba1c >= 6.5) {
      riskScore += 20;
      factors.push({ metric: 'Diabetes Mellitus', value: `HbA1c ${features.hba1c}%`, impactPercentage: 20, rationale: 'Diabetes (+1 CHA2DS2-VASc score equivalent)' });
    }

    // 4. CKD Co-factor
    if (features.egfr !== null && features.egfr < 60) {
      riskScore += 15;
      factors.push({ metric: 'eGFR', value: `${features.egfr} mL/min`, impactPercentage: 15, rationale: 'Chronic Kidney Disease accelerates vascular calcification & stroke' });
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
