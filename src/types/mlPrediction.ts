export interface MlPatientPayload {
  patientId: string;
  name: string;
  age: number;
  gender: string;
  heightCm: number;
  weightKg: number;
  bmi: number;
  smokingStatus: 'Never' | 'Former' | 'Current' | 'Heavy';
  alcoholStatus: 'None' | 'Occasional' | 'Moderate' | 'Heavy';
  exerciseFrequency: 'Sedentary' | '1-2 days/wk' | '3-4 days/wk' | '5+ days/wk';
  vitals: {
    bpSystolic: number;
    bpDiastolic: number;
    heartRate: number;
    respiratoryRate?: number;
    spo2?: number;
    temperature?: number;
  };
  labValues: {
    fastingGlucose: number;
    hba1c: number;
    creatinine: number;
    eGFR: number;
    totalCholesterol: number;
    ldl: number;
    hdl: number;
    triglycerides: number;
    bun?: number;
    urineAlbumin?: number;
  };
  medicalHistory: string[];
  familyHistory: string[];
  symptoms: string[];
  currentMedications: string[];
}

export interface MlContributor {
  id: string;
  featureName: string;
  parameterKey: string;
  value: string | number;
  impactWeightPercent: number; // e.g., +38 or -15
  type: 'Positive' | 'Negative'; // Positive = increases risk, Negative = protective factor
  clinicalReason: string;
  significance: string;
}

export interface MlFeatureImportance {
  topFeatures: MlContributor[];
  positiveContributors: MlContributor[];
  negativeContributors: MlContributor[];
  missingInformation: string[];
}

export interface MlDiseasePrediction {
  disease: 'Type 2 Diabetes' | 'Essential Hypertension' | 'Chronic Kidney Disease' | 'Cardiovascular Disease' | 'Ischemic Stroke' | string;
  diseaseCode: string; // ICD-10
  riskPercentage: number; // 0 - 100
  riskCategory: 'Low' | 'Moderate' | 'High' | 'Critical';
  confidence: 'High' | 'Medium' | 'Low';
  confidenceScore: number; // 0.0 - 1.0
  confidenceRationale: string;
  // New fields from ConfidenceAssessmentEngine
  confidencePercentage?: number; // 0-100
  confidenceLevel?: 'High' | 'Medium' | 'Low';
  confidenceReason?: string;
  missingInputs?: string[];
  estimatedValues?: string[];
  evidenceQuality?: string[];
  description: string;
  featureImportance: MlFeatureImportance;
  modelVersion: string;
  predictionTimestamp: string;
  historicalRiskTimeline?: {
    date: string;
    riskPercentage: number;
    category: 'Low' | 'Moderate' | 'High' | 'Critical';
  }[];
}

export interface MlPredictionResponse {
  status: 'success' | 'error';
  errorMessage?: string;
  patientId: string;
  predictionTimestamp: string;
  modelVersion: string;
  apiVersion: string;
  endpointCalled: string;
  executionTimeMs: number;
  predictions: MlDiseasePrediction[];
  payloadSummary: {
    availableVitalsCount: number;
    availableLabsCount: number;
    missingFields: string[];
    completenessRatio: number;
  };
}
