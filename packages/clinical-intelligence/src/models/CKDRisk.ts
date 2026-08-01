import { RiskSeverityTier } from '@healthsense/clinical-models';
import { ClinicalFeatureVector } from '../interfaces/PatientSnapshot';
import { IDiseaseRiskModel, DiseaseRiskResult, ContributingFactor } from '../interfaces/RiskModel';
import { getRiskTierFromScore } from '../utils/RiskCategory';

export class CKDRiskModel implements IDiseaseRiskModel {
  public diseaseId: 'ckd' = 'ckd';
  public diseaseName = 'Chronic Kidney Disease';

  public requiredInputs(): string[] {
    return ['eGFR', 'Urine Albumin-to-Creatinine Ratio (UACR)', 'Serum Creatinine'];
  }

  public missingInputs(features: ClinicalFeatureVector): string[] {
    const missing: string[] = [];
    if (features.egfr === null) missing.push('eGFR');
    if (features.uacr === null) missing.push('Urine Albumin-to-Creatinine Ratio (UACR)');
    return missing;
  }

  public calculateConfidence(features: ClinicalFeatureVector): number {
    let score = 0.40;
    if (features.egfr !== null) score += 0.35;
    if (features.uacr !== null) score += 0.25;
    return Number(Math.min(1.0, Math.max(0.1, score)).toFixed(2));
  }

  public riskCategory(score: number): RiskSeverityTier {
    return getRiskTierFromScore(score);
  }

  public calculateRisk(features: ClinicalFeatureVector): DiseaseRiskResult {
    const factors: ContributingFactor[] = [];
    let riskScore = 8;

    // 1. eGFR KDIGO Staging
    if (features.egfr !== null) {
      if (features.egfr < 15) {
        riskScore += 85;
        factors.push({ metric: 'eGFR', value: `${features.egfr} mL/min/1.73m2`, impactPercentage: 50, rationale: 'G5: Kidney Failure (< 15 mL/min)' });
      } else if (features.egfr < 30) {
        riskScore += 75;
        factors.push({ metric: 'eGFR', value: `${features.egfr} mL/min/1.73m2`, impactPercentage: 45, rationale: 'G4: Severe eGFR reduction (15-29 mL/min)' });
      } else if (features.egfr < 45) {
        riskScore += 65;
        factors.push({ metric: 'eGFR', value: `${features.egfr} mL/min/1.73m2`, impactPercentage: 40, rationale: 'G3b: Moderate to severe eGFR reduction (30-44 mL/min)' });
      } else if (features.egfr < 60) {
        riskScore += 45;
        factors.push({ metric: 'eGFR', value: `${features.egfr} mL/min/1.73m2`, impactPercentage: 30, rationale: 'G3a: Mild to moderate eGFR reduction (45-59 mL/min)' });
      }
    }

    // 2. UACR Albuminuria Staging
    if (features.uacr !== null) {
      if (features.uacr > 300) {
        riskScore += 35;
        factors.push({ metric: 'UACR', value: `${features.uacr} mg/g`, impactPercentage: 30, rationale: 'A3: Severe Macroalbuminuria (> 300 mg/g)' });
      } else if (features.uacr >= 30) {
        riskScore += 25;
        factors.push({ metric: 'UACR', value: `${features.uacr} mg/g`, impactPercentage: 20, rationale: 'A2: Moderate Microalbuminuria (30-300 mg/g)' });
      }
    }

    // 3. Diabetes / HTN Risk Multiplier
    if (features.hba1c !== null && features.hba1c >= 8.0) {
      riskScore += 15;
      factors.push({ metric: 'Uncontrolled HbA1c', value: `${features.hba1c}%`, impactPercentage: 15, rationale: 'Diabetic Nephropathy progression multiplier' });
    }

    if (features.activeConditions.some(c => c.toLowerCase().includes('kidney') || c.toLowerCase().includes('ckd'))) {
      riskScore = Math.max(riskScore, 85);
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
