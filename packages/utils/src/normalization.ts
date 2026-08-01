/**
 * Clinical Reference Range Normalization
 */

export type LabStatusFlag = 'normal' | 'low' | 'high' | 'critical';

export interface LabInterpretation {
  flag: LabStatusFlag;
  label: string;
  referenceRangeText: string;
}

export function interpretHbA1c(value: number): LabInterpretation {
  if (value < 5.7) {
    return { flag: 'normal', label: 'Normal Glycemia', referenceRangeText: '< 5.7%' };
  } else if (value <= 6.4) {
    return { flag: 'high', label: 'Prediabetes Range', referenceRangeText: '5.7% - 6.4%' };
  } else if (value <= 9.0) {
    return { flag: 'high', label: 'Elevated (Diabetes Range)', referenceRangeText: '≥ 6.5%' };
  } else {
    return { flag: 'critical', label: 'Severely Uncontrolled Hyperglycemia', referenceRangeText: '> 9.0%' };
  }
}

export function interpretBloodPressure(systolic: number, diastolic: number): LabInterpretation {
  if (systolic >= 180 || diastolic >= 120) {
    return { flag: 'critical', label: 'Hypertensive Crisis', referenceRangeText: '< 120/80 mmHg' };
  } else if (systolic >= 140 || diastolic >= 90) {
    return { flag: 'high', label: 'Stage 2 Hypertension', referenceRangeText: '< 120/80 mmHg' };
  } else if (systolic >= 130 || diastolic >= 80) {
    return { flag: 'high', label: 'Stage 1 Hypertension', referenceRangeText: '< 120/80 mmHg' };
  } else if (systolic >= 120 && diastolic < 80) {
    return { flag: 'high', label: 'Elevated BP', referenceRangeText: '< 120/80 mmHg' };
  } else {
    return { flag: 'normal', label: 'Normal Blood Pressure', referenceRangeText: '< 120/80 mmHg' };
  }
}

export function interpreteGFR(egfr: number): LabInterpretation {
  if (egfr >= 90) {
    return { flag: 'normal', label: 'G1: Normal or High Filtration', referenceRangeText: '≥ 90 mL/min' };
  } else if (egfr >= 60) {
    return { flag: 'normal', label: 'G2: Mildly Decreased', referenceRangeText: '60 - 89 mL/min' };
  } else if (egfr >= 45) {
    return { flag: 'high', label: 'G3a: Mildly to Moderately Decreased', referenceRangeText: '45 - 59 mL/min' };
  } else if (egfr >= 30) {
    return { flag: 'high', label: 'G3b: Moderately to Severely Decreased', referenceRangeText: '30 - 44 mL/min' };
  } else if (egfr >= 15) {
    return { flag: 'critical', label: 'G4: Severely Decreased', referenceRangeText: '15 - 29 mL/min' };
  } else {
    return { flag: 'critical', label: 'G5: Kidney Failure', referenceRangeText: '< 15 mL/min' };
  }
}

export function interpretUACR(uacr: number): LabInterpretation {
  if (uacr < 30) {
    return { flag: 'normal', label: 'A1: Normal to Mildly Increased Albuminuria', referenceRangeText: '< 30 mg/g' };
  } else if (uacr <= 300) {
    return { flag: 'high', label: 'A2: Moderately Increased (Microalbuminuria)', referenceRangeText: '30 - 300 mg/g' };
  } else {
    return { flag: 'critical', label: 'A3: Severely Increased (Macroalbuminuria)', referenceRangeText: '> 300 mg/g' };
  }
}
