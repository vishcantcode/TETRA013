import { OCRResult } from '../interfaces/OCRResult';
import { MedicalDocumentPayload } from '../interfaces/MedicalDocument';

export interface IOCRProvider {
  providerName: string;
  extractText(document: MedicalDocumentPayload): Promise<OCRResult>;
}

export class MockOCRProvider implements IOCRProvider {
  public providerName = 'HealthSense Mock Vision OCR';

  public async extractText(document: MedicalDocumentPayload): Promise<OCRResult> {
    const rawText = document.rawTextContent || `
PATIENT DIAGNOSTIC LABORATORY REPORT
Hospital: Civil Hospital Gandhinagar
Date: 2026-07-25
Patient Name: Ramesh Patel
Age: 54 | Gender: Male

LABORATORY INVESTIGATION RESULTS:
HbA1c (Glycated Hemoglobin): 8.4 % (Normal: < 5.7 %)
Fasting Plasma Glucose: 164 mg/dL (Normal: 70-100 mg/dL)
Serum Creatinine: 1.2 mg/dL (Normal: 0.7-1.3 mg/dL)
eGFR: 78 mL/min/1.73m2 (Normal: >= 90 mL/min)
Blood Pressure: 138 / 88 mmHg (Normal: < 120/80 mmHg)
BMI: 28.4 kg/m2 (Normal: 18.5-24.9 kg/m2)
    `.trim();

    const lines = rawText.split('\n').map((line, idx) => ({
      text: line.trim(),
      confidence: 0.96,
      lineNumber: idx + 1
    }));

    return {
      providerName: this.providerName,
      fullText: rawText,
      lines,
      overallOCRConfidence: 0.96,
      processedAt: new Date().toISOString()
    };
  }
}
