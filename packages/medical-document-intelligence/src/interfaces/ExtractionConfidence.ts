export interface PerValueConfidence {
  metricName: string;
  ocrConfidence: number;
  medicalConfidence: number;
  validationConfidence: number;
  overallConfidence: number; // 0 to 1.0
  needsClinicianReview: boolean;
  reviewReason?: string;
}
