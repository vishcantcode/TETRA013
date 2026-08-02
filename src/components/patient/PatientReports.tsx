import React, { useState } from 'react';
import { FileText, Download, Upload, Eye, Sparkles, CheckCircle2, AlertCircle, Building2, Calendar, FileType, X } from 'lucide-react';
import { LabReport, Patient } from '../../types';

interface Props {
  reports: LabReport[];
  activePatient: Patient;
  onOpenUploadReport: () => void;
  onOpenDownloadSummary: () => void;
  onOpenLabAnalyzer?: () => void;
}

export const PatientReports: React.FC<Props> = ({
  reports,
  activePatient,
  onOpenUploadReport,
  onOpenDownloadSummary,
  onOpenLabAnalyzer,
}) => {
  const [selectedReport, setSelectedReport] = useState<LabReport | null>(null);

  const patientReports = reports.filter((r) => r.patientId === activePatient.id || r.patientId === 'p-101');

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-600" />
            My Lab Reports & AI Diagnostic Insights
          </h1>
          <p className="text-xs text-slate-500">
            Plain-English AI translation of complex medical pathology lab numbers
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {onOpenLabAnalyzer && (
            <button
              onClick={onOpenLabAnalyzer}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Interactive OCR Pathology Workspace</span>
            </button>
          )}
          <button
            onClick={onOpenUploadReport}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/20 flex items-center gap-2 transition"
          >
            <Upload className="w-4 h-4" />
            <span>Upload PDF</span>
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {patientReports.map((report) => (
          <div
            key={report.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    {report.category}
                  </span>
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      report.status === 'Reviewed'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : report.status === 'Requires Attention'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                    }`}
                  >
                    AI Status: {report.status}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {report.title}
                </h3>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" /> Quest Diagnostics Hospital
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> {report.uploadDate}
                  </span>
                  <span>•</span>
                  <span>Size: {report.fileSize}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedReport(report)}
                  className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>View Details</span>
                </button>

                <button
                  onClick={onOpenDownloadSummary}
                  className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Plain English AI Summary */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl text-xs space-y-2">
              <span className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" /> Plain-English AI Interpretation
              </span>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {report.summary}
              </p>
            </div>

            {/* Abnormal Parameters Quick Chips */}
            {report.abnormalItems && report.abnormalItems.length > 0 && (
              <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400">Extracted Biomarkers:</span>
                {report.abnormalItems.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 rounded-lg text-[11px] font-semibold"
                  >
                    {item.parameter}: {item.value} (Normal: {item.normalRange})
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-full">
                {selectedReport.category} • Quest Diagnostics Hospital
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-3">
                {selectedReport.title}
              </h2>
              <p className="text-xs text-slate-500 mt-1">Uploaded on {selectedReport.uploadDate} • Size: {selectedReport.fileSize}</p>
            </div>

            {/* AI Summary Box */}
            <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 p-4 rounded-2xl space-y-1.5">
              <span className="text-xs font-extrabold text-emerald-900 dark:text-emerald-200 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" /> AI Clinical Interpretation
              </span>
              <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed font-medium">
                {selectedReport.summary}
              </p>
            </div>

            {/* Biomarker Parameters Table */}
            {selectedReport.abnormalItems && selectedReport.abnormalItems.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Parsed Pathology Biomarkers</h3>
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="p-3">Parameter</th>
                        <th className="p-3">Extracted Value</th>
                        <th className="p-3">Reference Range</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                      {selectedReport.abnormalItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="p-3 font-bold">{item.parameter}</td>
                          <td className="p-3 text-slate-900 dark:text-white font-extrabold">{item.value}</td>
                          <td className="p-3 text-slate-500">{item.normalRange}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                item.severity === 'High'
                                  ? 'bg-red-100 text-red-800'
                                  : item.severity === 'Low'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {item.severity}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                Close Report Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
