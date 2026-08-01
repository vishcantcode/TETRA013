import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { DocumentIntelligenceEngine } from '@healthsense/medical-document-intelligence';
import { useCDSS } from '../../context/CDSSContext';

export const UploadZone: React.FC<{ onOCRComplete?: (res: any) => void }> = ({ onOCRComplete }) => {
  const { patient } = useCDSS();
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedResult, setExtractedResult] = useState<any | null>(null);

  const docEngine = new DocumentIntelligenceEngine();

  const handleSimulatedUpload = async (sampleText?: string) => {
    setIsProcessing(true);
    setExtractedResult(null);

    const payload = {
      documentId: `doc-${Date.now()}`,
      patientId: patient.id,
      fileName: 'ramesh_patel_lab_report.pdf',
      fileType: 'pdf' as const,
      uploadedAt: new Date().toISOString(),
      rawTextContent: sampleText || `
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
      `.trim()
    };

    setTimeout(async () => {
      const res = await docEngine.processDocumentAndEvaluate(payload, patient);
      setIsProcessing(false);
      setExtractedResult(res);
      if (onOCRComplete) onOCRComplete(res);
    }, 1200);
  };

  return (
    <div className="space-y-4">
      <div
        className="card p-8 border-2 border-dashed border-border hover:border-accent transition-all text-center flex flex-col items-center justify-center cursor-pointer space-y-3"
        onClick={() => handleSimulatedUpload()}
      >
        <UploadCloud className="w-10 h-10 text-accent animate-bounce" />
        <div>
          <h4 className="text-sm font-bold text-white">Drag and Drop Medical Report / Prescription PDF</h4>
          <p className="text-xs text-secondary mt-1">Supports PDF, PNG, JPG scanned documents from diagnostic laboratories</p>
        </div>
        <button className="btn btn-primary btn-sm mt-2" disabled={isProcessing}>
          {isProcessing ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing OCR...</> : 'Browse Files / Run Sample OCR'}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-secondary">Quick Sample OCR Presets:</span>
        <button
          className="btn btn-secondary btn-sm text-xs"
          onClick={() => handleSimulatedUpload('HbA1c: 8.4%\nFasting Glucose: 164 mg/dL\neGFR: 78 mL/min\nBP: 138/88 mmHg')}
        >
          Diabetic & CKD Lab Report
        </button>
        <button
          className="btn btn-secondary btn-sm text-xs"
          onClick={() => handleSimulatedUpload('BP: 154/96 mmHg\nTotal Cholesterol: 240 mg/dL\nBMI: 29.2')}
        >
          Hypertension & ASCVD Panel
        </button>
      </div>

      {extractedResult && (
        <div className="explainability-box animate-in space-y-2">
          <div className="flex-between">
            <span className="text-xs font-bold text-success flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> OCR Document Intelligence Extraction Complete
            </span>
            <span className="badge badge-accent">Category: {extractedResult.category}</span>
          </div>
          <p className="text-xs text-secondary">
            Extracted <strong className="text-white">{extractedResult.extractedObservations.length} LOINC Observations</strong>. Diagnostic Report generated and mapped to FHIR format.
          </p>
        </div>
      )}
    </div>
  );
};
