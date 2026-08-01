export type WorkflowEventType =
  | 'PatientRegistered'
  | 'DocumentUploaded'
  | 'OCRCompleted'
  | 'RiskCalculated'
  | 'GuidelineMatched'
  | 'ReferralGenerated'
  | 'EducationGenerated'
  | 'DigitalTwinUpdated'
  | 'AnalyticsUpdated'
  | 'WorkflowCompleted';

export interface WorkflowEventPayload {
  eventId: string;
  eventType: WorkflowEventType;
  patientId: string;
  timestamp: string;
  data: any;
}
