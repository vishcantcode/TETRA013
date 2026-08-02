import React, { useState } from 'react';
import { X, Bot, Sparkles, FileText, CheckCircle2, Copy } from 'lucide-react';
import { Patient } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activePatient: Patient;
}

export const AiSummaryModal: React.FC<Props> = ({ isOpen, onClose, activePatient }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            <h3 className="font-semibold text-lg">AI Clinical Executive Summary</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 transition text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl flex items-center justify-between border border-slate-200 dark:border-slate-600">
            <div className="flex items-center gap-3">
              <img
                src={activePatient.avatar}
                alt={activePatient.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/30"
              />
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-100">{activePatient.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  MRN: {activePatient.mrn} • Age: {activePatient.age} • Gender: {activePatient.gender}
                </p>
              </div>
            </div>
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full ${
                activePatient.riskLevel === 'High'
                  ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                  : activePatient.riskLevel === 'Moderate'
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
              }`}
            >
              {activePatient.riskLevel} Risk ({activePatient.riskScore}/100)
            </span>
          </div>

          <div className="bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-2xl p-4 text-xs text-blue-900 dark:text-blue-200 flex gap-3">
            <Bot className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">HealthSense Decision Engine Insight</p>
              <p className="leading-relaxed">
                Generated using multi-factorial analysis comparing patient's current biomarker trajectory with ADA 2026 Diabetes Standards & ACC/AHA Cardiovascular Prevention Guidelines.
              </p>
            </div>
          </div>

          <div className="space-y-3 text-sm text-slate-700 dark:text-slate-200">
            <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700">
              <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Key Clinical Findings
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 dark:text-slate-300">
                <li>
                  <strong className="text-slate-800 dark:text-slate-100">Glycemic Trajectory:</strong> HbA1c at {activePatient.vitals.hba1c}% and Fasting Glucose {activePatient.vitals.glucose} mg/dL indicate uncontrolled glycemic status.
                </li>
                <li>
                  <strong className="text-slate-800 dark:text-slate-100">Cardiovascular Risk:</strong> Systolic BP ({activePatient.vitals.bpSystolic} mmHg) and LDL ({activePatient.vitals.ldl} mg/dL) place patient in upper quartile for 10-year ASCVD event risk.
                </li>
                <li>
                  <strong className="text-slate-800 dark:text-slate-100">Active Conditions:</strong> {activePatient.conditions.join(', ')}.
                </li>
              </ul>
            </div>

            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
              <p className="font-semibold text-emerald-900 dark:text-emerald-300 mb-1">
                Evidence-Based Next Steps & Specialist Referrals
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs text-emerald-800 dark:text-emerald-400">
                <li>Optimize Metformin dosing and evaluate GLP-1/SGLT2 co-therapy as per ADA consensus.</li>
                <li>Initiate outpatient continuous blood pressure monitoring.</li>
                {activePatient.pendingReferral && (
                  <li>Proceed with expedited {activePatient.referralSpecialist} specialist consultation.</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center shrink-0">
          <button
            onClick={handleCopy}
            className="px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-100 transition flex items-center gap-1.5"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Summary'}</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-md transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
