import React, { useState } from 'react';
import { FileUp, CheckCircle, FileText, Database } from 'lucide-react';
import { TopNavigation } from '../components/TopNavigation';
import { UploadZone } from '../components/ui/UploadZone';
import { LabTable } from '../components/ui/LabTable';

export default function OCRUploadPage() {
  const [ocrResult, setOcrResult] = useState<any | null>(null);

  return (
    <div className="space-y-6 animate-in">
      <TopNavigation />

      <div className="flex-between">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <FileUp className="w-5 h-5 text-accent" /> Medical Document & OCR Intelligence
          </h2>
          <p className="text-xs text-secondary">
            Upload scanned lab reports or prescriptions to extract LOINC observations and map directly into FHIR resources
          </p>
        </div>
      </div>

      {/* Upload Zone Component */}
      <UploadZone onOCRComplete={(res) => setOcrResult(res)} />

      {/* Extracted Results View */}
      {ocrResult && (
        <div className="space-y-4 animate-in">
          <div className="card p-4 flex-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-accent" />
              <div>
                <h4 className="text-sm font-bold text-white">Processed File: {ocrResult.documentId}</h4>
                <p className="text-xs text-secondary">Extracted Category: <strong className="text-white">{ocrResult.category}</strong></p>
              </div>
            </div>
            <span className="badge badge-success">FHIR DiagnosticReport Created</span>
          </div>

          <div className="card p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-accent" /> Extracted FHIR LOINC Observations
            </h3>
            <LabTable observations={ocrResult.extractedObservations} />
          </div>
        </div>
      )}
    </div>
  );
}
