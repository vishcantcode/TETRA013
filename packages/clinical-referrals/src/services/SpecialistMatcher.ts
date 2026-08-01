import { UnifiedRiskAssessment } from '@healthsense/clinical-intelligence';
import { SpecialistType, ReferralReason } from '../interfaces/ReferralReason';

export class SpecialistMatcher {
  public static matchSpecialists(assessment: UnifiedRiskAssessment): ReferralReason[] {
    const reasons: ReferralReason[] = [];
    const f = assessment.snapshot.features;

    // 1. Nephrology Referral (CKD eGFR < 60 or UACR > 30)
    if (f.egfr !== null && f.egfr < 60) {
      reasons.push({
        targetSpecialty: 'Nephrologist',
        primaryDiagnosis: `Chronic Kidney Disease Stage ${f.egfr < 30 ? '4' : f.egfr < 45 ? '3b' : '3a'}`,
        clinicalJustification: `eGFR declined to ${f.egfr} mL/min/1.73m2 with micro/macroalbuminuria risk per KDIGO 2023 Guidelines.`,
        prerequisiteInvestigations: ['Serum Electrolytes (K+, Na+)', 'Renal Ultrasound', 'Urine Albumin-to-Creatinine Ratio (UACR)']
      });
    }

    // 2. Endocrinology Referral (Diabetic HbA1c >= 8.0%)
    if (f.hba1c !== null && f.hba1c >= 8.0) {
      reasons.push({
        targetSpecialty: 'Endocrinologist',
        primaryDiagnosis: 'Uncontrolled Type 2 Diabetes Mellitus',
        clinicalJustification: `HbA1c ${f.hba1c}% exceeds target glycemic control threshold (ADA 2024 / ICMR).`,
        prerequisiteInvestigations: ['Repeat HbA1c', 'Fasting Lipid Panel', 'Renal Function Test']
      });
    }

    // 3. Ophthalmology Referral (Diabetic Retinopathy Screening)
    if (f.hba1c !== null && f.hba1c >= 6.5) {
      reasons.push({
        targetSpecialty: 'Ophthalmologist',
        primaryDiagnosis: 'Diabetic Retinopathy Screening',
        clinicalJustification: 'Mandatory annual dilated fundoscopy screening for diabetic patients per ADA 2024 Guidelines.',
        prerequisiteInvestigations: ['Visual Acuity Assessment']
      });
    }

    // 4. Cardiology Referral (Stage 2 HTN / High ASCVD Risk)
    if ((f.systolicBP !== null && f.systolicBP >= 150) || (assessment.diseaseResults.cvd.riskScore >= 70)) {
      reasons.push({
        targetSpecialty: 'Cardiologist',
        primaryDiagnosis: 'Stage 2 Essential Hypertension & High ASCVD Risk',
        clinicalJustification: `Systolic BP ${f.systolicBP} mmHg with 10-year ASCVD risk score of ${assessment.diseaseResults.cvd.riskScore}%.`,
        prerequisiteInvestigations: ['12-Lead Electrocardiogram (ECG)', 'Echocardiogram (ECHO)', 'Lipid Profile']
      });
    }

    // 5. General Physician Review (Default for Moderate Risk or Prediabetes)
    if (reasons.length === 0 && assessment.overallRiskScore >= 35) {
      reasons.push({
        targetSpecialty: 'General Physician',
        primaryDiagnosis: 'Preventive Health Review & Risk Factor Management',
        clinicalJustification: `Moderate overall risk score (${assessment.overallRiskScore}%) requiring lifestyle & pharmacological optimization.`,
        prerequisiteInvestigations: ['Baseline Blood Panel', 'Fasting Blood Sugar']
      });
    }

    return reasons;
  }
}
