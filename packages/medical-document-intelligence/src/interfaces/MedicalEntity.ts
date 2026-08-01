export interface MedicalEntity {
  entityType: 'PatientName' | 'Age' | 'Gender' | 'ReportDate' | 'Hospital' | 'Doctor' | 'LabTest' | 'Medication';
  rawText: string;
  normalizedValue: string | number;
  confidence: number;
}
