import { DocumentCategory } from '../interfaces/MedicalDocument';

export class DocumentClassifier {
  public static classify(text: string): DocumentCategory {
    const lower = text.toLowerCase();

    if (lower.includes('laboratory') || lower.includes('lab report') || lower.includes('investigation results') || lower.includes('hba1c') || lower.includes('blood test')) {
      return 'Laboratory Report';
    }

    if (lower.includes('prescription') || lower.includes('rx') || lower.includes('take 1 tablet') || lower.includes('dosage')) {
      return 'Prescription';
    }

    if (lower.includes('ecg') || lower.includes('ultrasound') || lower.includes('x-ray') || lower.includes('ct scan')) {
      return 'Diagnostic Report';
    }

    if (lower.includes('discharge summary') || lower.includes('admission date')) {
      return 'Discharge Summary';
    }

    if (lower.includes('referral letter') || lower.includes('referred to')) {
      return 'Referral Letter';
    }

    return 'Unknown Document';
  }
}
