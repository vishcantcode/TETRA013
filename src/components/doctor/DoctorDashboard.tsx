import React, { useState } from 'react';
import {
  Users,
  AlertTriangle,
  Send,
  FileUp,
  PlusCircle,
  Upload,
  Sparkles,
  Search,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  Clock,
  Activity,
  UserCheck,
  Filter,
  Printer,
  ChevronDown,
  ChevronUp,
  Flame,
  Zap,
  Info,
  CheckCircle2,
  Layers,
  UserPlus,
} from 'lucide-react';
import { Patient, LabReport } from '../../types';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { RiskGauge } from '../common/RiskGauge';
import { PrintableClinicalReport } from '../common/PrintableClinicalReport';
import { AiAnalysisWorkflowModal } from '../common/AiAnalysisWorkflowModal';

interface Props {
  patients: Patient[];
  reports: LabReport[];
  activePatient: Patient;
  setActivePatient: (p: Patient) => void;
  onOpenNewAssessment: () => void;
  onOpenUploadReport: () => void;
  onOpenAiSummary: () => void;
  onNavigateToPatients: () => void;
  onOpenPatientRegistration?: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const DoctorDashboard: React.FC<Props> = ({
  patients,
  reports,
  activePatient,
  setActivePatient,
  onOpenNewAssessment,
  onOpenUploadReport,
  onOpenAiSummary,
  onNavigateToPatients,
  onOpenPatientRegistration,
  onNavigateToTab,
}) => {
  const [filterLevel, setFilterLevel] = useState<'All' | 'High' | 'Moderate' | 'Low'>('All');
  const [isTimelineOpen, setIsTimelineOpen] = useState(true);
  const [isHeatmapOpen, setIsHeatmapOpen] = useState(true);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  const highRiskPatients = patients.filter((p) => p.riskLevel === 'High');
  const highRiskCount = highRiskPatients.length;
  const moderateRiskCount = patients.filter((p) => p.riskLevel === 'Moderate').length;
  const lowRiskCount = patients.filter((p) => p.riskLevel === 'Low').length;
  const pendingReferralsCount = patients.filter((p) => p.pendingReferral).length;

  const filteredPatients = filterLevel === 'All'
    ? patients
    : patients.filter((p) => p.riskLevel === filterLevel);

  const pieData = [
    { name: 'High Risk', value: highRiskCount, color: '#EF4444' },
    { name: 'Moderate Risk', value: moderateRiskCount, color: '#F59E0B' },
    { name: 'Low Risk', value: lowRiskCount, color: '#10B981' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* QUICK ACTION BAR FOR INPUT CONSOLE & DATASET ENTRY */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-blue-500/20 text-blue-400 rounded-2xl border border-blue-400/30">
            <Layers className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              Multi-Modal Clinical Input Console & Custom Dataset Intake
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                Live Fusion Active
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Synthesizes Medical History, Family Risk, Voice Command, Pathology OCR & Smartwatch Telemetry into 32-D XAI Vector
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {onNavigateToTab && (
            <button
              onClick={() => onNavigateToTab('input-console')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs shadow-md transition cursor-pointer flex items-center gap-2"
            >
              <Layers className="w-4 h-4" />
              Open Multi-Modal Input Console
            </button>
          )}

          {onOpenPatientRegistration && (
            <button
              onClick={onOpenPatientRegistration}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-md transition cursor-pointer flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              ➕ Register / Input My Data
            </button>
          )}
        </div>
      </div>
      {/* TOP PINNED ALERT BANNER FOR HIGH-RISK CASES */}
      {highRiskCount > 0 && (
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 rounded-2xl p-4 text-white shadow-lg flex items-center justify-between flex-wrap gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <span className="font-black text-xs uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded text-white inline-block mb-1">
                PINNED CLINICAL ALERT
              </span>
              <p className="font-extrabold text-sm sm:text-base">
                {highRiskCount} Patient{highRiskCount > 1 ? 's' : ''} Flagged for High Disease Progression ({highRiskPatients.map((p) => p.name).join(', ')})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActivePatient(highRiskPatients[0]);
                setShowAiModal(true);
              }}
              className="px-4 py-2 bg-white text-red-700 hover:bg-slate-100 font-extrabold text-xs rounded-xl transition shadow-md flex items-center gap-1.5"
            >
              <Zap className="w-4 h-4 fill-red-700" /> Run AI Triage Suite
            </button>
          </div>
        </div>
      )}

      {/* TOP WELCOME BANNER */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-blue-200 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Primary Care Clinical Decision Support Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome, Dr. Arthur Pendelton, MD
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
            CDSS multi-disease intelligence active. Monitoring {patients.length} queued records for Diabetes, CKD, and ASCVD risk stratification.
          </p>
        </div>

        {/* Quick Active Patient Card & Actions */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full sm:w-auto">
          <div className="flex items-center gap-3">
            <img
              src={activePatient.avatar}
              alt={activePatient.name}
              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-400 shrink-0"
            />
            <div>
              <p className="text-xs font-bold text-white">Active Case: {activePatient.name}</p>
              <p className="text-[11px] text-blue-200">
                MRN #{activePatient.mrn} • HbA1c {activePatient.vitals.hba1c}%
              </p>
              <span className={`inline-block px-2 py-0.5 mt-1 rounded text-[10px] font-black ${
                activePatient.riskLevel === 'High' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
              }`}>
                {activePatient.riskLevel} Risk ({activePatient.riskScore}%)
              </span>
            </div>
          </div>

          <div className="flex sm:flex-col gap-1.5 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 sm:border-l border-white/20 sm:pl-4">
            <button
              onClick={() => setShowPrintModal(true)}
              className="flex-1 py-1.5 px-3 bg-white/20 hover:bg-white/30 text-white font-bold text-[11px] rounded-xl transition flex items-center justify-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" /> Print Report
            </button>
            <button
              onClick={() => setShowAiModal(true)}
              className="flex-1 py-1.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] rounded-xl transition flex items-center justify-center gap-1 shadow-md"
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950" /> AI Triage
            </button>
          </div>
        </div>
      </div>

      {/* DASHBOARD KPI CARDS WITH HOVER METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Patients */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">Today's Patients</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{patients.length}</span>
            <span className="text-xs text-emerald-600 font-bold flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +2 Queued
            </span>
          </div>
          <p className="text-xs text-slate-500">Scheduled for lifestyle risk screening</p>
        </div>

        {/* Card 2: High Risk Cases */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">High Risk Cases</span>
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-red-600 dark:text-red-400">{highRiskCount}</span>
            <span className="text-xs text-red-600 font-extrabold bg-red-50 dark:bg-red-950 px-2 py-0.5 rounded-full">
              Requires Intervention
            </span>
          </div>
          <p className="text-xs text-slate-500">HbA1c &gt; 8.0% or BP &gt; 140/90 mmHg</p>
        </div>

        {/* Card 3: Pending Referrals */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">Pending Referrals</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600 dark:text-amber-400">{pendingReferralsCount}</span>
            <span className="text-xs text-amber-600 font-bold">Specialist queue</span>
          </div>
          <p className="text-xs text-slate-500">Cardiology & Endocrinology consults</p>
        </div>

        {/* Card 4: Reports Uploaded */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">Reports Parsed</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <FileUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{reports.length}</span>
            <span className="text-xs text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
              OCR Verified
            </span>
          </div>
          <p className="text-xs text-slate-500">Lab tests & ECG diagnostics</p>
        </div>
      </div>

      {/* QUICK CLINICAL ACTIONS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">
          Quick Clinical Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={onOpenNewAssessment}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-600/20 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Assessment</span>
          </button>

          <button
            onClick={onOpenUploadReport}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 transition"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Lab Report</span>
          </button>

          <button
            onClick={onOpenAiSummary}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-600/20 transition"
          >
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span>Generate AI Summary</span>
          </button>

          <button
            onClick={onNavigateToPatients}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-bold text-xs transition"
          >
            <Search className="w-4 h-4" />
            <span>Patient Search</span>
          </button>
        </div>
      </div>

      {/* RISK HEATMAP MATRIX WIDGET */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <h3 className="font-black text-sm text-slate-900 dark:text-white">
              Population Disease Risk Heatmap Matrix
            </h3>
          </div>
          <button
            onClick={() => setIsHeatmapOpen(!isHeatmapOpen)}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            {isHeatmapOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {isHeatmapOpen && (
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {patients.map((p) => {
              const heatmapBg =
                p.riskScore >= 80
                  ? 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400'
                  : p.riskScore >= 50
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400';

              return (
                <div
                  key={p.id}
                  onClick={() => setActivePatient(p)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition transform hover:-translate-y-0.5 space-y-2 ${heatmapBg} ${
                    activePatient.id === p.id ? 'ring-2 ring-blue-500 shadow-md' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                    <div className="truncate">
                      <span className="font-extrabold text-xs block truncate">{p.name}</span>
                      <span className="text-[10px] font-mono opacity-80">MRN {p.mrn}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-black pt-1 border-t border-slate-200/40 dark:border-slate-700/40">
                    <span>{p.riskLevel}</span>
                    <span>{p.riskScore}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Patient Screening List with Quick Filter & Risk Gauge */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white">Active Screening Queue</h3>
                <p className="text-xs text-slate-500">Filter patients by CDSS risk level</p>
              </div>

              {/* QUICK FILTER PILLS */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                {(['All', 'High', 'Moderate', 'Low'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setFilterLevel(level)}
                    className={`px-3 py-1 rounded-lg transition ${
                      filterLevel === level
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Patients List */}
            <div className="space-y-3">
              {filteredPatients.map((p) => {
                const isSelected = activePatient.id === p.id;

                return (
                  <div
                    key={p.id}
                    onClick={() => setActivePatient(p)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      isSelected
                        ? 'bg-blue-50/80 dark:bg-slate-800/80 border-blue-400 dark:border-blue-500 shadow-md'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <img src={p.avatar} alt={p.name} className="w-12 h-12 rounded-2xl object-cover shrink-0 ring-2 ring-slate-200 dark:ring-slate-700" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-slate-900 dark:text-white">{p.name}</span>
                          <span className="text-[11px] font-mono font-bold text-slate-500">
                            {p.gender}, {p.age}y
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {p.conditions.join(' • ')}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
                            BP {p.vitals.bpSystolic}/{p.vitals.bpDiastolic}
                          </span>
                          <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
                            HbA1c {p.vitals.hba1c}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Integrated Circular Risk Gauge */}
                    <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                      <RiskGauge
                        score={p.riskScore}
                        riskLevel={p.riskLevel}
                        size="sm"
                        showDetails={false}
                      />

                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Collapsible Timeline Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                Active Patient Recent Clinical Activity ({activePatient.name})
              </h3>
              <button
                onClick={() => setIsTimelineOpen(!isTimelineOpen)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                {isTimelineOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {isTimelineOpen && (
              <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 pl-8">
                {activePatient.recentActivity.map((act) => (
                  <div key={act.id} className="relative space-y-1">
                    <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white dark:ring-slate-900" />
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">{act.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{act.date}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{act.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Chart & Specialist Queue */}
        <div className="space-y-6">
          {/* Population Risk Pie Chart */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="font-black text-base text-slate-900 dark:text-white mb-1">
              Population Risk Distribution
            </h3>
            <p className="text-xs text-slate-500 mb-4">Lifestyle disease stratifications</p>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pending Specialist Referral Queue */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center justify-between">
              <span>Specialist Referral Queue</span>
              <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold px-2.5 py-0.5 rounded-full">
                {pendingReferralsCount} Action Required
              </span>
            </h3>

            <div className="space-y-3">
              {patients
                .filter((p) => p.pendingReferral)
                .map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">{p.name}</span>
                      <span className="text-[10px] font-extrabold text-amber-700 dark:text-amber-300 uppercase">
                        {p.referralSpecialist}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      High CDSS risk score ({p.riskScore}/100) triggered automated referral recommendation.
                    </p>
                    <button
                      onClick={() => {
                        setActivePatient(p);
                        setShowPrintModal(true);
                      }}
                      className="w-full text-center py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1"
                    >
                      <Printer className="w-3.5 h-3.5" /> Review & Print Referral
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* PRINTABLE CLINICAL REPORT MODAL */}
      <PrintableClinicalReport
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        patient={activePatient}
      />

      {/* AI ANALYSIS WORKFLOW MODAL */}
      <AiAnalysisWorkflowModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        patient={activePatient}
        onCompleteAnalysis={() => onOpenAiSummary()}
      />
    </div>
  );
};
