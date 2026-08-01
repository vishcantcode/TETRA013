import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle, Loader2, Sparkles, Check, Database } from 'lucide-react';
import { DocumentIntelligenceEngine } from '@healthsense/medical-document-intelligence';
import { useCDSS } from '../../context/CDSSContext';
import { api } from '../../api';

export const UploadZone: React.FC<{ onOCRComplete?: (res: any) => void }> = ({ onOCRComplete }) => {
  const { patient } = useCDSS();
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedResult, setExtractedResult] = useState<any | null>(null);
  const [ocrData, setOcrData] = useState<any | null>(null);

  const docEngine = new DocumentIntelligenceEngine();

  const handleSimulatedUpload = async (sampleText?: string, filename = 'lab_report_scan.pdf') => {
    setIsProcessing(true);
    setExtractedResult(null);
    setOcrData(null);

    const rawText = sampleText || `
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
Total Cholesterol: 215 mg/dL
Triglycerides: 185 mg/dL
    `.trim();

    try {
      // Call Express Backend API /api/ocr
      const backendResult = await api.cdss.ocr({ documentText: rawText, filename }).catch(() => null);
      if (backendResult && backendResult.extractedData) {
        setOcrData(backendResult.extractedData);
      }
    } catch (e) {
      console.warn('Backend OCR call failed, falling back to client-side document engine:', e);
    }

    const payload = {
      documentId: `doc-${Date.now()}`,
      patientId: patient.id,
      fileName: filename,
      fileType: 'pdf' as const,
      uploadedAt: new Date().toISOString(),
      rawTextContent: rawText
    };

    const res = await docEngine.processDocumentAndEvaluate(payload, patient);
    setIsProcessing(false);
    setExtractedResult(res);
    if (onOCRComplete) onOCRComplete(res);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Drag & Drop File Zone */}
      <div
        className="card"
        style={{
          padding: 32, border: '2px dashed rgba(56,189,248,0.3)',
          textAlign: 'center', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          gap: 12, background: 'rgba(30,41,59,0.5)', transition: 'all 0.2s'
        }}
        onClick={() => handleSimulatedUpload()}
      >
        <UploadCloud style={{ width: 40, height: 40, color: '#38bdf8' }} />
        <div>
          <h4 style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Upload Lab Report PDF / Scanned Image (PNG, JPEG)</h4>
          <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Auto-extracts HbA1c, Fasting Sugar, Creatinine, eGFR, BP, BMI, Lipids</p>
        </div>
        <button className="btn btn-primary btn-sm" disabled={isProcessing} style={{ marginTop: 8 }}>
          {isProcessing ? <><Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> Extracting via Express Backend OCR...</> : 'Browse File / Execute OCR'}
        </button>
      </div>

      {/* Preset Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: '#64748b' }}>Quick Sample OCR Presets:</span>
        <button
          className="btn btn-secondary btn-sm"
          style={{ fontSize: 11 }}
          onClick={() => handleSimulatedUpload('HbA1c: 8.4%\nFasting Glucose: 164 mg/dL\neGFR: 78 mL/min\nBP: 138/88 mmHg', 'diabetes_panel.pdf')}
        >
          Diabetic & CKD Lab Report
        </button>
        <button
          className="btn btn-secondary btn-sm"
          style={{ fontSize: 11 }}
          onClick={() => handleSimulatedUpload('BP: 154/96 mmHg\nTotal Cholesterol: 240 mg/dL\nBMI: 29.2', 'cardio_panel.pdf')}
        >
          Hypertension & ASCVD Panel
        </button>
      </div>

      {/* OCR Data Auto-populate Cards */}
      {ocrData && (
        <div className="card" style={{ padding: 20, borderLeft: '4px solid #22c55e' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle style={{ width: 16, height: 16 }} /> Express Backend OCR Extraction Complete
            </span>
            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 999, background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
              Auto-Populated Form
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
            {ocrData.hba1c && <div style={{ padding: 10, borderRadius: 10, background: 'rgba(255,255,255,0.04)', fontSize: 11 }}><div style={{ color: '#64748b' }}>HbA1c</div><div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{ocrData.hba1c}%</div></div>}
            {ocrData.fastingGlucose && <div style={{ padding: 10, borderRadius: 10, background: 'rgba(255,255,255,0.04)', fontSize: 11 }}><div style={{ color: '#64748b' }}>Fasting Glucose</div><div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{ocrData.fastingGlucose} mg/dL</div></div>}
            {ocrData.serumCreatinine && <div style={{ padding: 10, borderRadius: 10, background: 'rgba(255,255,255,0.04)', fontSize: 11 }}><div style={{ color: '#64748b' }}>Creatinine</div><div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{ocrData.serumCreatinine} mg/dL</div></div>}
            {ocrData.egfr && <div style={{ padding: 10, borderRadius: 10, background: 'rgba(255,255,255,0.04)', fontSize: 11 }}><div style={{ color: '#64748b' }}>eGFR</div><div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{ocrData.egfr} mL/min</div></div>}
            {ocrData.systolicBP && <div style={{ padding: 10, borderRadius: 10, background: 'rgba(255,255,255,0.04)', fontSize: 11 }}><div style={{ color: '#64748b' }}>BP</div><div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{ocrData.systolicBP}/{ocrData.diastolicBP || 80} mmHg</div></div>}
            {ocrData.bmi && <div style={{ padding: 10, borderRadius: 10, background: 'rgba(255,255,255,0.04)', fontSize: 11 }}><div style={{ color: '#64748b' }}>BMI</div><div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{ocrData.bmi} kg/m²</div></div>}
          </div>
        </div>
      )}
    </div>
  );
};
