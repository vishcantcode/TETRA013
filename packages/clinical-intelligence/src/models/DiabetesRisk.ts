import { RiskSeverityTier } from '@healthsense/clinical-models';
import { ClinicalFeatureVector } from '../interfaces/PatientSnapshot';
import { IDiseaseRiskModel, DiseaseRiskResult, ContributingFactor } from '../interfaces/RiskModel';
import { getRiskTierFromScore } from '../utils/RiskCategory';

export class DiabetesRiskModel implements IDiseaseRiskModel {
  public diseaseId: 'diabetes' = 'diabetes';
  public diseaseName = 'Type 2 Diabetes Mellitus';

  public requiredInputs(): string[] {
    return ['HbA1c', 'Fasting Plasma Glucose', 'BMI', 'Age'];
  }

  public missingInputs(features: ClinicalFeatureVector): string[] {
    const missing: string[] = [];
    if (features.hba1c === null) missing.push('HbA1c');
    if (features.fastingGlucose === null) missing.push('Fasting Plasma Glucose');
    if (features.bmi === null) missing.push('BMI');
    return missing;
  }

  public calculateConfidence(features: ClinicalFeatureVector): number {
    let score = 0.50;
    if (features.hba1c !== null) score += 0.30;
    if (features.fastingGlucose !== null) score += 0.15;
    if (features.bmi !== null) score += 0.05;
    return Number(Math.min(1.0, Math.max(0.1, score)).toFixed(2));
  }

  public riskCategory(score: number): RiskSeverityTier {
    return getRiskTierFromScore(score);
  }

  public calculateRisk(features: ClinicalFeatureVector): DiseaseRiskResult {
    const factors: ContributingFactor[] = [];
    let riskScore = 10; // Baseline age risk

    // 1. HbA1c Evaluation (Primary Indicator)
    if (features.hba1c !== null) {
      if (features.hba1c >= 8.5) {
        riskScore += 75;
        factors.push({ metric: 'HbA1c', value: `${features.hba1c}%`, impactPercentage: 45, rationale: 'Severe uncontrolled hyperglycemia (HbA1c ≥ 8.5%)' });
      } else if (features.hba1c >= 6.5) {
        riskScore += 65;
        factors.push({ metric: 'HbA1c', value: `${features.hba1c}%`, impactPercentage: 40, rationale: 'Diagnostic for Type 2 Diabetes (HbA1c ≥ 6.5%)' });
      } else if (features.hba1c >= 5.7) {
        riskScore += 40;
        factors.push({ metric: 'HbA1c', value: `${features.hba1c}%`, impactPercentage: 30, rationale: 'Elevated prediabetic range (5.7% - 6.4%)' });
      }
    }

    // 2. Fasting Plasma Glucose
    if (features.fastingGlucose !== null) {
      if (features.fastingGlucose >= 126) {
        riskScore += 20;
        factors.push({ metric: 'Fasting Glucose', value: `${features.fastingGlucose} mg/dL`, impactPercentage: 20, rationale: 'Impaired fasting glucose ≥ 126 mg/dL' });
      } else if (features.fastingGlucose >= 100) {
        riskScore += 10;
        factors.push({ metric: 'Fasting Glucose', value: `${features.fastingGlucose} mg/dL`, impactPercentage: 10, rationale: 'Borderline fasting glucose (100-125 mg/dL)' });
      }
    }

    // 3. BMI Impact
    if (features.bmi !== null && features.bmi >= 25.0) {
      riskScore += 12;
      factors.push({ metric: 'BMI', value: `${features.bmi} kg/m2`, impactPercentage: 10, rationale: 'Overweight / Obesity status for Asian Indian demographic' });
    }

    // 4. Active Conditions Check
    if (features.activeConditions.some(c => c.toLowerCase().includes('diabetes'))) {
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
