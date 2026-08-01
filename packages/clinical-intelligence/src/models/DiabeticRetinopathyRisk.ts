import { RiskSeverityTier } from '@healthsense/clinical-models';
import { ClinicalFeatureVector } from '../interfaces/PatientSnapshot';
import { IDiseaseRiskModel, DiseaseRiskResult, ContributingFactor } from '../interfaces/RiskModel';
import { getRiskTierFromScore } from '../utils/RiskCategory';

export class DiabeticRetinopathyRiskModel implements IDiseaseRiskModel {
  public diseaseId: 'diabetic_retinopathy' = 'diabetic_retinopathy';
  public diseaseName = 'Diabetic Retinopathy';

  public requiredInputs(): string[] {
    return ['HbA1c', 'Systolic BP', 'Duration of Diabetes', 'Lipids'];
  }

  public missingInputs(features: ClinicalFeatureVector): string[] {
    const missing: string[] = [];
    if (features.hba1c === null) missing.push('HbA1c');
    if (features.systolicBP === null) missing.push('Systolic BP');
    return missing;
  }

  public calculateConfidence(features: ClinicalFeatureVector): number {
    let score = 0.55;
    if (features.hba1c !== null) score += 0.25;
    if (features.systolicBP !== null) score += 0.20;
    return Number(Math.min(1.0, Math.max(0.1, score)).toFixed(2));
  }

  public riskCategory(score: number): RiskSeverityTier {
    return getRiskTierFromScore(score);
  }

  public calculateRisk(features: ClinicalFeatureVector): DiseaseRiskResult {
    const factors: ContributingFactor[] = [];
    let riskScore = 8;

    const hasDiabetes = (features.hba1c !== null && features.hba1c >= 6.5) ||
      features.activeConditions.some(c => c.toLowerCase().includes('diabet'));

    if (hasDiabetes) {
      riskScore += 25;
      factors.push({ metric: 'Diabetes Status', value: 'Active', impactPercentage: 30, rationale: 'Chronic hyperglycemia causes retinal capillary microaneurysms and exudates' });

      if (features.hba1c !== null) {
        if (features.hba1c >= 8.5) {
          riskScore += 35;
          factors.push({ metric: 'HbA1c', value: `${features.hba1c}%`, impactPercentage: 35, rationale: 'Uncontrolled glycemia (HbA1c ≥ 8.5%) heavily accelerates proliferative retinopathy' });
        } else if (features.hba1c >= 7.0) {
          riskScore += 20;
          factors.push({ metric: 'HbA1c', value: `${features.hba1c}%`, impactPercentage: 20, rationale: 'Elevated HbA1c (≥ 7.0%)' });
        }
      }

      if (features.systolicBP !== null && features.systolicBP >= 140) {
        riskScore += 20;
        factors.push({ metric: 'Systolic BP', value: `${features.systolicBP} mmHg`, impactPercentage: 20, rationale: 'Co-existing hypertension increases retinal vascular shear stress & macular edema risk' });
      }
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
      missingInputs: this.missingInputs(features),
      reasoning: 'Retinopathy microvascular assessment per ADA 2025 Retinopathy Guidelines & ICMR Tele-Ophthalmology Screening Standards.',
      clinicalSummary: finalScore >= 60 ? 'Urgent recommendation for Dilated Fundus Examination (DFE) by ophthalmologist within 30 days.' : 'Routine annual dilated eye examination recommended.',
      guidelineReferences: ['ADA 2025 Standards of Care - Retinopathy Screening', 'ICMR Guidelines for Prevention of Diabetic Blindness']
    };
  }
}
