import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Patient } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activePatient: Patient;
  onReportUploaded?: (title: string, category: string) => void;
  onLaunchLabAnalyzer?: () => void;
}

export const UploadReportModal: React.FC<Props> = ({ isOpen, onClose, activePatient, onReportUploaded, onLaunchLabAnalyzer }) => {
  const [file, setFile] = useState<File | null>(null);
  const [reportTitle, setReportTitle] = useState('');
  const [category, setCategory] = useState<'Lab Test' | 'ECG' | 'Imaging' | 'Genomics'>('Lab Test');
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    setTimeout(() => {
      setIsUploading(false);
      setIsSuccess(true);
      if (onReportUploaded) {
        onReportUploaded(reportTitle || 'Lab Analysis Report', category);
      }
      setTimeout(() => {
        setIsSuccess(false);
        setFile(null);
        setReportTitle('');
        onClose();
      }, 1200);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-emerald-600 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-emerald-200" />
            <h3 className="font-semibold text-lg">Upload Medical Report</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 transition text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleUpload} className="p-6 space-y-4">
          <div className="bg-blue-50 dark:bg-slate-700/50 p-3 rounded-xl flex items-center gap-3 text-sm">
            <img
              src={activePatient.avatar}
              alt={activePatient.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/30"
            />
            <div>
              <p className="font-medium text-slate-800 dark:text-slate-200">Patient: {activePatient.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">MRN: {activePatient.mrn} • Age {activePatient.age}</p>
            </div>
          </div>

          {isSuccess ? (
            <div className="py-8 text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
              <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">Report Uploaded Successfully!</p>
              <p className="text-sm text-slate-500">AI Parser is analyzing key biomarker ranges...</p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Report Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fasting Blood Glucose & Lipid Panel"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Report Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Lab Test">Lab Test (Blood, Urine, Metabolic)</option>
                  <option value="ECG">ECG / Cardiac Trace</option>
                  <option value="Imaging">Imaging (Ultrasound, X-Ray, MRI)</option>
                  <option value="Genomics">Genomics / Hereditary Panel</option>
                </select>
              </div>

              {/* Drag and Drop Zone */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Select File (PDF, DICOM, PNG, JPG)
                </label>
                <div
                  className="border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 rounded-2xl p-6 text-center bg-slate-50 dark:bg-slate-700/30 transition cursor-pointer"
                  onClick={() => document.getElementById('report-file-input')?.click()}
                >
                  <input
                    id="report-file-input"
                    type="file"
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg,.dcm"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFile(e.target.files[0]);
                      }
                    }}
                  />
                  {file ? (
                    <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium text-sm">
                      <FileText className="w-5 h-5" />
                      <span>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        Click or drag file to upload
                      </p>
                      <p className="text-xs text-slate-400">PDF, JPG, PNG up to 25MB</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 rounded-xl text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>AI Clinical parser automatically extracts biomarker levels and compares against standard laboratory reference ranges.</span>
              </div>

              {onLaunchLabAnalyzer && (
                <button
                  type="button"
                  onClick={onLaunchLabAnalyzer}
                  className="w-full py-2.5 px-4 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Launch Split-Screen Pathology OCR Workspace</span>
                </button>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing File...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Upload & Extract</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
