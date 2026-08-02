import { Patient } from '../../types';
import { SpecialistReferral } from '../../types/cdss';

export class ReferralEngine {
  /**
   * Stage 6: Specialist Referral Triage Engine.
   * Maps cardiometabolic risk trajectories to clinical specialist disciplines.
   */
  public static generateReferrals(patient: Patient, customVitals?: any): SpecialistReferral[] {
    const referrals: SpecialistReferral[] = [];
    const vitals = customVitals || patient.vitals || {};

    const hba1c = vitals.hba1c || 7.2;
    const bpSystolic = vitals.bpSystolic || 138;
    const bmi = vitals.bmi || 27.4;
    const ldl = vitals.ldl || 135;

    // 1. Endocrinologist Referral
    if (hba1c >= 7.0) {
      referrals.push({
        id: 'ref-endo',
        specialist: 'Endocrinologist',
        reason: `Sub-optimally controlled glycemic trajectory (HbA1c ${hba1c}%). Requires expert therapeutic titration & second-line agent evaluation.`,
        priority: hba1c >= 8.5 ? 'Urgent' : 'High',
        timeline: hba1c >= 8.5 ? 'Within 48 Hours' : 'Within 1 Week',
        icd10Context: 'E11.69 (Type 2 Diabetes Mellitus with hyperglycemia)',
        suggestedWorkup: ['HbA1c Lab Repeat', 'Continuous Glucose Monitoring (CGM)', 'C-peptide Test'],
      });
    }

    // 2. Clinical Nutritionist / Dietitian
    if (bmi >= 25 || hba1c >= 6.5) {
      referrals.push({
        id: 'ref-nutr',
        specialist: 'Nutritionist',
        reason: 'Medical Nutrition Therapy (MNT) focusing on low-glycemic index meals, carbohydrate distribution, and weight reduction.',
        priority: 'Recommended',
        timeline: 'Within 1 Week',
        icd10Context: 'E66.3 (Overweight) & Z71.3 (Dietary counseling)',
        suggestedWorkup: ['3-Day Food & Carbohydrate Diary', 'Basal Metabolic Rate Evaluation'],
      });
    }

    // 3. Cardiologist Referral
    if (bpSystolic >= 140 || ldl >= 130 || patient.riskScore > 60) {
      referrals.push({
        id: 'ref-cardio',
        specialist: 'Cardiologist',
        reason: `Elevated ASCVD risk driven by Stage 1/2 Hypertension (${bpSystolic} mmHg) and LDL (${ldl} mg/dL). Baseline cardiac evaluation needed.`,
        priority: bpSystolic >= 160 ? 'Urgent' : 'Recommended',
        timeline: bpSystolic >= 160 ? 'Within 72 Hours' : 'Within 14 Days',
        icd10Context: 'I10 (Essential Hypertension) & E78.00 (Hypercholesterolemia)',
        suggestedWorkup: ['Resting 12-Lead ECG', 'Echocardiogram', 'Coronary Calcium Score (CAC)'],
      });
    }

    // 4. Ophthalmologist Referral
    if (hba1c >= 6.5) {
      referrals.push({
        id: 'ref-ophth',
        specialist: 'Ophthalmologist',
        reason: 'Annual dilated eye fundus examination to screen for early asymptomatic diabetic retinopathy and retinal micro-hemorrhages.',
        priority: 'Routine',
        timeline: 'Within 30 Days',
        icd10Context: 'E11.319 (Type 2 diabetes with unspecified diabetic retinopathy)',
        suggestedWorkup: ['Dilated Retinal Photography', 'Optical Coherence Tomography (OCT)'],
      });
    }

    // 5. Nephrologist Referral (if renal flags exist)
    if ((hba1c >= 7.5 && bpSystolic >= 140) || vitals.creatinine > 1.3) {
      referrals.push({
        id: 'ref-nephro',
        specialist: 'Nephrologist',
        reason: 'Evaluate renal parenchymal hyperfiltration and microalbuminuria secondary to dual diabetic/hypertensive etiology.',
        priority: 'High',
        timeline: 'Within 14 Days',
        icd10Context: 'N18.9 (Chronic Kidney Disease, unspecified)',
        suggestedWorkup: ['Urine Albumin-Creatinine Ratio (UACR)', 'Renal Ultrasound', 'eGFR Calculation'],
      });
    }

    // 6. Neurologist Referral (if stroke risk is high or symptoms exist)
    if (bpSystolic >= 150 && patient.age >= 60) {
      referrals.push({
        id: 'ref-neuro',
        specialist: 'Neurologist',
        reason: 'Comprehensive cerebrovascular stroke risk assessment and carotid doppler imaging in elderly hypertensive patient.',
        priority: 'Recommended',
        timeline: 'Within 30 Days',
        icd10Context: 'I67.89 (Other cerebrovascular disease)',
        suggestedWorkup: ['Carotid Duplex Ultrasound', 'Brain MRI/MRA'],
      });
    }

    return referrals;
  }
}
