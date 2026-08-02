import { Vitals } from '../types';

export type ParameterSeverity = 'Normal' | 'Borderline' | 'Critical';
export type ConfidenceLevel = 'High' | 'Medium' | 'Low';

export interface BoundingBox {
  x: number; // percentage from left 0-100
  y: number; // percentage from top 0-100
  width: number; // percentage width 0-100
  height: number; // percentage height 0-100
  page?: number;
}

export interface LabExtractionParameter {
  id: string;
  name: string;
  category: 'Glycemic' | 'Renal' | 'Lipid' | 'Hepatic' | 'Hematology' | 'Electrolytes' | 'Endocrine' | 'Vitamins' | 'General';
  rawValue: string;
  numericValue: number;
  rawUnit: string;
  standardizedValue: number;
  standardizedUnit: string;
  normalRange: string;
  status: ParameterSeverity;
  confidence: ConfidenceLevel;
  confidenceScore: number; // e.g. 98
  interpretation: string;
  boundingBox: BoundingBox;
  previousValue?: number;
  previousDate?: string;
  trend?: 'Increasing' | 'Stable' | 'Improving';
  isVerified: boolean;
  vitalsField?: keyof Vitals; // Field in Vitals model if applicable
}

export interface LabReportMetadata {
  patientName: string;
  patientAge: number;
  patientGender: 'Female' | 'Male' | 'Other';
  laboratoryName: string;
  collectionDate: string;
  reportDate: string;
  doctorName: string;
  reportTitle: string;
  reportCategory: string;
}

export interface LabAnalysisResult {
  id: string;
  fileInfo: {
    name: string;
    size: string;
    type: string;
    previewUrl?: string;
  };
  metadata: LabReportMetadata;
  parameters: LabExtractionParameter[];
  summary: {
    executiveSummary: string;
    abnormalFindingsText: string;
    clinicalRecommendations: string[];
  };
  confidenceAverage: number;
  unverifiedCount: number;
  counts: {
    normal: number;
    borderline: number;
    critical: number;
    total: number;
  };
  updatedVitals: Partial<Vitals>;
}
