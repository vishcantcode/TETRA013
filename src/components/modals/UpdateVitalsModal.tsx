import React, { useState } from 'react';
import { X, Activity, Save, CheckCircle2 } from 'lucide-react';
import { Patient, Vitals } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activePatient: Patient;
  onVitalsUpdated: (updatedVitals: Vitals) => void;
}

export const UpdateVitalsModal: React.FC<Props> = ({ isOpen, onClose, activePatient, onVitalsUpdated }) => {
  const [vitals, setVitals] = useState<Vitals>({ ...activePatient.vitals });
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsSuccess(true);
      onVitalsUpdated(vitals);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1000);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-200" />
            <h3 className="font-semibold text-lg">Update Vitals & Biomarkers</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 transition text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-emerald-50 dark:bg-slate-700/50 p-3 rounded-xl flex items-center gap-3 text-sm">
            <img
              src={activePatient.avatar}
              alt={activePatient.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/30"
            />
            <div>
              <p className="font-medium text-slate-800 dark:text-slate-200">{activePatient.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">MRN: {activePatient.mrn} • Current Risk: {activePatient.riskLevel}</p>
            </div>
          </div>

          {isSuccess ? (
            <div className="py-8 text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
              <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">Vitals Updated!</p>
              <p className="text-sm text-slate-500">Risk scores updated across active care team dashboard.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">
                    Systolic BP (mmHg)
                  </label>
                  <input
                    type="number"
                    value={vitals.bpSystolic}
                    onChange={(e) => setVitals({ ...vitals, bpSystolic: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">
                    Diastolic BP (mmHg)
                  </label>
                  <input
                    type="number"
                    value={vitals.bpDiastolic}
                    onChange={(e) => setVitals({ ...vitals, bpDiastolic: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">
                    Fasting Glucose (mg/dL)
                  </label>
                  <input
                    type="number"
                    value={vitals.glucose}
                    onChange={(e) => setVitals({ ...vitals, glucose: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">
                    HbA1c (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={vitals.hba1c}
                    onChange={(e) => setVitals({ ...vitals, hba1c: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">
                    LDL Cholesterol (mg/dL)
                  </label>
                  <input
                    type="number"
                    value={vitals.ldl}
                    onChange={(e) => setVitals({ ...vitals, ldl: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">
                    Body Mass Index (BMI)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={vitals.bmi}
                    onChange={(e) => setVitals({ ...vitals, bmi: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

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
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Vitals</span>
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
