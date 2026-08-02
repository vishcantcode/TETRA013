import { GuidelineRule } from '../../types/clinicalGuideline';
import { Patient, Vitals } from '../../types';

export const STROKE_RULES: GuidelineRule[] = [
  {
    ruleId: 'STRK-001',
    ruleName: 'Hypertensive Cerebrovascular Risk (SBP ≥ 150 mmHg with Diabetes/Smoking)',
    disease: 'Stroke',
    conditionsDescription: 'Systolic BP ≥ 150 mmHg WITH Diabetes, Age > 50, or elevated vascular risk score',
    evaluateCondition: (patient: Patient, customVitals?: Partial<Vitals>) => {
      const sbp = customVitals?.bpSystolic ?? patient.vitals.bpSystolic;
      const hba1c = customVitals?.hba1c ?? patient.vitals.hba1c;
      return sbp >= 150 && (hba1c >= 7.0 || patient.age >= 50 || patient.riskScore >= 65);
    },
    clinicalReason:
      'Uncontrolled systolic pressure causes small-vessel lipohyalinosis and lacunar infarction. Chronic high pressure is the single strongest modifiable risk factor for ischemic and hemorrhagic stroke.',
    recommendation:
      'Immediate blood pressure optimization. Target SBP < 130 mmHg. Order Carotid Duplex Ultrasound and screening brain MRI/CT if history of dizziness or transient neurological deficits.',
    priority: 'Urgent',
    supportingGuideline: 'AHA / ASA 2024 Guidelines for the Primary Prevention of Stroke',
  },
  {
    ruleId: 'STRK-002',
    ruleName: 'Transient Ischemic Attack (TIA) / Acute Neuro Stroke Warning Assessment',
    disease: 'Stroke',
    conditionsDescription: 'Age ≥ 55 with SBP ≥ 140 mmHg OR patient presenting with transient neurological symptoms',
    evaluateCondition: (patient: Patient, customVitals?: Partial<Vitals>) => {
      const sbp = customVitals?.bpSystolic ?? patient.vitals.bpSystolic;
      return patient.age >= 55 && sbp >= 140;
    },
    clinicalReason:
      'Patients with TIA or high BP have a 10-15% risk of full ischemic stroke within 90 days, with highest risk in the first 48 hours.',
    recommendation:
      'Educate patient on FAST (Face, Arms, Speech, Time) red flags. Perform ABCD2 clinical risk scoring. Refer to Neurology or Comprehensive Stroke Center if neurological symptoms occur.',
    priority: 'High',
    supportingGuideline: 'AHA / ASA Stroke Risk Stratification & TIA Rapid Workup Protocol',
  },
];
