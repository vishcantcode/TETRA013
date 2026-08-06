import { GuidelineRule } from '../../types/clinicalGuideline';
import { Patient, Vitals } from '../../types';

export const HYPERTENSION_RULES: GuidelineRule[] = [
  {
    ruleId: 'HTN-001',
    ruleName: 'Stage 2 Hypertension (SBP ≥ 140 or DBP ≥ 90 mmHg)',
    disease: 'Hypertension',
    conditionsDescription: 'Systolic BP ≥ 140 mmHg OR Diastolic BP ≥ 90 mmHg',
    evaluateCondition: (patient: Patient, customVitals?: Partial<Vitals>) => {
      const sbp = customVitals?.bpSystolic ?? patient.vitals.bpSystolic;
      const dbp = customVitals?.bpDiastolic ?? patient.vitals.bpDiastolic;
      return sbp >= 140 || dbp >= 90;
    },
    clinicalReason:
      'Stage 2 Hypertension quadruples risk of stroke, heart failure, and renal decline if prompt dual-agent BP lowering is delayed.',
    recommendation:
      'Initiate or titrate dual anti-hypertensive therapy (e.g. ACEi/ARB + CCB or Thiazide). Order ECG, Serum Creatinine, Electrolytes, and repeat BP in 2 weeks.',
    priority: 'Urgent',
    supportingGuideline: 'ACC / AHA 2024 High Blood Pressure Clinical Practice Guidelines',
  },
  {
    ruleId: 'HTN-002',
    ruleName: 'Stage 1 Hypertension (SBP 130-139 or DBP 80-89 mmHg)',
    disease: 'Hypertension',
    conditionsDescription: 'Systolic BP 130-139 mmHg OR Diastolic BP 80-89 mmHg',
    evaluateCondition: (patient: Patient, customVitals?: Partial<Vitals>) => {
      const sbp = customVitals?.bpSystolic ?? patient.vitals.bpSystolic;
      const dbp = customVitals?.bpDiastolic ?? patient.vitals.bpDiastolic;
      return (sbp >= 130 && sbp <= 139) || (dbp >= 80 && dbp <= 89);
    },
    clinicalReason:
      'Early vascular stiffness warrants aggressive non-pharmacologic interventions to prevent target organ damage.',
    recommendation:
      'Recommend DASH diet (< 1,500 mg sodium/day), weight reduction, stress management, and 24-hour Ambulatory Blood Pressure Monitoring (ABPM) or home log for 1 month.',
    priority: 'Medium',
    supportingGuideline: 'ACC / AHA 2024 Stage 1 HTN Management Protocol',
  },
  {
    ruleId: 'HTN-003',
    ruleName: 'Hypertensive Heart & Vascular Risk Factor Clustering',
    disease: 'Hypertension',
    conditionsDescription: 'SBP ≥ 135 mmHg WITH Smoking or Alcohol or BMI ≥ 27 kg/m²',
    evaluateCondition: (patient: Patient, customVitals?: Partial<Vitals>) => {
      const sbp = customVitals?.bpSystolic ?? patient.vitals.bpSystolic;
      const bmi = customVitals?.bmi ?? patient.vitals.bmi;
      return sbp >= 135 && (bmi >= 27 || patient.riskScore > 50);
    },
    clinicalReason:
      'Co-occurrence of elevated blood pressure with metabolic adiposity accelerates atherogenesis and arterial remodeling.',
    recommendation:
      'Conduct 12-Lead ECG to rule out Left Ventricular Hypertrophy (LVH). Refer to Cardiology if symptomatic or BP remains uncontrolled after 1 month.',
    priority: 'High',
    supportingGuideline: 'ESH / ESC Guidelines for Management of Arterial Hypertension',
  },
  {
    ruleId: 'HTN-004',
    ruleName: 'Hypertensive Urgency Alert (SBP ≥ 180 or DBP ≥ 110 mmHg)',
    disease: 'Hypertension',
    conditionsDescription: 'Systolic BP ≥ 180 mmHg OR Diastolic BP ≥ 110 mmHg',
    evaluateCondition: (patient: Patient, customVitals?: Partial<Vitals>) => {
      const sbp = customVitals?.bpSystolic ?? patient.vitals.bpSystolic;
      const dbp = customVitals?.bpDiastolic ?? patient.vitals.bpDiastolic;
      return sbp >= 180 || dbp >= 110;
    },
    clinicalReason:
      'Extreme BP elevation without acute organ damage requires controlled oral blood pressure reduction within 24-48 hours to prevent encephalopathy or acute aortic syndrome.',
    recommendation:
      'Immediate physician evaluation. Administer fast-acting oral antihypertensive, rule out acute chest pain, dyspnea, or neuro deficit. Follow-up in 24 hours.',
    priority: 'Urgent',
    supportingGuideline: 'AHA / ACC Hypertensive Crisis Management Protocol 2025',
  },
  {
    ruleId: 'HTN-006',
    ruleName: 'Elevated BP with High-Sodium Dietary Risk (WHO Sodium Guideline)',
    disease: 'Hypertension',
    conditionsDescription: 'Systolic BP 130-139 mmHg or Diastolic BP 80-89 mmHg (Stage 1 range) — dietary sodium counseling indicated regardless of pharmacologic therapy status.',
    evaluateCondition: (patient: Patient, customVitals?: Partial<Vitals>) => {
      const sbp = customVitals?.bpSystolic ?? patient.vitals.bpSystolic;
      const dbp = customVitals?.bpDiastolic ?? patient.vitals.bpDiastolic;
      return (sbp >= 130 && sbp < 140) || (dbp >= 80 && dbp < 90);
    },
    clinicalReason:
      'WHO recommends sodium intake below 5g/day (approx. 1 teaspoon of salt) to reduce blood pressure and cardiovascular risk; average Indian dietary sodium intake is well above this threshold, driven largely by pickles, papad, and processed/packaged foods.',
    recommendation:
      'Provide dietary sodium counseling with India-specific guidance (reduce added salt, pickles, papad, and processed snacks). Recheck BP in 4-6 weeks before considering pharmacologic escalation.',
    priority: 'Medium',
    supportingGuideline: 'WHO Guideline: Sodium Intake for Adults and Children (2012, reaffirmed) • WHO Global NCD Action Plan',
  },
];
