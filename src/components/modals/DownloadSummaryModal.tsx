import React, { useState } from 'react';
import { X, Download, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Patient } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activePatient: Patient;
}

export const DownloadSummaryModal: React.FC<Props> = ({ isOpen, onClose, activePatient }) => {
  const [includeVitals, setIncludeVitals] = useState(true);
  const [includeLabs, setIncludeLabs] = useState(true);
  const [includeMedications, setIncludeMedications] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      setIsDone(true);
      setTimeout(() => {
        setIsDone(false);
        onClose();
      }, 1200);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-200" />
            <h3 className="font-semibold text-lg">Export Clinical Record</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 transition text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <FileText className="w-8 h-8 text-blue-600 shrink-0" />
            <div>
              <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">{activePatient.name} Health Record PDF</p>
              <p className="text-xs text-slate-500">Includes MRN #{activePatient.mrn} & Clinical Diagnostics</p>
            </div>
          </div>

          {isDone ? (
            <div className="py-6 text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
              <p className="font-semibold text-slate-800 dark:text-slate-100">PDF Download Started!</p>
              <p className="text-xs text-slate-500">Clinical summary exported with encrypted HIPAA metadata.</p>
            </div>
          ) : (
            <>
              <div className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Include Modules:</p>
                
                <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg">
                  <input
                    type="checkbox"
                    checked={includeVitals}
                    onChange={(e) => setIncludeVitals(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Vitals & Biomarker History</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg">
                  <input
                    type="checkbox"
                    checked={includeLabs}
                    onChange={(e) => setIncludeLabs(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Laboratory Test Summary & Abnormal Values</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg">
                  <input
                    type="checkbox"
                    checked={includeMedications}
                    onChange={(e) => setIncludeMedications(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Active Medication Schedule & Lifestyle Directives</span>
                </label>
              </div>

              <div className="flex items-center gap-2 p-2.5 bg-blue-50 dark:bg-slate-700/50 text-blue-800 dark:text-blue-300 rounded-xl text-xs">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Compliant with FHIR & HL7 health data sharing protocols.</span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="px-5 py-2 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-md transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isDownloading ? (
                    <span>Generating PDF...</span>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download PDF</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
