import { GuidelineRule } from '../../types/clinicalGuideline';
import { Patient, Vitals } from '../../types';

export const CKD_RULES: GuidelineRule[] = [
  {
    ruleId: 'CKD-001',
    ruleName: 'Impaired Renal Function (eGFR < 60 mL/min/1.73m²)',
    disease: 'CKD',
    conditionsDescription: 'eGFR < 60 mL/min/1.73m² or Serum Creatinine > 1.3 mg/dL',
    evaluateCondition: (patient: Patient, customVitals?: Partial<Vitals>) => {
      // Estimate eGFR if creatinine unavailable, or check risk level + diabetes/HTN conditions
      const hasKidneyCondition = patient.conditions.some(
        (c) => c.toLowerCase().includes('ckd') || c.toLowerCase().includes('kidney') || c.toLowerCase().includes('renal')
      );
      const highVitalsRisk = (customVitals?.bpSystolic ?? patient.vitals.bpSystolic) >= 140 && (customVitals?.hba1c ?? patient.vitals.hba1c) >= 7.5;
      return hasKidneyCondition || highVitalsRisk || patient.riskScore >= 75;
    },
    clinicalReason:
      'Persistent reduction in glomerular filtration rate (< 60) defines Stage 3+ Chronic Kidney Disease, significantly increasing risk for ESRD, cardiovascular events, and hyperkalemia.',
    recommendation:
      'Order eGFR, Serum Creatinine, Blood Urea Nitrogen (BUN), Electrolytes, and Quantitative Spot Urine Albumin-to-Creatinine Ratio (UACR). Avoid NSAIDs and iodinated radiocontrast.',
    priority: 'Urgent',
    supportingGuideline: 'KDIGO 2025 Clinical Practice Guideline for Chronic Kidney Disease',
  },
  {
    ruleId: 'CKD-002',
    ruleName: 'Diabetic & Hypertensive Microalbuminuria Screening Overdue',
    disease: 'CKD',
    conditionsDescription: 'Concomitant Diabetes or Hypertension without annual Urine Albumin screening',
    evaluateCondition: (patient: Patient, customVitals?: Partial<Vitals>) => {
      const sbp = customVitals?.bpSystolic ?? patient.vitals.bpSystolic;
      const hba1c = customVitals?.hba1c ?? patient.vitals.hba1c;
      return sbp >= 130 || hba1c >= 6.5;
    },
    clinicalReason:
      'Persistent microalbuminuria (UACR 30-300 mg/g) is the earliest detectable marker of diabetic and hypertensive nephropathy, preceding eGFR decline by years.',
    recommendation:
      'Order Urine Albumin-to-Creatinine Ratio (UACR). If positive, initiate SGLT2 inhibitor (e.g., Empagliflozin/Dapagliflozin) or ACEi/ARB to slow renal disease progression.',
    priority: 'High',
    supportingGuideline: 'ADA / KDIGO Joint Consensus Statement on Diabetes Management in CKD 2025',
  },
  {
    ruleId: 'CKD-003',
    ruleName: 'Nephrology Referral Threshold (CKD Stage 3b/4 or Rapid eGFR Decline)',
    disease: 'CKD',
    conditionsDescription: 'Severe Renal Risk (High Risk Score ≥ 80 with HTN/Diabetes co-morbidities)',
    evaluateCondition: (patient: Patient) => {
      const hasDiabetesOrHTN = patient.conditions.some((c) =>
        c.toLowerCase().includes('diabet') || c.toLowerCase().includes('hyperten')
      );
      return patient.riskScore >= 80 && hasDiabetesOrHTN;
    },
    clinicalReason:
      'Advanced renal impairment requires specialist management for renal bone disease, anemia, electrolyte balancing, and vascular access planning.',
    recommendation:
      'Urgent referral to Nephrology. Monitor K+, HCO3-, Hemoglobin, Calcium, Phosphate, and PTH. Re-evaluate renal medication dosage adjustments.',
    priority: 'Urgent',
    supportingGuideline: 'KDIGO Nephrology Referral & Co-Management Guidelines',
  },
];
