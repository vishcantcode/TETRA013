import React, { useState } from 'react';
import {
  Search,
  Plus,
  ChevronRight,
  Activity,
  AlertCircle,
  Pill,
  Send,
  UserCheck,
} from 'lucide-react';
import { Patient } from '../../types';

interface Props {
  patients: Patient[];
  activePatient: Patient;
  setActivePatient: (p: Patient) => void;
  onOpenNewAssessment: () => void;
  onOpenUploadReport: () => void;
  onOpenAiSummary: () => void;
}

export const PatientsList: React.FC<Props> = ({
  patients,
  activePatient,
  setActivePatient,
  onOpenNewAssessment,
  onOpenUploadReport,
  onOpenAiSummary,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<'All' | 'High' | 'Moderate' | 'Low'>('All');

  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.conditions.some((c) => c.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRisk = riskFilter === 'All' || p.riskLevel === riskFilter;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Patient EHR Directory</h1>
          <p className="text-xs text-slate-500">
            Real-time lifestyle disease screening profiles & risk stratification
          </p>
        </div>

        <button
          onClick={onOpenNewAssessment}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs shadow-md shadow-blue-600/20 flex items-center gap-2 self-start sm:self-auto transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Patient Assessment</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, MRN, condition (e.g. Eleanor, Diabetes)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Risk Level Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {(['All', 'High', 'Moderate', 'Low'] as const).map((risk) => (
            <button
              key={risk}
              onClick={() => setRiskFilter(risk)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                riskFilter === risk
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {risk === 'All' ? 'All Patients' : `${risk} Risk`}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Patients List Table + Active Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Table Column */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/80 uppercase text-[10px] font-bold tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Patient</th>
                  <th className="py-3.5 px-4">Risk Level</th>
                  <th className="py-3.5 px-4">Biomarkers</th>
                  <th className="py-3.5 px-4">Active Conditions</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredPatients.map((p) => {
                  const isSelected = activePatient.id === p.id;
                  return (
                    <tr
                      key={p.id}
                      onClick={() => setActivePatient(p)}
                      className={`cursor-pointer transition ${
                        isSelected
                          ? 'bg-blue-50/80 dark:bg-slate-800/80 font-medium'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.avatar}
                            alt={p.name}
                            className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                          />
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white text-xs">{p.name}</p>
                            <p className="text-[10px] text-slate-400">MRN {p.mrn} • {p.age}y {p.gender}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            p.riskLevel === 'High'
                              ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                              : p.riskLevel === 'Moderate'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {p.riskLevel} ({p.riskScore}/100)
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="text-slate-800 dark:text-slate-200 font-medium">
                          BP {p.vitals.bpSystolic}/{p.vitals.bpDiastolic}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          HbA1c {p.vitals.hba1c}% • Glu {p.vitals.glucose}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 max-w-[180px]">
                        <p className="truncate text-[11px] text-slate-600 dark:text-slate-400">
                          {p.conditions.join(', ')}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button className="p-1 rounded-lg text-blue-600 hover:bg-blue-100 dark:hover:bg-slate-700 transition">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Patient Detailed EHR Profile Column */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Selected EHR Profile
            </span>
            <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
              Primary Care
            </span>
          </div>

          <div className="flex items-center gap-4">
            <img
              src={activePatient.avatar}
              alt={activePatient.name}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-blue-500/30"
            />
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">{activePatient.name}</h3>
              <p className="text-xs text-slate-500">
                MRN #{activePatient.mrn} • {activePatient.age} yrs • {activePatient.gender}
              </p>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-0.5 font-medium">
                Dr. Arthur Pendelton, MD
              </p>
            </div>
          </div>

          {/* Vitals Summary Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <span className="text-slate-400 text-[10px] block">Blood Pressure</span>
              <span className="font-bold text-slate-800 dark:text-slate-100">
                {activePatient.vitals.bpSystolic}/{activePatient.vitals.bpDiastolic} mmHg
              </span>
            </div>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <span className="text-slate-400 text-[10px] block">HbA1c Level</span>
              <span className="font-bold text-slate-800 dark:text-slate-100">{activePatient.vitals.hba1c}%</span>
            </div>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <span className="text-slate-400 text-[10px] block">Fasting Glucose</span>
              <span className="font-bold text-slate-800 dark:text-slate-100">{activePatient.vitals.glucose} mg/dL</span>
            </div>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <span className="text-slate-400 text-[10px] block">LDL Cholesterol</span>
              <span className="font-bold text-slate-800 dark:text-slate-100">{activePatient.vitals.ldl} mg/dL</span>
            </div>
          </div>

          {/* Active Conditions */}
          <div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 block">
              Active Clinical Diagnostics
            </span>
            <div className="flex flex-wrap gap-1.5">
              {activePatient.conditions.map((c, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-medium"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Active Medications List */}
          <div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 block flex items-center gap-1">
              <Pill className="w-3.5 h-3.5 text-blue-600" />
              Prescribed Medications
            </span>
            <div className="space-y-1.5 text-xs">
              {activePatient.medications.map((m) => (
                <div key={m.id} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg flex justify-between">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{m.name} ({m.dosage})</p>
                    <p className="text-[10px] text-slate-400">{m.frequency}</p>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-semibold self-center">Active</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Action Buttons for Active Patient */}
          <div className="pt-2 space-y-2">
            <button
              onClick={onOpenAiSummary}
              className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/20 hover:from-blue-700 hover:to-indigo-700 transition"
            >
              Generate AI Clinical Summary
            </button>
            <button
              onClick={onOpenUploadReport}
              className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition"
            >
              Upload Lab or Diagnostic Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
