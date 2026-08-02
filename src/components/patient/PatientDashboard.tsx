import React, { useState } from 'react';
import {
  HeartPulse,
  Bell,
  FileText,
  Calendar,
  Pill,
  Upload,
  Activity,
  Sparkles,
  Download,
  CheckCircle2,
  Clock,
  Check,
  TrendingUp,
  ShieldAlert,
  UserCheck,
  Stethoscope,
  ArrowRight,
  AlertTriangle,
  ChevronRight,
  CalendarCheck,
  Utensils,
  Camera,
} from 'lucide-react';
import { Patient, LabReport } from '../../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useLanguage } from '../../context/LanguageContext';

interface Props {
  activePatient: Patient;
  reports: LabReport[];
  onOpenUploadReport: () => void;
  onOpenUpdateVitals: () => void;
  onOpenAiSummary: () => void;
  onOpenDownloadSummary: () => void;
  onNavigateToTab: (tab: any) => void;
}

export const PatientDashboard: React.FC<Props> = ({
  activePatient,
  reports,
  onOpenUploadReport,
  onOpenUpdateVitals,
  onOpenAiSummary,
  onOpenDownloadSummary,
  onNavigateToTab,
}) => {
  const { t } = useLanguage();

  const [meds, setMeds] = useState(
    activePatient.medications.length > 0
      ? activePatient.medications
      : [
          { id: 'm1', name: 'Metformin', dosage: '500 mg', frequency: 'Twice daily with meals', purpose: 'Glycemic Control', takenToday: true },
          { id: 'm2', name: 'Lisinopril', dosage: '10 mg', frequency: 'Once daily in morning', purpose: 'Blood Pressure Regulation', takenToday: false },
          { id: 'm3', name: 'Atorvastatin', dosage: '20 mg', frequency: 'Once daily at bedtime', purpose: 'Lipid Management', takenToday: false },
        ]
  );

  const toggleMed = (id: string) => {
    setMeds(
      meds.map((m) => (m.id === id ? { ...m, takenToday: !m.takenToday } : m))
    );
  };

  const todayDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const patientReport = reports.find((r) => r.patientId === activePatient.id) || reports[0];

  // Approved Doctor Recommendations
  const doctorApprovedRecommendations = [
    { id: 'dr-1', task: 'Complete HbA1c blood test within 1 week', deadline: 'Due Aug 8, 2026', status: 'Pending' },
    { id: 'dr-2', task: 'Reduce dietary sodium intake below 2,000 mg/day', deadline: 'Ongoing Lifestyle', status: 'In Progress' },
    { id: 'dr-3', task: 'Walk 30 minutes daily at moderate pace', deadline: 'Daily Routine', status: 'In Progress' },
    { id: 'dr-4', task: 'Monitor resting BP twice weekly (morning & evening)', deadline: 'Bi-Weekly Log', status: 'Active' },
    { id: 'dr-5', task: 'Repeat serum creatinine & eGFR panel after 1 month', deadline: 'Due Aug 28, 2026', status: 'Scheduled' },
  ];

  // Care Journey Steps
  const careJourneySteps = [
    { id: 'cj-1', title: 'Health Assessment Completed', date: 'June 18, 2026', status: 'Completed', desc: '10-Stage CDSS Risk Pipeline completed with Dr. Arthur Pendelton.' },
    { id: 'cj-2', title: 'Blood Report Uploaded', date: 'July 28, 2026', status: 'Completed', desc: 'Metabolic panel & renal biomarkers parsed via OCR.' },
    { id: 'cj-3', title: 'AI Analysis Completed', date: 'July 28, 2026', status: 'Completed', desc: 'AI summary & biomarker ranges verified.' },
    { id: 'cj-4', title: 'Doctor Reviewed Results', date: 'July 29, 2026', status: 'Completed', desc: 'Dr. Pendelton signed off on clinical recommendations.' },
    { id: 'cj-5', title: 'Lifestyle Plan Generated', date: 'July 29, 2026', status: 'Active', desc: 'Dietary sodium and exercise regimen active.' },
    { id: 'cj-6', title: 'Follow-up Scheduled', date: 'August 12, 2026', status: 'Upcoming', desc: 'In-person clinic consultation booked for 10:30 AM.' },
    { id: 'cj-7', title: 'Repeat Investigation Due', date: 'August 28, 2026', status: 'Scheduled', desc: 'Repeat serum creatinine & eGFR lab test.' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* 1. EMERGENCY ALERTS WARNING */}
      <div className="bg-amber-50 dark:bg-amber-950/60 border-2 border-amber-300 dark:border-amber-800 rounded-2xl p-4 flex items-start gap-3.5 shadow-sm">
        <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 animate-pulse" />
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-amber-900 dark:text-amber-200 uppercase tracking-wider text-[11px]">
              {t('emergencySigns', 'Emergency Warning & Safety Notice')}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 rounded-md">
              Clinical Policy
            </span>
          </div>
          <p className="text-amber-800 dark:text-amber-300 leading-relaxed font-medium">
            Chest pain with shortness of breath, sudden numbness, severe dizziness, or acute weakness requires immediate medical attention. Please seek emergency medical care immediately. HealthSense AI provides companion monitoring connected with your physician, but <strong>never provides emergency diagnoses</strong>.
          </p>
        </div>
      </div>

      {/* 2. WELCOME CARD */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-blue-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-200 text-xs font-bold uppercase tracking-wider">
              <span>{todayDateFormatted}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" /> Direct Digital Companion
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {t('welcomeBack', 'Welcome back')}, {activePatient.name}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-emerald-100 font-medium pt-1">
              <span>Primary Doctor: <strong className="text-white font-bold">{activePatient.primaryDoctor}</strong></span>
              <span>•</span>
              <span>Last Consultation: <strong className="text-white font-bold">{activePatient.lastAssessmentDate || 'June 18, 2026'}</strong></span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigateToTab('food-scanner')}
              className="bg-teal-400 hover:bg-teal-300 text-slate-950 px-4 py-3.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg hover:scale-105 transition cursor-pointer"
            >
              <Camera className="w-4 h-4 text-slate-950" />
              <span>{t('tabFoodScanner', 'AI Food Scanner')}</span>
            </button>

            <button
              onClick={() => onNavigateToTab('diet-planner')}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-3.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg hover:scale-105 transition cursor-pointer"
            >
              <Utensils className="w-4 h-4 text-slate-950" />
              <span>{t('dietPlannerTitle', 'AI Indian Diet Planner')}</span>
            </button>

            <button
              onClick={() => onNavigateToTab('health-planner')}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-3.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg hover:scale-105 transition cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4 text-slate-950" />
              <span>{t('dailyTasksTitle', 'AI Daily Health Planner')}</span>
            </button>

            <button
              onClick={() => onNavigateToTab('ai-companion')}
              className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 px-4 py-3.5 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg hover:scale-105 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>{t('askCompanion', 'Ask Health Companion')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. LARGE HEALTH SUMMARY CARD & AI HEALTH SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Large Health Summary (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                {t('healthSummary', 'Patient Health Summary')}
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
                <HeartPulse className="w-5 h-5 text-emerald-600" />
                {t('todaysHealthScore', "Today's Health Score")}: <span className="text-emerald-600 font-extrabold">82 / 100</span>
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">{t('riskLevel', 'Risk Level')}:</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-extrabold shadow-sm ${
                  activePatient.riskLevel === 'High'
                    ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                    : activePatient.riskLevel === 'Moderate'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                }`}
              >
                {activePatient.riskLevel === 'High' ? t('highRisk', 'High Risk') : activePatient.riskLevel === 'Moderate' ? t('moderateRisk', 'Moderate Risk') : t('lowRisk', 'Low Risk')} ({activePatient.riskScore || 35}%)
              </span>
            </div>
          </div>

          {/* Current Focus Areas */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-3">
              {t('vitalSigns', 'Vital Signs & Biomarkers')}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">1. {t('bloodPressure', 'Blood Pressure')}</span>
                <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {activePatient.vitals.bpSystolic}/{activePatient.vitals.bpDiastolic} <span className="text-[10px] font-normal text-slate-500">mmHg</span>
                </p>
                <p className="text-[10px] text-slate-500 font-medium">Target: &lt; 120/80 mmHg</p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">2. {t('glucose', 'Blood Glucose')}</span>
                <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {activePatient.vitals.glucose} <span className="text-[10px] font-normal text-slate-500">mg/dL</span>
                </p>
                <p className="text-[10px] text-slate-500 font-medium">{t('hba1c', 'HbA1c')}: {activePatient.vitals.hba1c}%</p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">3. {t('bmi', 'BMI')}</span>
                <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {activePatient.vitals.bmi} <span className="text-[10px] font-normal text-slate-500">kg/m²</span>
                </p>
                <p className="text-[10px] text-slate-500 font-medium">{t('weight', 'Weight')}: {activePatient.vitals.weightKg} kg</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Health Summary Card (1 col) */}
        <div className="bg-gradient-to-br from-indigo-50/90 to-blue-50/90 dark:from-slate-900 dark:to-slate-800/90 border border-indigo-200 dark:border-indigo-900/50 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950 px-2.5 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> AI Companion Summary
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">Plain English</span>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              "Your recent assessment suggests that your blood sugar and blood pressure levels are slightly higher than recommended. Your doctor, Dr. Arthur Pendelton, may advise additional lab tests and slight lifestyle modifications during your upcoming visit on August 12. Please follow the recommendations provided during your consultation and continue logging your daily readings."
            </p>
          </div>

          <div className="pt-3 border-t border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between">
            <span className="text-[10px] text-slate-500">Zero medical jargon • Clinical encouragement</span>
            <button
              onClick={onOpenAiSummary}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View Full Summary</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Quick Health Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={onOpenUploadReport}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs shadow-md shadow-emerald-600/20 transition"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Lab PDF</span>
          </button>

          <button
            onClick={onOpenUpdateVitals}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs shadow-md shadow-blue-600/20 transition"
          >
            <Activity className="w-4 h-4" />
            <span>Log Daily Vitals</span>
          </button>

          <button
            onClick={onOpenAiSummary}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-xs shadow-md shadow-indigo-600/20 transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Advice Details</span>
          </button>

          <button
            onClick={onOpenDownloadSummary}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-semibold text-xs transition"
          >
            <Download className="w-4 h-4" />
            <span>Export Health PDF</span>
          </button>
        </div>
      </div>

      {/* 4. MAIN TWO-COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Medications & Doctor Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          {/* CURRENT MEDICATIONS SECTION */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Pill className="w-5 h-5 text-blue-600" />
                  Current Prescribed Medications
                </h3>
                <p className="text-xs text-slate-500">Medications entered and approved by {activePatient.primaryDoctor}</p>
              </div>
              <button
                onClick={() => onNavigateToTab('medications')}
                className="text-xs font-black text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Full Medicine Hub</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {meds.map((m) => (
                <div
                  key={m.id}
                  onClick={() => toggleMed(m.id)}
                  className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                    m.takenToday
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${
                        m.takenToday ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                      }`}
                    >
                      <Check className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${m.takenToday ? 'text-emerald-900 dark:text-emerald-200 line-through' : 'text-slate-900 dark:text-white'}`}>
                        {m.name} ({m.dosage})
                      </p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                        {m.frequency} • <span className="text-blue-600 dark:text-blue-400 font-bold">Purpose: {m.purpose || 'Clinical Therapy'}</span>
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-extrabold px-3 py-1 rounded-full ${
                      m.takenToday
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {m.takenToday ? 'Taken Today' : 'Mark as Taken'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* DOCTOR APPROVED RECOMMENDATIONS */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-emerald-600" />
                  Approved Doctor Recommendations
                </h3>
                <p className="text-xs text-slate-500">Action items explicitly assigned by your primary physician</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {doctorApprovedRecommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100">{rec.task}</p>
                      <p className="text-[10px] text-slate-400">{rec.deadline}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full shrink-0">
                    {rec.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Care Journey & Follow-Up Center */}
        <div className="space-y-6">
          {/* CARE JOURNEY TIMELINE */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                Care Journey Timeline
              </h3>
            </div>

            <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 pl-8">
              {careJourneySteps.map((step) => (
                <div key={step.id} className="relative space-y-1">
                  <div
                    className={`absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full ring-4 ring-white dark:ring-slate-900 ${
                      step.status === 'Completed'
                        ? 'bg-emerald-500'
                        : step.status === 'Active'
                        ? 'bg-blue-600'
                        : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  />
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">{step.title}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">{step.date}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FOLLOW-UP CENTER & REMINDERS */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Bell className="w-5 h-5 text-amber-500" />
              Follow-Up Center & Reminders
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 rounded-2xl space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-amber-900 dark:text-amber-200">Pending Lab Tests</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-200 text-amber-800 rounded-md">2 Tests</span>
                </div>
                <p className="text-[11px] text-amber-800 dark:text-amber-300">Repeat HbA1c (Due in 5 days) & Serum Creatinine</p>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 rounded-2xl space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-blue-900 dark:text-blue-200">Upcoming Follow-Up</span>
                  <span className="text-[10px] text-blue-700 font-bold">Aug 12, 2026</span>
                </div>
                <p className="text-[11px] text-blue-800 dark:text-blue-300">In-person consultation with {activePatient.primaryDoctor}</p>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-emerald-900 dark:text-emerald-200">Referral Status</span>
                  <span className="text-[10px] text-emerald-700 font-bold">Confirmed</span>
                </div>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                  {activePatient.referralSpecialist || 'Nephrology Specialist Review'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Automated Health Reminders</span>
                <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                  <li>• Repeat HbA1c: Scheduled in 7 days</li>
                  <li>• Repeat Creatinine: Scheduled in 3 weeks</li>
                  <li>• Annual Lipid Profile: Scheduled in 2 months</li>
                  <li>• Blood Pressure Monitoring: Log twice weekly</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
