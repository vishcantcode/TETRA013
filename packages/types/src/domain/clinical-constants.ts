/**
 * HealthSense AI CDSS — Centralized Clinical Constants & Guideline Thresholds
 */

export const LOINC_CODES = {
  SYSTOLIC_BP: '8480-6',
  DIASTOLIC_BP: '8462-4',
  BMI: '39156-5',
  HBA1C: '4548-4',
  FASTING_GLUCOSE: '1558-6',
  EGFR: '33914-3',
  UACR: '14959-1',
  TOTAL_CHOLESTEROL: '2093-3',
  HDL_CHOLESTEROL: '2085-9',
  LDL_CHOLESTEROL: '2089-1',
  TRIGLYCERIDES: '2571-8',
  SERUM_CREATININE: '2160-0'
} as const;

export const CLINICAL_THRESHOLDS = {
  HBA1C: {
    NORMAL_MAX: 5.6,
    PREDIABETES_MAX: 6.4,
    DIABETES_TARGET: 7.0,
    UNCONTROLLED: 8.0,
    CRITICAL: 10.0
  },
  BLOOD_PRESSURE: {
    NORMAL_SYS_MAX: 120,
    NORMAL_DIA_MAX: 80,
    ELEVATED_SYS_MAX: 129,
    STAGE1_SYS_MAX: 139,
    STAGE1_DIA_MAX: 89,
    STAGE2_SYS_MIN: 140,
    CRISIS_SYS_MIN: 180,
    CRISIS_DIA_MIN: 120
  },
  EGFR: {
    NORMAL_MIN: 90,
    STAGE2_MIN: 60,
    STAGE3A_MIN: 45,
    STAGE3B_MIN: 30,
    STAGE4_MIN: 15,
    KIDNEY_FAILURE: 15
  },
  UACR: {
    NORMAL_MAX: 30,
    MICROALBUMINURIA_MAX: 300,
    MACROALBUMINURIA_MIN: 300
  }
} as const;

export const GUIDELINE_REFERENCES = {
  ADA_2024: {
    source: 'ADA' as const,
    title: 'ADA Standards of Care in Diabetes 2024',
    url: 'https://diabetesjournals.org/care/issue/47/Supplement_1'
  },
  ICMR_2023: {
    source: 'ICMR' as const,
    title: 'ICMR Guidelines for Management of Type 2 Diabetes',
    url: 'https://main.icmr.nic.in/content/guidelines-0'
  },
  KDIGO_2023: {
    source: 'KDIGO' as const,
    title: 'KDIGO 2023 Clinical Practice Guideline for Diabetes Management in CKD',
    url: 'https://kdigo.org/guidelines/'
  },
  AHA_2017: {
    source: 'AHA' as const,
    title: 'AHA/ACC 2017 Guideline for the Prevention, Detection, Evaluation, and Management of High Blood Pressure',
    url: 'https://www.ahajournals.org/doi/10.1161/HYP.0000000000000065'
  },
  WHO_2020: {
    source: 'WHO' as const,
    title: 'WHO Cardiovascular Risk Charts for South Asia',
    url: 'https://www.who.int/publications/i/item/9789241565738'
  }
} as const;
