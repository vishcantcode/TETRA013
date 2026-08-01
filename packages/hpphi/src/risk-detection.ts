// ============================================================================
// HPPHI – Capability 2: Early Risk Detection Engine
// ============================================================================

import { HPPHIPatientInput, HPPHIEmergingRisk, EmergingRiskLevel } from './types';

interface RiskRule {
  condition: string;
  factors: { field: string; key: string; check: (patient: HPPHIPatientInput) => boolean; label: string }[];
  protectiveChecks: { check: (patient: HPPHIPatientInput) => boolean; label: string }[];
  baseConfidence: number;
  evidenceRef: string;
}

const RISK_RULES: RiskRule[] = [
  {
    condition: 'Hypertension',
    factors: [
      { field: 'vital', key: 'Systolic BP', check: p => (p.vitalSigns.find(v => v.metric === 'Systolic BP')?.value ?? 0) >= 130, label: 'Systolic BP ≥130 mmHg' },
      { field: 'lifestyle', key: 'sodium', check: p => p.lifestyleFactors.dietQuality === 'POOR' || p.lifestyleFactors.dietQuality === 'FAIR', label: 'Suboptimal dietary quality' },
      { field: 'lifestyle', key: 'activity', check: p => p.lifestyleFactors.physicalActivityMinPerWeek < 150, label: 'Insufficient physical activity (<150 min/week)' },
      { field: 'lifestyle', key: 'stress', check: p => p.lifestyleFactors.stressLevel === 'HIGH', label: 'High stress level' },
      { field: 'condition', key: 'family', check: p => p.familyHistory.some(f => f.toLowerCase().includes('hypertension')), label: 'Family history of hypertension' }
    ],
    protectiveChecks: [
      { check: p => p.lifestyleFactors.physicalActivityMinPerWeek >= 300, label: 'High physical activity (≥300 min/week)' },
      { check: p => p.lifestyleFactors.dietQuality === 'EXCELLENT', label: 'Excellent diet quality' }
    ],
    baseConfidence: 0.82,
    evidenceRef: 'AHA/ACC 2017 Hypertension Guidelines'
  },
  {
    condition: 'Type 2 Diabetes',
    factors: [
      { field: 'lab', key: 'HbA1c', check: p => (p.laboratoryResults.find(l => l.test === 'HbA1c')?.value ?? 0) >= 5.7, label: 'HbA1c ≥5.7% (pre-diabetic range)' },
      { field: 'lab', key: 'glucose', check: p => (p.laboratoryResults.find(l => l.test === 'Fasting Glucose')?.value ?? 0) >= 100, label: 'Fasting glucose ≥100 mg/dL' },
      { field: 'lab', key: 'bmi', check: p => (p.laboratoryResults.find(l => l.test === 'BMI')?.value ?? 0) >= 30, label: 'BMI ≥30 (obesity)' },
      { field: 'condition', key: 'family', check: p => p.familyHistory.some(f => f.toLowerCase().includes('diabetes')), label: 'Family history of diabetes' },
      { field: 'lifestyle', key: 'activity', check: p => p.lifestyleFactors.physicalActivityMinPerWeek < 150, label: 'Sedentary lifestyle' }
    ],
    protectiveChecks: [
      { check: p => (p.laboratoryResults.find(l => l.test === 'HbA1c')?.value ?? 10) < 5.7, label: 'Normal HbA1c' },
      { check: p => (p.laboratoryResults.find(l => l.test === 'BMI')?.value ?? 40) < 25, label: 'Normal BMI' }
    ],
    baseConfidence: 0.85,
    evidenceRef: 'ADA 2024 Standards of Medical Care'
  },
  {
    condition: 'Cardiovascular Disease',
    factors: [
      { field: 'lab', key: 'LDL', check: p => (p.laboratoryResults.find(l => l.test === 'LDL')?.value ?? 0) >= 160, label: 'LDL ≥160 mg/dL' },
      { field: 'condition', key: 'htn', check: p => p.chronicConditions.some(c => c.toLowerCase().includes('hypertension')), label: 'Existing hypertension' },
      { field: 'lifestyle', key: 'smoking', check: p => p.lifestyleFactors.smokingStatus === 'CURRENT', label: 'Current smoker' },
      { field: 'condition', key: 'family', check: p => p.familyHistory.some(f => f.toLowerCase().includes('heart disease') || f.toLowerCase().includes('cardiovascular')), label: 'Family history of CVD' },
      { field: 'age', key: 'age', check: p => p.age >= 55, label: 'Age ≥55 years' }
    ],
    protectiveChecks: [
      { check: p => p.lifestyleFactors.physicalActivityMinPerWeek >= 300, label: 'Regular vigorous exercise' },
      { check: p => p.lifestyleFactors.smokingStatus === 'NEVER', label: 'Never smoked' }
    ],
    baseConfidence: 0.80,
    evidenceRef: 'ACC/AHA 2019 ASCVD Primary Prevention Guidelines'
  },
  {
    condition: 'Obesity',
    factors: [
      { field: 'lab', key: 'BMI', check: p => (p.laboratoryResults.find(l => l.test === 'BMI')?.value ?? 0) >= 25, label: 'BMI ≥25 (overweight/obese)' },
      { field: 'lifestyle', key: 'diet', check: p => p.lifestyleFactors.dietQuality === 'POOR', label: 'Poor diet quality' },
      { field: 'lifestyle', key: 'activity', check: p => p.lifestyleFactors.physicalActivityMinPerWeek < 150, label: 'Insufficient physical activity' },
      { field: 'lifestyle', key: 'sleep', check: p => p.lifestyleFactors.sleepHoursPerNight < 6, label: 'Inadequate sleep (<6 hours)' }
    ],
    protectiveChecks: [
      { check: p => p.lifestyleFactors.dietQuality === 'EXCELLENT' || p.lifestyleFactors.dietQuality === 'GOOD', label: 'Good dietary habits' }
    ],
    baseConfidence: 0.88,
    evidenceRef: 'Endocrine Society 2023 Obesity Management Guidelines'
  },
  {
    condition: 'Chronic Kidney Disease',
    factors: [
      { field: 'lab', key: 'eGFR', check: p => (p.laboratoryResults.find(l => l.test === 'eGFR')?.value ?? 90) < 60, label: 'eGFR <60 mL/min/1.73m²' },
      { field: 'lab', key: 'creatinine', check: p => (p.laboratoryResults.find(l => l.test === 'Creatinine')?.value ?? 0) > 1.2, label: 'Creatinine >1.2 mg/dL' },
      { field: 'condition', key: 'diabetes', check: p => p.chronicConditions.some(c => c.toLowerCase().includes('diabetes')), label: 'Existing diabetes (nephropathy risk)' },
      { field: 'condition', key: 'htn', check: p => p.chronicConditions.some(c => c.toLowerCase().includes('hypertension')), label: 'Existing hypertension' }
    ],
    protectiveChecks: [
      { check: p => (p.laboratoryResults.find(l => l.test === 'eGFR')?.value ?? 0) >= 90, label: 'Normal eGFR' }
    ],
    baseConfidence: 0.78,
    evidenceRef: 'KDIGO 2024 CKD Guidelines'
  },
  {
    condition: 'Metabolic Syndrome',
    factors: [
      { field: 'lab', key: 'BMI', check: p => (p.laboratoryResults.find(l => l.test === 'BMI')?.value ?? 0) >= 30, label: 'Central obesity (BMI ≥30)' },
      { field: 'lab', key: 'glucose', check: p => (p.laboratoryResults.find(l => l.test === 'Fasting Glucose')?.value ?? 0) >= 100, label: 'Elevated fasting glucose ≥100' },
      { field: 'vital', key: 'BP', check: p => (p.vitalSigns.find(v => v.metric === 'Systolic BP')?.value ?? 0) >= 130, label: 'Elevated blood pressure' },
      { field: 'lab', key: 'LDL', check: p => (p.laboratoryResults.find(l => l.test === 'LDL')?.value ?? 0) >= 130, label: 'Elevated LDL cholesterol' }
    ],
    protectiveChecks: [],
    baseConfidence: 0.83,
    evidenceRef: 'NCEP ATP III / IDF Harmonized Criteria'
  },
  {
    condition: 'Depression Risk',
    factors: [
      { field: 'lifestyle', key: 'stress', check: p => p.lifestyleFactors.stressLevel === 'HIGH', label: 'High stress level' },
      { field: 'lifestyle', key: 'sleep', check: p => p.lifestyleFactors.sleepHoursPerNight < 6, label: 'Poor sleep (<6 hours)' },
      { field: 'lifestyle', key: 'activity', check: p => p.lifestyleFactors.physicalActivityMinPerWeek < 60, label: 'Very low physical activity' },
      { field: 'condition', key: 'chronic', check: p => p.chronicConditions.length >= 3, label: 'Multiple chronic conditions (disease burden)' }
    ],
    protectiveChecks: [
      { check: p => p.lifestyleFactors.physicalActivityMinPerWeek >= 150, label: 'Regular physical activity' },
      { check: p => p.lifestyleFactors.sleepHoursPerNight >= 7, label: 'Adequate sleep' }
    ],
    baseConfidence: 0.72,
    evidenceRef: 'USPSTF 2023 Depression Screening'
  },
  {
    condition: 'Fall Risk',
    factors: [
      { field: 'age', key: 'age', check: p => p.age >= 65, label: 'Age ≥65 years' },
      { field: 'condition', key: 'meds', check: p => p.medications.length >= 5, label: 'Polypharmacy (≥5 medications)' },
      { field: 'vital', key: 'BP', check: p => {
        const sys = p.vitalSigns.find(v => v.metric === 'Systolic BP')?.value ?? 120;
        return sys < 100;
      }, label: 'Orthostatic hypotension risk (low BP)' },
      { field: 'condition', key: 'neuro', check: p => p.chronicConditions.some(c => c.toLowerCase().includes('neuropathy') || c.toLowerCase().includes('parkinson')), label: 'Neurological condition' }
    ],
    protectiveChecks: [
      { check: p => p.lifestyleFactors.physicalActivityMinPerWeek >= 150, label: 'Regular balance/strength exercise' }
    ],
    baseConfidence: 0.70,
    evidenceRef: 'USPSTF 2018 Falls Prevention / AGS 2024 Guidelines'
  }
];

