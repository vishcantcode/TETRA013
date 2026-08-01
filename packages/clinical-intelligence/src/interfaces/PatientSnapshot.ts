import { ClinicalGender } from '@healthsense/clinical-models';

export interface ClinicalFeatureVector {
  // Demographics & Lifestyle
  age: number;
  gender: ClinicalGender;
  smoking: boolean;
  alcohol: boolean;
  familyHistoryDiabetes: boolean;
  familyHistoryHypertension: boolean;
  familyHistoryCVD: boolean;
  physicalActivityLevel: 'low' | 'moderate' | 'high';

  // Physical Measurements
  systolicBP: number | null;
  diastolicBP: number | null;
  bmi: number | null;
  pulse: number | null;
  waistCircumferenceCm: number | null;

  // Key Laboratory Biomarkers
  hba1c: number | null;
  fastingGlucose: number | null;
  randomGlucose: number | null;
  serumCreatinine: number | null;
  egfr: number | null;
  uacr: number | null;
  totalCholesterol: number | null;
  hdl: number | null;
  ldl: number | null;
  triglycerides: number | null;

  // Diagnosed Conditions & Prescriptions
  activeConditions: string[];
  activeMedications: string[];
}

export interface PatientSnapshot {
  patientId: string;
  timestamp: string;
  features: ClinicalFeatureVector;
  rawResourcesCount: {
    observations: number;
    conditions: number;
    medications: number;
  };
}
