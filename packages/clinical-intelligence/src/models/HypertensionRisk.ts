import { RiskSeverityTier } from '@healthsense/clinical-models';
import { ClinicalFeatureVector } from '../interfaces/PatientSnapshot';
import { IDiseaseRiskModel, DiseaseRiskResult, ContributingFactor } from '../interfaces/RiskModel';
import { getRiskTierFromScore } from '../utils/RiskCategory';

export class HypertensionRiskModel implements IDiseaseRiskModel {
  public diseaseId: 'hypertension' = 'hypertension';
  public diseaseName = 'Essential Hypertension';

  public requiredInputs(): string[] {
    return ['Systolic Blood Pressure', 'Diastolic Blood Pressure', 'Age'];
  }

  public missingInputs(features: ClinicalFeatureVector): string[] {
    const missing: string[] = [];
    if (features.systolicBP === null) missing.push('Systolic Blood Pressure');
    if (features.diastolicBP === null) missing.push('Diastolic Blood Pressure');
    return missing;
  }

  public calculateConfidence(features: ClinicalFeatureVector): number {
    let score = 0.50;
    if (features.systolicBP !== null) score += 0.25;
    if (features.diastolicBP !== null) score += 0.25;
    return Number(Math.min(1.0, Math.max(0.1, score)).toFixed(2));
  }

  public riskCategory(score: number): RiskSeverityTier {
    return getRiskTierFromScore(score);
  }

  public calculateRisk(features: ClinicalFeatureVector): DiseaseRiskResult {
    const factors: ContributingFactor[] = [];
    let riskScore = 10;

    const sbp = features.systolicBP ?? 120;
    const dbp = features.diastolicBP ?? 80;

    if (sbp >= 180 || dbp >= 120) {
      riskScore += 80;
      factors.push({ metric: 'Systolic/Diastolic BP', value: `${sbp}/${dbp} mmHg`, impactPercentage: 50, rationale: 'Hypertensive Urgency/Crisis threshold (≥ 180/120 mmHg)' });
    } else if (sbp >= 140 || dbp >= 90) {
      riskScore += 65;
      factors.push({ metric: 'Systolic/Diastolic BP', value: `${sbp}/${dbp} mmHg`, impactPercentage: 40, rationale: 'Stage 2 Hypertension (≥ 140/90 mmHg per AHA 2017)' });
    } else if (sbp >= 130 || dbp >= 80) {
      riskScore += 40;
      factors.push({ metric: 'Systolic/Diastolic BP', value: `${sbp}/${dbp} mmHg`, impactPercentage: 25, rationale: 'Stage 1 Hypertension (130-139 / 80-89 mmHg)' });
    } else if (sbp >= 120) {
      riskScore += 20;
      factors.push({ metric: 'Systolic BP', value: `${sbp} mmHg`, impactPercentage: 15, rationale: 'Elevated Blood Pressure (120-129 mmHg)' });
    }

    if (features.activeConditions.some(c => c.toLowerCase().includes('hypertension'))) {
      riskScore = Math.max(riskScore, 75);
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
