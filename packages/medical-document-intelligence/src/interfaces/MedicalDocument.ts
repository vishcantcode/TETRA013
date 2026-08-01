export type DocumentCategory =
  | 'Laboratory Report'
  | 'Prescription'
  | 'Diagnostic Report'
  | 'Discharge Summary'
  | 'Referral Letter'
  | 'Unknown Document';

export interface MedicalDocumentPayload {
  documentId: string;
  patientId: string;
  fileName: string;
  fileType: 'pdf' | 'image' | 'text';
  base64OrPath?: string;
  rawTextContent?: string;
  uploadedAt: string;
}
