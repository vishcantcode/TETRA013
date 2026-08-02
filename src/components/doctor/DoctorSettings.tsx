import React, { useState } from 'react';
import { Settings, Shield, Bell, Moon, Database, CheckCircle2 } from 'lucide-react';

interface Props {
  isHighContrast: boolean;
  setIsHighContrast: (val: boolean) => void;
}

export const DoctorSettings: React.FC<Props> = ({ isHighContrast, setIsHighContrast }) => {
  const [saved, setSaved] = useState(false);
  const [hba1cThreshold, setHba1cThreshold] = useState(7.0);
  const [bpThreshold, setBpThreshold] = useState(140);
  const [autoReferral, setAutoReferral] = useState(true);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            Clinical System Settings
          </h1>
          <p className="text-xs text-slate-500">
            Configure CDSS alert thresholds, guideline integrations & EHR sync
          </p>
        </div>
        <button
          onClick={handleSave}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/20 transition flex items-center gap-1.5"
        >
          {saved ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : null}
          <span>{saved ? 'Settings Saved' : 'Save Configurations'}</span>
        </button>
      </div>

      {/* Card 1: CDSS Guideline Thresholds */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-600" />
          Clinical Decision Support Guidelines & Thresholds
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
              High HbA1c Alert Cutoff (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={hba1cThreshold}
              onChange={(e) => setHba1cThreshold(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold"
            />
            <p className="text-[10px] text-slate-400 mt-1">Triggers high-risk alert in Doctor Dashboard</p>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
              Systolic BP Alert Cutoff (mmHg)
            </label>
            <input
              type="number"
              value={bpThreshold}
              onChange={(e) => setBpThreshold(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold"
            />
            <p className="text-[10px] text-slate-400 mt-1">Stage 2 Hypertension alert baseline</p>
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer pt-2">
          <input
            type="checkbox"
            checked={autoReferral}
            onChange={(e) => setAutoReferral(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
          />
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Auto-generate Specialist Referral Drafts for High Risk Biomarker Flags
          </span>
        </label>
      </div>

      {/* Card 2: EHR Interoperability */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-600" />
          EHR System Integration (Epic / Cerner / FHIR HL7)
        </h2>

        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 rounded-xl text-xs space-y-1">
          <p className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            FHIR API Connection Status: ACTIVE
          </p>
          <p className="text-emerald-700 dark:text-emerald-400 text-[11px]">
            Real-time patient record sync with hospital EHR server endpoint.
          </p>
        </div>
      </div>

      {/* Card 3: Display & Accessibility */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Moon className="w-4 h-4 text-indigo-600" />
          Accessibility & High Contrast Display Mode
        </h2>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100">High Contrast Mode</p>
            <p className="text-[11px] text-slate-500">
              Enhances readability for high-light clinical or night shift environments
            </p>
          </div>
          <button
            onClick={() => setIsHighContrast(!isHighContrast)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              isHighContrast
                ? 'bg-yellow-400 text-black'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200'
            }`}
          >
            {isHighContrast ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </div>
    </div>
  );
};
