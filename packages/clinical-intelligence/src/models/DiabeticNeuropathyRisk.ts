import { RiskSeverityTier } from '@healthsense/clinical-models';
import { ClinicalFeatureVector } from '../interfaces/PatientSnapshot';
import { IDiseaseRiskModel, DiseaseRiskResult, ContributingFactor } from '../interfaces/RiskModel';
import { getRiskTierFromScore } from '../utils/RiskCategory';

export class DiabeticNeuropathyRiskModel implements IDiseaseRiskModel {
  public diseaseId: 'diabetic_neuropathy' = 'diabetic_neuropathy';
  public diseaseName = 'Diabetic Peripheral Neuropathy';

  public requiredInputs(): string[] {
    return ['HbA1c', 'Diabetes Duration', 'Age', 'eGFR'];
  }

  public missingInputs(features: ClinicalFeatureVector): string[] {
    const missing: string[] = [];
    if (features.hba1c === null) missing.push('HbA1c');
    return missing;
  }

  public calculateConfidence(features: ClinicalFeatureVector): number {
    let score = 0.60;
    if (features.hba1c !== null) score += 0.25;
    if (features.egfr !== null) score += 0.15;
    return Number(Math.min(1.0, Math.max(0.1, score)).toFixed(2));
  }

  public riskCategory(score: number): RiskSeverityTier {
    return getRiskTierFromScore(score);
  }

  public calculateRisk(features: ClinicalFeatureVector): DiseaseRiskResult {
    const factors: ContributingFactor[] = [];
    let riskScore = 10;

    const hasDiabetes = features.hba1c !== null && features.hba1c >= 6.5 ||
      features.activeConditions.some(c => c.toLowerCase().includes('diabet'));

    if (hasDiabetes) {
      riskScore += 30;
      factors.push({ metric: 'Diabetes Status', value: 'Active', impactPercentage: 35, rationale: 'Established Type 2 Diabetes is primary driver of peripheral nerve damage' });

      if (features.hba1c !== null) {
        if (features.hba1c >= 9.0) {
          riskScore += 35;
          factors.push({ metric: 'HbA1c', value: `${features.hba1c}%`, impactPercentage: 40, rationale: 'Severe chronic hyperglycemia (HbA1c ≥ 9.0%) accelerates distal symmetric polyneuropathy' });
        } else if (features.hba1c >= 7.5) {
          riskScore += 20;
          factors.push({ metric: 'HbA1c', value: `${features.hba1c}%`, impactPercentage: 25, rationale: 'Suboptimal glycemic control (HbA1c ≥ 7.5%)' });
        }
      }

      if (features.age >= 50) {
        riskScore += 15;
        factors.push({ metric: 'Age', value: `${features.age} yrs`, impactPercentage: 15, rationale: 'Age ≥ 50 increases microvascular nerve ischemia risk' });
      }

      if (features.smoking) {
        riskScore += 10;
        factors.push({ metric: 'Smoking Status', value: 'Active', impactPercentage: 10, rationale: 'Tobacco use accelerates microvascular ischemic nerve injury' });
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
      reasoning: 'Evaluated microvascular nerve ischemia risk based on ADA 2025 Neuropathy Position Statement & ICMR 2024 protocols.',
      clinicalSummary: finalScore >= 60 ? 'High risk for Diabetic Peripheral Neuropathy. Annual 10-g monofilament & vibration testing mandatory.' : 'Low to moderate neuropathy risk.',
      guidelineReferences: ['ADA 2025 Standards of Care - Microvascular Complications & Foot Care', 'ICMR 2024 Guidelines for Management of Diabetes']
    };
  }
}
