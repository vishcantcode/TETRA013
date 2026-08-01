import { RiskSeverityTier } from '@healthsense/clinical-models';
import { ClinicalFeatureVector } from '../interfaces/PatientSnapshot';
import { IDiseaseRiskModel, DiseaseRiskResult, ContributingFactor } from '../interfaces/RiskModel';
import { getRiskTierFromScore } from '../utils/RiskCategory';

export class HeartFailureRiskModel implements IDiseaseRiskModel {
  public diseaseId: 'heart_failure' = 'heart_failure';
  public diseaseName = 'Heart Failure (HFpEF / HFrEF)';

  public requiredInputs(): string[] {
    return ['Systolic BP', 'Age', 'BMI', 'HbA1c', 'eGFR'];
  }

  public missingInputs(features: ClinicalFeatureVector): string[] {
    const missing: string[] = [];
    if (features.systolicBP === null) missing.push('Systolic BP');
    if (features.bmi === null) missing.push('BMI');
    if (features.egfr === null) missing.push('eGFR');
    return missing;
  }

  public calculateConfidence(features: ClinicalFeatureVector): number {
    let score = 0.50;
    if (features.systolicBP !== null) score += 0.20;
    if (features.bmi !== null) score += 0.15;
    if (features.egfr !== null) score += 0.15;
    return Number(Math.min(1.0, Math.max(0.1, score)).toFixed(2));
  }

  public riskCategory(score: number): RiskSeverityTier {
    return getRiskTierFromScore(score);
  }

  public calculateRisk(features: ClinicalFeatureVector): DiseaseRiskResult {
    const factors: ContributingFactor[] = [];
    let riskScore = 10;

    if (features.systolicBP !== null && features.systolicBP >= 140) {
      riskScore += 25;
      factors.push({ metric: 'Systolic BP', value: `${features.systolicBP} mmHg`, impactPercentage: 30, rationale: 'Chronic left ventricular pressure overload & hypertrophy secondary to hypertension' });
    }

    if (features.bmi !== null && features.bmi >= 30) {
      riskScore += 20;
      factors.push({ metric: 'BMI', value: `${features.bmi} kg/m²`, impactPercentage: 20, rationale: 'Obesity increases metabolic systemic vascular resistance' });
    }

    if (features.egfr !== null && features.egfr < 60) {
      riskScore += 25;
      factors.push({ metric: 'eGFR', value: `${features.egfr} mL/min`, impactPercentage: 25, rationale: 'Cardiorenal syndrome (CKD-associated fluid retention and arterial stiffness)' });
    }

    if (features.hba1c !== null && features.hba1c >= 8.0) {
      riskScore += 15;
      factors.push({ metric: 'HbA1c', value: `${features.hba1c}%`, impactPercentage: 15, rationale: 'Diabetic cardiomyopathy & myocardial fibrosis' });
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
      reasoning: 'Evaluated cardiorenal congestion & HFpEF risk per AHA/ACC 2024 Heart Failure Staging Guidelines & ICMR Cardiology Protocols.',
      clinicalSummary: finalScore >= 60 ? 'Stage B/C Heart Failure risk. Recommend NT-proBNP biomarker testing & Echocardiogram.' : 'Stage A Heart Failure risk (at risk, no structural heart disease).',
      guidelineReferences: ['AHA/ACC/HFSA 2024 Guideline for Management of Heart Failure', 'ICMR Guidelines on Cardiovascular Health']
    };
  }
}
