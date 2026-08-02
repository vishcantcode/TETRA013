import { GuidelineRule } from '../../types/clinicalGuideline';
import { Patient, Vitals } from '../../types';

export const CARDIOVASCULAR_RULES: GuidelineRule[] = [
  {
    ruleId: 'CVD-001',
    ruleName: 'Atherosclerotic CVD High Risk (LDL-C ≥ 140 mg/dL with Hypertension)',
    disease: 'Cardiovascular',
    conditionsDescription: 'LDL Cholesterol ≥ 140 mg/dL OR SBP ≥ 135 mmHg in patients age ≥ 40',
    evaluateCondition: (patient: Patient, customVitals?: Partial<Vitals>) => {
      const ldl = customVitals?.ldl ?? patient.vitals.ldl;
      const sbp = customVitals?.bpSystolic ?? patient.vitals.bpSystolic;
      return patient.age >= 40 && (ldl >= 140 || (ldl >= 120 && sbp >= 135));
    },
    clinicalReason:
      'Atherosclerotic plaque accumulation combined with elevated shear stress accelerates coronary artery stenosis and risk of acute coronary syndrome (ACS).',
    recommendation:
      'Initiate moderate-to-high intensity Statin therapy (Atorvastatin 40-80 mg or Rosuvastatin 20-40 mg). Target LDL-C < 70 mg/dL. Order Lipid Profile repeat in 8-12 weeks.',
    priority: 'High',
    supportingGuideline: 'ACC / AHA 2024 Primary Prevention of Cardiovascular Disease Guidelines',
  },
  {
    ruleId: 'CVD-002',
    ruleName: 'Baseline 12-Lead ECG & Cardiac Workup Overdue',
    disease: 'Cardiovascular',
    conditionsDescription: 'Age ≥ 45 with ≥ 2 Cardiovascular Risk Factors (Hypertension, High LDL, Diabetes, Adiposity)',
    evaluateCondition: (patient: Patient, customVitals?: Partial<Vitals>) => {
      const bmi = customVitals?.bmi ?? patient.vitals.bmi;
      const sbp = customVitals?.bpSystolic ?? patient.vitals.bpSystolic;
      const hba1c = customVitals?.hba1c ?? patient.vitals.hba1c;

      let riskFactorCount = 0;
      if (sbp >= 130) riskFactorCount++;
      if (hba1c >= 6.5) riskFactorCount++;
      if (bmi >= 28) riskFactorCount++;
      if (patient.vitals.ldl >= 130) riskFactorCount++;

      return patient.age >= 45 && riskFactorCount >= 2;
    },
    clinicalReason:
      'Asymptomatic ischemia and silent LV hypertrophy are frequent in older patients with clustered metabolic comorbidities.',
    recommendation:
      'Perform baseline 12-Lead Electrocardiogram (ECG). Calculate 10-Year ASCVD Risk Score. Consider Echocardiography if murmur or dyspnea present.',
    priority: 'High',
    supportingGuideline: 'ACC / AHA ASCVD Risk Assessment & Non-Invasive Cardiac Testing Protocols',
  },
  {
    ruleId: 'CVD-003',
    ruleName: 'Cardiology Referral for Refractory Risk Factor Clustering',
    disease: 'Cardiovascular',
    conditionsDescription: 'High ASCVD Risk Score (Overall Patient Risk Score ≥ 70) with concurrent HTN & Dyslipidemia',
    evaluateCondition: (patient: Patient) => {
      return patient.riskScore >= 70;
    },
    clinicalReason:
      'Multi-vessel risk accumulation warrants cardiologist-led secondary prevention, coronary artery calcium (CAC) scoring, or stress testing.',
    recommendation:
      'Refer to Cardiology for advanced risk stratification (CAC score or Exercise Stress Test). Provide strict dietary cardiac counseling.',
    priority: 'High',
    supportingGuideline: 'ESC 2024 Cardiovascular Disease Prevention Guidelines',
  },
];
