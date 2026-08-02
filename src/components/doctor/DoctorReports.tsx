import React from 'react';
import {
  FileBarChart,
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Brain,
  Download,
  Search,
} from 'lucide-react';
import { LabReport, Patient } from '../../types';

interface Props {
  reports: LabReport[];
  activePatient: Patient;
  onOpenUploadReport: () => void;
  onOpenAiSummary: () => void;
  onOpenLabAnalyzer?: () => void;
}

export const DoctorReports: React.FC<Props> = ({
  reports,
  activePatient,
  onOpenUploadReport,
  onOpenAiSummary,
  onOpenLabAnalyzer,
}) => {
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileBarChart className="w-6 h-6 text-blue-600" />
            Clinical Reports & Lab Parsing
          </h1>
          <p className="text-xs text-slate-500">
            AI-assisted biomarker extraction, DICOM/ECG viewer & lab trend reports
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenLabAnalyzer && (
            <button
              onClick={onOpenLabAnalyzer}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition"
            >
              <Brain className="w-4 h-4" />
              <span>Launch OCR Pathology Workspace</span>
            </button>
          )}
          <button
            onClick={onOpenUploadReport}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs shadow-md shadow-blue-600/20 flex items-center gap-2 transition"
          >
            <Upload className="w-4 h-4" />
            <span>Upload PDF / Image</span>
          </button>
        </div>
      </div>

      {/* Reports List Cards */}
      <div className="space-y-4">
        {reports.map((report) => (
          <div
            key={report.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 hover:shadow-md transition"
          >
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{report.title}</h3>
                  <p className="text-xs text-slate-500">
                    Patient: <strong className="text-slate-800 dark:text-slate-200">{report.patientName}</strong> • Category: {report.category} • Uploaded: {report.uploadDate}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    report.status === 'Requires Attention'
                      ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}
                >
                  {report.status}
                </span>
                <span className="text-xs text-slate-400 font-medium">{report.fileSize}</span>
              </div>
            </div>

            {/* AI Summary Box */}
            <div className="p-3.5 bg-blue-50/60 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-700 rounded-xl text-xs space-y-1">
              <span className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-blue-600" />
                AI Parsing & Biomarker Extraction Summary
              </span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{report.summary}</p>
            </div>

            {/* Abnormal Values Table */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                Extracted Abnormal Biomarkers
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {report.abnormalItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-500">{item.parameter}</span>
                      <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 rounded">
                        {item.severity}
                      </span>
                    </div>
                    <p className="text-sm font-extrabold text-slate-900 dark:text-white">{item.value}</p>
                    <p className="text-[10px] text-slate-400">Normal Ref: {item.normalRange}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex justify-end gap-2">
              {onOpenLabAnalyzer && (
                <button
                  onClick={onOpenLabAnalyzer}
                  className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Brain className="w-3.5 h-3.5" />
                  <span>Inspect OCR Split-Screen Workspace</span>
                </button>
              )}
              <button
                onClick={onOpenAiSummary}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
              >
                View Full AI Clinical Summary
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
