import { PerValueConfidence } from './ExtractionConfidence';

export interface ExtractedObservation {
  id: string;
  loincCode: string;
  testName: string;
  value: number;
  unit: string;
  referenceRangeText: string;
  interpretationFlag: 'normal' | 'low' | 'high' | 'critical';
  confidence: PerValueConfidence;
}
