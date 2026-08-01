import { RiskSeverityTier } from '@healthsense/clinical-models';
import { ClinicalFeatureVector } from '../interfaces/PatientSnapshot';
import { IDiseaseRiskModel, DiseaseRiskResult, ContributingFactor } from '../interfaces/RiskModel';
import { getRiskTierFromScore } from '../utils/RiskCategory';

export class MetabolicSyndromeRiskModel implements IDiseaseRiskModel {
  public diseaseId: 'metabolic_syndrome' = 'metabolic_syndrome';
  public diseaseName = 'Metabolic Syndrome';

  public requiredInputs(): string[] {
    return ['Waist Circumference', 'Triglycerides', 'HDL Cholesterol', 'Systolic BP', 'Fasting Glucose'];
  }

  public missingInputs(features: ClinicalFeatureVector): string[] {
    const missing: string[] = [];
    if (features.waistCircumferenceCm === null) missing.push('Waist Circumference');
    if (features.triglycerides === null) missing.push('Triglycerides');
    if (features.hdl === null) missing.push('HDL Cholesterol');
    if (features.systolicBP === null) missing.push('Systolic BP');
    if (features.fastingGlucose === null && features.hba1c === null) missing.push('Fasting Glucose / HbA1c');
    return missing;
  }

  public calculateConfidence(features: ClinicalFeatureVector): number {
    let score = 0.50;
    if (features.waistCircumferenceCm !== null || features.bmi !== null) score += 0.15;
    if (features.triglycerides !== null) score += 0.15;
    if (features.systolicBP !== null) score += 0.10;
    if (features.fastingGlucose !== null || features.hba1c !== null) score += 0.10;
    return Number(Math.min(1.0, Math.max(0.1, score)).toFixed(2));
  }

  public riskCategory(score: number): RiskSeverityTier {
    return getRiskTierFromScore(score);
  }

  public calculateRisk(features: ClinicalFeatureVector): DiseaseRiskResult {
    const factors: ContributingFactor[] = [];
    let riskScore = 15;
    let criteriaCount = 0;

    // 1. Abdominal Obesity (Waist Circumference or BMI)
    if (features.waistCircumferenceCm !== null && features.waistCircumferenceCm >= 90) {
      criteriaCount++;
      riskScore += 20;
      factors.push({ metric: 'Waist Circumference', value: `${features.waistCircumferenceCm} cm`, impactPercentage: 25, rationale: 'Abdominal obesity (Waist ≥ 90cm for South Asian males / ≥ 80cm females per ICMR 2024)' });
    } else if (features.bmi !== null && features.bmi >= 25.0) {
      criteriaCount++;
      riskScore += 15;
      factors.push({ metric: 'BMI', value: `${features.bmi} kg/m²`, impactPercentage: 20, rationale: 'Overweight / Obesity per Asian Indian demographic cutoffs' });
    }

    // 2. Elevated BP
    if (features.systolicBP !== null && (features.systolicBP >= 130 || (features.diastolicBP ?? 0) >= 85)) {
      criteriaCount++;
      riskScore += 20;
      factors.push({ metric: 'Blood Pressure', value: `${features.systolicBP}/${features.diastolicBP ?? ''} mmHg`, impactPercentage: 20, rationale: 'Elevated BP (≥ 130/85 mmHg) contributing to metabolic risk' });
    }

    // 3. Glycemia
    if ((features.fastingGlucose !== null && features.fastingGlucose >= 100) || (features.hba1c !== null && features.hba1c >= 5.7)) {
      criteriaCount++;
      riskScore += 25;
      factors.push({ metric: 'Fasting Glucose/HbA1c', value: `${features.fastingGlucose ?? features.hba1c}%`, impactPercentage: 25, rationale: 'Impaired fasting glucose or prediabetes range' });
    }

    // 4. Triglycerides / Lipid imbalance
    if (features.triglycerides !== null && features.triglycerides >= 150) {
      criteriaCount++;
      riskScore += 15;
      factors.push({ metric: 'Triglycerides', value: `${features.triglycerides} mg/dL`, impactPercentage: 15, rationale: 'Hypertriglyceridemia (≥ 150 mg/dL)' });
    }

    if (criteriaCount >= 3) {
      riskScore = Math.max(riskScore, 65);
    }

    const finalScore = Math.min(100, Math.max(10, riskScore));
    return {
      diseaseId: this.diseaseId,
      diseaseName: this.diseaseName,
      riskScore: finalScore,
      severityTier: this.riskCategory(finalScore),
      confidenceScore: this.calculateConfidence(features),
      contributingFactors: factors,
      requiredInputs: this.requiredInputs(),
      missingInputs: this.missingInputs(features),
      reasoning: `Metabolic syndrome evaluation based on NCEP ATP III & ICMR 2024 Asian Indian criteria (${criteriaCount} criteria fulfilled).`,
      clinicalSummary: criteriaCount >= 3 ? 'Diagnostic criteria met for Metabolic Syndrome.' : 'Moderate cluster of metabolic risk factors present.',
      guidelineReferences: ['ICMR 2024 Guidelines for Metabolic Health', 'IDF Consensus Worldwide Definition of Metabolic Syndrome']
    };
  }
}