export class HPPHIRiskDetectionEngine {

  public evaluate(patient: HPPHIPatientInput): HPPHIEmergingRisk[] {
    const risks: HPPHIEmergingRisk[] = [];

    for (const rule of RISK_RULES) {
      // Skip if patient already has the condition diagnosed
      if (patient.chronicConditions.some(c => c.toLowerCase().includes(rule.condition.toLowerCase().split(' ')[0]))) {
        continue; // Not "emerging" if already diagnosed
      }

      const contributing: string[] = [];
      const protective: string[] = [];
      let matchedFactors = 0;

      for (const f of rule.factors) {
        if (f.check(patient)) {
          matchedFactors++;
          contributing.push(f.label);
        }
      }

      for (const p of rule.protectiveChecks) {
        if (p.check(patient)) {
          protective.push(p.label);
        }
      }

      if (matchedFactors === 0) continue;

      const ratio = rule.factors.length > 0 ? matchedFactors / rule.factors.length : 0;
      const protectiveReduction = protective.length * 0.08;
      const confidence = Math.max(0, Math.min(1, rule.baseConfidence * ratio - protectiveReduction));

      let riskLevel: EmergingRiskLevel = 'MINIMAL';
      if (confidence >= 0.7) riskLevel = 'HIGH';
      else if (confidence >= 0.55) riskLevel = 'ELEVATED';
      else if (confidence >= 0.4) riskLevel = 'MODERATE';
      else if (confidence >= 0.2) riskLevel = 'LOW';

      risks.push({
        condition: rule.condition,
        riskLevel,
        confidence: parseFloat(confidence.toFixed(3)),
        contributingFactors: contributing,
        protectiveFactors: protective,
        evidenceReference: rule.evidenceRef
      });
    }

    // Sort by confidence descending
    risks.sort((a, b) => b.confidence - a.confidence);
    return risks;
  }
}
