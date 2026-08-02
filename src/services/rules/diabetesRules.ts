import { GuidelineRule } from '../../types/clinicalGuideline';
import { Patient, Vitals } from '../../types';

export const DIABETES_RULES: GuidelineRule[] = [
  {
    ruleId: 'DM-001',
    ruleName: 'Uncontrolled Glycemia (HbA1c ≥ 8.0%)',
    disease: 'Diabetes',
    conditionsDescription: 'HbA1c ≥ 8.0% or Random Glucose ≥ 200 mg/dL',
    evaluateCondition: (patient: Patient, customVitals?: Partial<Vitals>) => {
      const hba1c = customVitals?.hba1c ?? patient.vitals.hba1c;
      const glucose = customVitals?.glucose ?? patient.vitals.glucose;
      return hba1c >= 8.0 || glucose >= 200;
    },
    clinicalReason:
      'Severe glycemic elevation increases immediate risk of microvascular complications (retinopathy, nephropathy, neuropathy) and metabolic decompensation.',
    recommendation:
      'Intensify anti-hyperglycemic therapy. Order urgent HbA1c repeat, Urine Albumin-to-Creatinine Ratio (UACR), and arrange endocrinology consultation within 2 weeks.',
    priority: 'Urgent',
    supportingGuideline: 'ADA Standards of Care 2026 • Glycemic Targets & Pharmacologic Approaches',
  },
  {
    ruleId: 'DM-002',
    ruleName: 'Pre-Diabetes / Impaired Fasting Glycemia (HbA1c 5.7% - 6.4%)',
    disease: 'Diabetes',
    conditionsDescription: 'HbA1c between 5.7% and 6.4% OR BMI ≥ 25 kg/m² with sedentary lifestyle',
    evaluateCondition: (patient: Patient, customVitals?: Partial<Vitals>) => {
      const hba1c = customVitals?.hba1c ?? patient.vitals.hba1c;
      const bmi = customVitals?.bmi ?? patient.vitals.bmi;
      return (hba1c >= 5.7 && hba1c <= 6.4) || (bmi >= 25 && hba1c >= 5.6);
    },
    clinicalReason:
      'Impaired fasting glucose indicates high 5-year progression risk to overt Type 2 Diabetes Mellitus.',
    recommendation:
      'Initiate Diabetes Prevention Program (DPP) lifestyle counseling (7% body weight loss, 150 min/wk moderate exercise). Consider Metformin if BMI ≥ 35 kg/m² or age < 60.',
    priority: 'Medium',
    supportingGuideline: 'ADA 2026 Diabetes Prevention & Screening Guidelines',
  },
  {
    ruleId: 'DM-003',
    ruleName: 'Overdue Diabetic Retinopathy Screening',
    disease: 'Diabetes',
    conditionsDescription: 'Type 2 Diabetes diagnosed OR HbA1c ≥ 6.5% with no Fundus Exam in last 12 months',
    evaluateCondition: (patient: Patient, customVitals?: Partial<Vitals>) => {
      const hba1c = customVitals?.hba1c ?? patient.vitals.hba1c;
      const hasDiabetes = patient.conditions.some((c) =>
        c.toLowerCase().includes('diabetes')
      ) || hba1c >= 6.5;
      return hasDiabetes;
    },
    clinicalReason:
      'Diabetic retinopathy is a leading cause of preventable adult blindness. Annual dilated eye exam is mandated for early laser/anti-VEGF intervention.',
    recommendation:
      'Order annual dilated fundus examination or digital retinal imaging. Refer to Ophthalmology/Optometry.',
    priority: 'High',
    supportingGuideline: 'ADA / AAO Retinopathy Screening Standards 2025',
  },
  {
    ruleId: 'DM-004',
    ruleName: 'Diabetic Peripheral Neuropathy & Foot Risk Assessment',
    disease: 'Diabetes',
    conditionsDescription: 'Age ≥ 45 with Diabetes or HbA1c ≥ 7.0%',
    evaluateCondition: (patient: Patient, customVitals?: Partial<Vitals>) => {
      const hba1c = customVitals?.hba1c ?? patient.vitals.hba1c;
      return (patient.age >= 45 || hba1c >= 7.0) && patient.conditions.some((c) => c.toLowerCase().includes('diabet'));
    },
    clinicalReason:
      'Loss of protective sensation (LOPS) due to peripheral neuropathy increases risk of foot ulceration and lower extremity amputation.',
    recommendation:
      'Perform 10-g monofilament test and pulse palpation. Provide daily diabetic foot inspection education and footwear guidance.',
    priority: 'Medium',
    supportingGuideline: 'ADA Diabetic Foot Care Guidelines 2026',
  },
  {
    ruleId: 'DM-005',
    ruleName: 'High Risk Metabolic Phenotype (Age > 35, BMI > 28 & Family History)',
    disease: 'Diabetes',
    conditionsDescription: 'Age > 35, BMI ≥ 28 kg/m², elevated glucose or positive family history',
    evaluateCondition: (patient: Patient, customVitals?: Partial<Vitals>) => {
      const bmi = customVitals?.bmi ?? patient.vitals.bmi;
      const glucose = customVitals?.glucose ?? patient.vitals.glucose;
      return patient.age > 35 && bmi >= 28 && glucose > 100;
    },
    clinicalReason:
      'Combined age, visceral adiposity, and borderline fasting hyperglycemia significantly escalate insulin resistance cascade.',
    recommendation:
      'Schedule Comprehensive Metabolic Panel (CMP), Lipid Profile, Fasting Plasma Glucose, and Nutritionist referral.',
    priority: 'High',
    supportingGuideline: 'AACE / ACE Clinical Practice Guidelines for T2D',
  },
];
