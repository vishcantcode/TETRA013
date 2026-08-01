/**
 * Clinical Input Validation & Sanity Bounds
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateVitalsInput(vitals: {
  systolicBP?: number;
  diastolicBP?: number;
  bmi?: number;
  pulse?: number;
}): ValidationResult {
  const errors: string[] = [];

  if (vitals.systolicBP !== undefined) {
    if (vitals.systolicBP < 40 || vitals.systolicBP > 300) {
      errors.push(`Systolic BP (${vitals.systolicBP} mmHg) is out of biological range [40..300].`);
    }
  }

  if (vitals.diastolicBP !== undefined) {
    if (vitals.diastolicBP < 20 || vitals.diastolicBP > 200) {
      errors.push(`Diastolic BP (${vitals.diastolicBP} mmHg) is out of biological range [20..200].`);
    }
  }

  if (vitals.systolicBP !== undefined && vitals.diastolicBP !== undefined) {
    if (vitals.systolicBP <= vitals.diastolicBP) {
      errors.push(`Systolic BP (${vitals.systolicBP}) must be strictly greater than Diastolic BP (${vitals.diastolicBP}).`);
    }
  }

  if (vitals.bmi !== undefined) {
    if (vitals.bmi < 10 || vitals.bmi > 70) {
      errors.push(`BMI (${vitals.bmi}) is out of biological range [10..70].`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateLabsInput(labs: {
  hba1c?: number;
  fastingGlucose?: number;
  egfr?: number;
  uacr?: number;
}): ValidationResult {
  const errors: string[] = [];

  if (labs.hba1c !== undefined) {
    if (labs.hba1c < 3.0 || labs.hba1c > 20.0) {
      errors.push(`HbA1c (${labs.hba1c}%) is out of biological range [3.0..20.0].`);
    }
  }

  if (labs.fastingGlucose !== undefined) {
    if (labs.fastingGlucose < 20 || labs.fastingGlucose > 1000) {
      errors.push(`Fasting Glucose (${labs.fastingGlucose} mg/dL) is out of biological range [20..1000].`);
    }
  }

  if (labs.egfr !== undefined) {
    if (labs.egfr < 0 || labs.egfr > 200) {
      errors.push(`eGFR (${labs.egfr} mL/min) is out of valid range [0..200].`);
    }
  }

  if (labs.uacr !== undefined) {
    if (labs.uacr < 0 || labs.uacr > 10000) {
      errors.push(`UACR (${labs.uacr} mg/g) is out of valid range [0..10000].`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
