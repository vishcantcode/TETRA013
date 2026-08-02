import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Sparkles,
  ShieldCheck,
  ArrowLeft,
  RefreshCw,
  FileText,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Clock,
  Activity,
  TrendingUp,
  User,
  Download,
  Share2,
  Send,
  Save,
  Eye,
  Heart,
  Stethoscope,
  Check,
  ChevronRight,
  AlertTriangle,
  Info,
  Lightbulb,
  Sliders,
  Zap,
  BookOpen,
  Award,
  ShieldAlert,
  ListOrdered,
  CheckSquare,
  Building2,
  FileCheck,
  X,
  Printer,
  ChevronDown,
  Flame,
} from 'lucide-react';
import { Patient } from '../../types';
import { CdssPipelineOrchestrator } from '../../services/cdss/cdssPipeline';
import { CdssPipelineResult } from '../../types/cdss';
import { ReportGeneratorService } from '../../services/cdss/reportGeneratorService';
import { MlPredictionDashboard } from './MlPredictionDashboard';
import { ExplainableAiDashboard } from './ExplainableAiDashboard';
import { ClinicalGuidelineEngineDashboard } from './ClinicalGuidelineEngineDashboard';

interface Props {
  activePatient: Patient;
  onNavigateBack: () => void;
  onNewAssessment: () => void;
}

// Circular Risk Gauge Component
const RiskGauge: React.FC<{
  percentage: number;
  colorClass: string;
  category: 'Low' | 'Moderate' | 'High';
}> = ({ percentage, colorClass, category }) => {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  let strokeColor = '#10B981'; // green
  if (category === 'Moderate') strokeColor = '#F59E0B'; // yellow/amber
  if (category === 'High') strokeColor = '#EF4444'; // red

  return (
    <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
      <svg className="w-20 h-20 transform -rotate-90">
        <circle
          cx="40"
          cy="40"
          r={radius}
          className="stroke-slate-100 dark:stroke-slate-800"
          strokeWidth="7"
          fill="transparent"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke={strokeColor}
          strokeWidth="7"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-sm font-extrabold text-slate-900 dark:text-white leading-none">
          {percentage}%
        </span>
      </div>
    </div>
  );
};

export const ClinicalIntelligenceAnalysis: React.FC<Props> = ({
  activePatient,
  onNavigateBack,
  onNewAssessment,
}) => {
  const [pipelineResult, setPipelineResult] = useState<CdssPipelineResult | null>(null);
  const [isPipelineRunning, setIsPipelineRunning] = useState<boolean>(true);
  const [dashboardTab, setDashboardTab] = useState<'guideline' | 'xai' | 'cdss' | 'ml'>('guideline');
  const [educationTab, setEducationTab] = useState<'doctor' | 'patient'>('doctor');
  const [selectedRiskChip, setSelectedRiskChip] = useState<string | null>(null);
  const [completedActions, setCompletedActions] = useState<number[]>([]);
  const [activeModal, setActiveModal] = useState<
    'report' | 'pdf' | 'share' | 'referral' | 'saved' | null
  >(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Trigger CDSS Pipeline
  useEffect(() => {
    let isMounted = true;
    setIsPipelineRunning(true);
    CdssPipelineOrchestrator.executePipeline(activePatient).then((res) => {
      if (isMounted) {
        setPipelineResult(res);
        setIsPipelineRunning(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [activePatient]);

  // Helper trigger toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Toggle Action items check state
  const toggleAction = (index: number) => {
    if (completedActions.includes(index)) {
      setCompletedActions(completedActions.filter((i) => i !== index));
    } else {
      setCompletedActions([...completedActions, index]);
    }
  };

  if (isPipelineRunning || !pipelineResult) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-blue-600/10 dark:bg-blue-500/20 flex items-center justify-center border border-blue-500/30 animate-pulse">
            <BrainCircuit className="w-10 h-10 text-blue-600 dark:text-blue-400 animate-spin" />
          </div>
          <Sparkles className="w-6 h-6 text-amber-500 absolute -top-2 -right-2 animate-bounce" />
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Running HealthSense AI CDSS Pipeline...
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Executing sequential analysis: Data Validation → ML Disease Risk → Evidence Rules → Early Warning Progression → Specialist Referral Triage → Gemini Clinical Reasoning.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-4 py-2 rounded-full border border-blue-200 dark:border-blue-900">
          <Cpu className="w-4 h-4 animate-pulse" />
          <span>Stage 1-10 Orchestration Active</span>
        </div>
      </div>
    );
  }

  // Extract variables from CDSS Pipeline Result
  const {
    validation,
    predictions,
    featureImportance,
    ruleEngine,
    earlyWarnings,
    referrals,
    patientEducation,
    confidence,
    report,
    geminiReasoning,
  } = pipelineResult;

  const hba1c = activePatient.vitals.hba1c || 7.2;
  const bpSystolic = activePatient.vitals.bpSystolic || 138;
  const bmi = activePatient.vitals.bmi || 27.4;
  const glucose = activePatient.vitals.glucose || 128;

  // Next Best Actions Plan
  const nextActionsPlan = [
    'Order Urine Albumin-to-Creatinine Ratio (UACR) & Fasting Lipid Profile.',
    'Initiate / adjust Metformin 500mg BD; evaluate SGLT2 inhibitor addition.',
    'Refer patient to Endocrinologist for specialized glycemic management.',
    'Provide patient with 14-day Home Blood Pressure & Glucose Log template.',
    'Counsel on Mediterranean diet, 150 mins/week moderate exercise, and sodium restriction.',
    'Schedule 2-week follow-up appointment to review lab results and home logs.',
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24 relative">
      {/* Toast Notification Floating Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* MANDATORY AI CLINICAL DISCLAIMER BANNER */}
      <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl flex items-start gap-3 text-amber-900 dark:text-amber-200 text-xs shadow-sm">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-extrabold uppercase tracking-wider text-[11px] text-amber-800 dark:text-amber-300">
            AI-Assisted Clinical Recommendation Notice (CDSS)
          </p>
          <p className="leading-relaxed text-amber-800/90 dark:text-amber-200/90">
            All insights, risk scores, and guidance generated by HealthSense AI serve strictly as <strong>Clinical Decision Support</strong> to assist licensed healthcare professionals. The AI engine does <strong>NEVER</strong> replace the attending physician&apos;s independent clinical judgment, diagnosis, or treatment decisions.
          </p>
        </div>
      </div>

      {/* TOP HEADER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-extrabold text-xs rounded-full flex items-center gap-1.5 border border-purple-200 dark:border-purple-800">
                <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                HealthSense AI Clinical Intelligence Engine v2.4
              </span>
              <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-xs rounded-full">
                MRN #{activePatient.mrn}
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold text-xs rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Assessment Complete
              </span>
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2 flex items-center gap-3">
              <span>{activePatient.name}</span>
              <span className="text-base font-normal text-slate-400">
                ({activePatient.age} yrs • {activePatient.gender})
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Multi-organ metabolic risk stratification, CDSS evidence guideline mapping & automated prognosis pipeline
            </p>
          </div>

          {/* Action Buttons & Navigation */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onNavigateBack}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Assessment</span>
            </button>
            <button
              onClick={onNewAssessment}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-600/20 transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              <span>New Assessment</span>
            </button>
          </div>
        </div>

        {/* Top Header Telemetry Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60">
            <span className="text-slate-400 font-semibold text-[10px] uppercase block">Assessment Date</span>
            <span className="text-slate-900 dark:text-white font-extrabold block mt-0.5">
              Aug 01, 2026 • 09:30 AM
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60">
            <span className="text-slate-400 font-semibold text-[10px] uppercase block">AI Confidence Score</span>
            <span className="text-purple-600 dark:text-purple-400 font-extrabold flex items-center gap-1 mt-0.5">
              <BrainCircuit className="w-4 h-4" />
              {confidence.overallConfidenceScore}% ({confidence.confidenceLevel} Confidence)
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60">
            <span className="text-slate-400 font-semibold text-[10px] uppercase block">Processing Engine</span>
            <span className="text-slate-900 dark:text-white font-extrabold flex items-center gap-1 mt-0.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              10-Stage CDSS Pipeline
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60">
            <span className="text-slate-400 font-semibold text-[10px] uppercase block">Validation Status</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {validation.dataCompletenessText}
            </span>
          </div>
        </div>

        {/* Intelligence Module View Mode Tabs */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setDashboardTab('guideline')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 border ${
              dashboardTab === 'guideline'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-300" /> Clinical Guideline Engine
          </button>

          <button
            onClick={() => setDashboardTab('xai')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 border ${
              dashboardTab === 'xai'
                ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            <BrainCircuit className="w-4 h-4" /> Explainable AI (XAI) Engine
          </button>

          <button
            onClick={() => setDashboardTab('cdss')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 border ${
              dashboardTab === 'cdss'
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            <Zap className="w-4 h-4" /> CDSS 10-Stage Pipeline Overview
          </button>

          <button
            onClick={() => setDashboardTab('ml')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 border ${
              dashboardTab === 'ml'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            <Cpu className="w-4 h-4" /> ML Microservice API Inspector
          </button>
        </div>
      </div>

      {/* DASHBOARD TAB 0: CLINICAL GUIDELINE ENGINE */}
      {dashboardTab === 'guideline' && (
        <ClinicalGuidelineEngineDashboard activePatient={activePatient} />
      )}

      {/* DASHBOARD TAB 1: EXPLAINABLE AI ENGINE */}
      {dashboardTab === 'xai' && (
        <ExplainableAiDashboard activePatient={activePatient} />
      )}

      {/* DASHBOARD TAB 3: ML PREDICTION ENGINE ONLY */}
      {dashboardTab === 'ml' && (
        <MlPredictionDashboard activePatient={activePatient} />
      )}

      {/* DASHBOARD TAB 2: CDSS FULL PIPELINE OVERVIEW */}
      {(dashboardTab === 'cdss' || dashboardTab === 'xai') && (
        <>
          {/* CARD 1: OVERALL CLINICAL SUMMARY */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden space-y-4">
        <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <BrainCircuit className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-indigo-300 uppercase tracking-wider block">
                CARD 1 • EXECUTIVE PROGNOSIS & SYNTHESIS
              </span>
              <h2 className="text-lg font-extrabold text-white">Overall Clinical Summary</h2>
            </div>
          </div>

          <span className="px-3 py-1 bg-white/10 border border-white/20 text-indigo-200 font-bold text-xs rounded-full flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            {geminiReasoning?.isAiGenerated ? 'Gemini 2.5 AI Reasoning' : 'CDSS Core Synthesis'}
          </span>
        </div>

        {/* Executive Summary Text Box */}
        <div className="p-5 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl">
          <p className="text-sm leading-relaxed text-slate-100 font-medium">
            &ldquo;{geminiReasoning?.executiveSummary}&rdquo;
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
          <div className="p-3 bg-black/30 rounded-xl border border-white/10">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Glycemic Marker</span>
            <span className="text-amber-300 font-extrabold block mt-0.5">HbA1c {hba1c}%</span>
          </div>
          <div className="p-3 bg-black/30 rounded-xl border border-white/10">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Vascular Load</span>
            <span className="text-amber-300 font-extrabold block mt-0.5">{bpSystolic} mmHg</span>
          </div>
          <div className="p-3 bg-black/30 rounded-xl border border-white/10">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Physical Adiposity</span>
            <span className="text-amber-300 font-extrabold block mt-0.5">{bmi} kg/m²</span>
          </div>
          <div className="p-3 bg-black/30 rounded-xl border border-white/10">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Rule Compliance</span>
            <span className="text-emerald-300 font-extrabold block mt-0.5">{ruleEngine.compliancePercentage}%</span>
          </div>
        </div>
      </div>

      {/* CARD 2: LIFESTYLE DISEASE RISK SCORE (MODULAR ML PREDICTION LAYER) */}
      <MlPredictionDashboard activePatient={activePatient} />

      {/* GRID ROW 2: CARD 3 (TOP RISK FACTORS) + CARD 4 (MISSING INVESTIGATIONS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CARD 3: TOP RISK FACTORS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                CARD 3 • CONTRIBUTORY FEATURE ANALYSIS
              </span>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
                <Flame className="w-5 h-5 text-amber-500" />
                Top Contributory Risk Factors
              </h2>
            </div>
            <span className="text-xs text-slate-400">Click chips to inspect</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {featureImportance.map((rf) => {
              const isSelected = selectedRiskChip === rf.id;

              return (
                <button
                  key={rf.id}
                  onClick={() => setSelectedRiskChip(isSelected ? null : rf.id)}
                  className={`px-3 py-2 rounded-2xl text-xs font-bold border transition flex items-center gap-2 ${rf.badgeColor} ${
                    isSelected ? 'ring-2 ring-blue-500 scale-105 shadow-md' : 'hover:opacity-90'
                  }`}
                >
                  <span>{rf.feature}</span>
                  <span className="px-1.5 py-0.2 text-[9px] uppercase font-black bg-white/50 rounded-md">
                    {rf.contribution}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Expanded Selected Risk Factor Card */}
          {selectedRiskChip ? (
            (() => {
              const rf = featureImportance.find((item) => item.id === selectedRiskChip)!;
              if (!rf) return null;
              return (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                      <Info className="w-4 h-4 text-blue-600" />
                      {rf.feature}
                    </span>
                    <button
                      onClick={() => setSelectedRiskChip(null)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    <strong>Reason:</strong> {rf.reason}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    <strong>Clinical Significance:</strong> {rf.clinicalSignificance}
                  </p>
                </div>
              );
            })()
          ) : (
            <p className="text-[11px] text-slate-400 italic">
              💡 Tip: Click any of the interactive risk chips above to inspect detailed feature weights and clinical significance.
            </p>
          )}
        </div>

        {/* CARD 4: MISSING INVESTIGATIONS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                CARD 4 • DIAGNOSTIC GAP IDENTIFICATION
              </span>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
                <FileText className="w-5 h-5 text-blue-600" />
                Missing Diagnostic Investigations
              </h2>
            </div>
            <span className="text-xs text-slate-400">{ruleEngine.recommendations.filter(r => r.status === 'Missing').length} Missing</span>
          </div>

          <div className="space-y-3">
            {ruleEngine.recommendations.map((inv) => (
              <div
                key={inv.id}
                className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      {inv.recommendation}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
                    {inv.reason}
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    Guideline: {inv.guidelineSource}
                  </span>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold shrink-0 border ${
                    inv.priority === 'Urgent'
                      ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300'
                      : 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {inv.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* GRID ROW 3: CARD 5 (EARLY WARNING FLAGS) + CARD 6 (REFERRAL RECOMMENDATIONS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CARD 5: EARLY WARNING FLAGS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold text-red-600 dark:text-red-400 uppercase tracking-wider block">
                CARD 5 • POINT-OF-CARE ALERTS
              </span>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Early Warning Clinical Flags
              </h2>
            </div>
            <span className="text-xs text-slate-400">{earlyWarnings.length} Warnings Triggered</span>
          </div>

          <div className="space-y-3">
            {earlyWarnings.map((flag) => (
              <div
                key={flag.id}
                className={`p-4 rounded-2xl border space-y-2 text-xs ${flag.badgeColor}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    {flag.title}
                  </span>
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-950 text-[10px] font-black rounded-full">
                    {flag.severity} Severity
                  </span>
                </div>

                <p className="text-slate-700 dark:text-slate-300">
                  <strong>Observation:</strong> {flag.observation}
                </p>
                <p className="text-slate-800 dark:text-slate-200 font-semibold bg-white/50 dark:bg-black/20 p-2 rounded-xl">
                  <strong>Suggested Action:</strong> {flag.recommendedAction}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CARD 6: REFERRAL RECOMMENDATIONS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                CARD 6 • SPECIALIST TRIAGE
              </span>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
                <Building2 className="w-5 h-5 text-indigo-600" />
                Specialist Referral Recommendations
              </h2>
            </div>
            <span className="text-xs text-slate-400">CDSS Referral Engine</span>
          </div>

          <div className="space-y-3">
            {referrals.map((ref) => (
              <div
                key={ref.id}
                className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex items-start justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-slate-900 dark:text-white block">
                      {ref.specialist}
                    </span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
                      {ref.reason}
                    </p>
                    <span className="text-[10px] text-slate-400 block font-semibold pt-1">
                      Suggested Timeline: <strong>{ref.timeline}</strong>
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveModal('referral');
                  }}
                  className="px-3 py-1.5 rounded-xl text-[10px] font-extrabold shrink-0 bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 hover:opacity-80 transition"
                >
                  Dispatch Referral
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CARD 7: CLINICAL GUIDELINE CHECK */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
          <div>
            <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
              CARD 7 • EVIDENCE-BASED PROTOCOL COMPLIANCE
            </span>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Clinical Guideline Screening Audit (ADA / ACC / AHA / KDIGO Standards)
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
              Compliance Completion: <strong className="text-emerald-600">{ruleEngine.compliancePercentage}%</strong>
            </span>
            <div className="w-24 bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full" style={{ width: `${ruleEngine.compliancePercentage}%` }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Completed Screenings */}
          <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-extrabold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Completed Checks ({ruleEngine.completedCount})</span>
            </div>
            <ul className="space-y-1 text-slate-700 dark:text-slate-300 text-[11px] list-disc pl-4">
              {ruleEngine.recommendations.filter(r => r.status === 'Completed').map(r => (
                <li key={r.id}>{r.recommendation}</li>
              ))}
              {ruleEngine.completedCount === 0 && <li>Fasting Blood Sugar & BP Checked</li>}
            </ul>
          </div>

          {/* Recommended Screenings */}
          <div className="p-4 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-extrabold">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Recommended Checks ({ruleEngine.missingCount})</span>
            </div>
            <ul className="space-y-1 text-slate-700 dark:text-slate-300 text-[11px] list-disc pl-4">
              {ruleEngine.recommendations.filter(r => r.status === 'Missing' || r.status === 'Recommended').map(r => (
                <li key={r.id}>{r.recommendation}</li>
              ))}
            </ul>
          </div>

          {/* Overdue Screenings */}
          <div className="p-4 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-extrabold">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Overdue Screenings ({ruleEngine.overdueCount})</span>
            </div>
            <ul className="space-y-1 text-slate-700 dark:text-slate-300 text-[11px] list-disc pl-4">
              <li>Annual Dilated Eye Examination</li>
              <li>Comprehensive Diabetic Foot Sensory Check</li>
            </ul>
          </div>

          {/* Unavailable Information */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-extrabold">
              <Info className="w-4 h-4 text-slate-400" />
              <span>Missing Information ({confidence.missingInformation.length})</span>
            </div>
            <ul className="space-y-1 text-slate-500 text-[11px] list-disc pl-4">
              {confidence.missingInformation.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* CARD 8: EXPLAINABLE AI (XAI) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <span className="text-[10px] font-extrabold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
            CARD 8 • TRANSPARENT AI LOGIC & EXPLAINABILITY
          </span>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
            <BrainCircuit className="w-5 h-5 text-purple-600" />
            Explainable AI (XAI) Clinical Decision Audit
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 rounded-2xl space-y-2">
            <span className="text-[10px] uppercase font-extrabold text-purple-700 dark:text-purple-300 block">
              Why Recommendation Generated
            </span>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
              Multi-variant ML Decision Forest models assigned highest weightings to HbA1c ({hba1c}%), Systolic BP ({bpSystolic} mmHg), and BMI ({bmi} kg/m²).
            </p>
          </div>

          <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 rounded-2xl space-y-2">
            <span className="text-[10px] uppercase font-extrabold text-purple-700 dark:text-purple-300 block">
              Influential Clinical Observations
            </span>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
              Age ({activePatient.age}), Fasting Glucose ({glucose} mg/dL), and co-occurring pre-hypertensive vascular load.
            </p>
          </div>

          <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 rounded-2xl space-y-2">
            <span className="text-[10px] uppercase font-extrabold text-purple-700 dark:text-purple-300 block">
              Model Confidence Level
            </span>
            <div className="flex items-center gap-1.5 font-extrabold text-purple-700 dark:text-purple-300">
              <Award className="w-4 h-4 text-purple-600" />
              <span>{confidence.overallConfidenceScore}% ({confidence.confidenceLevel} Confidence)</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px]">
              Data Quality: {confidence.dataQualityRating}. Telemetry validated against clinical guidelines.
            </p>
          </div>

          <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 rounded-2xl space-y-2">
            <span className="text-[10px] uppercase font-extrabold text-purple-700 dark:text-purple-300 block">
              Data Needed To Boost Confidence
            </span>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
              {confidence.suggestedAdditionalTestsToBoostConfidence[0] || '14-Day Home Blood Pressure Log and Urine Albumin check.'}
            </p>
          </div>
        </div>
      </div>

      {/* CARD 9: PATIENT EDUCATION (DOCTOR VS PATIENT VIEW TOGGLE) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-3">
          <div>
            <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
              CARD 9 • TAILORED HEALTH COMMUNICATION
            </span>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Patient Education & Care Guidance
            </h2>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl self-start sm:self-auto text-xs font-bold">
            <button
              onClick={() => setEducationTab('doctor')}
              className={`px-4 py-1.5 rounded-xl transition ${
                educationTab === 'doctor'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Doctor View (Clinical)
            </button>
            <button
              onClick={() => setEducationTab('patient')}
              className={`px-4 py-1.5 rounded-xl transition ${
                educationTab === 'patient'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Patient View (Simple)
            </button>
          </div>
        </div>

        {/* Content Box depending on selected view */}
        {educationTab === 'doctor' ? (
          <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 text-xs">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-extrabold">
              <Stethoscope className="w-4 h-4" />
              <span>Professional Physician Summary (ICD-10 / ADA Guidelines)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-800 dark:text-slate-200">
              <div className="space-y-1.5">
                <span className="font-extrabold text-slate-900 dark:text-white block">
                  1. Clinical Diagnosis Considerations:
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {patientEducation.doctorVersion.diagnosisConsiderations}
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="font-extrabold text-slate-900 dark:text-white block">
                  2. Therapeutic Modification Plan:
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {patientEducation.doctorVersion.therapeuticModification}
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="font-extrabold text-slate-900 dark:text-white block">
                  3. Medical Nutrition Therapy (MNT):
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {patientEducation.doctorVersion.nutritionPlan}
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="font-extrabold text-slate-900 dark:text-white block">
                  4. Exercise & Follow-Up Protocol:
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {patientEducation.doctorVersion.exerciseProtocol}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 space-y-4 text-xs">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-extrabold">
              <Heart className="w-4 h-4 text-emerald-600" />
              <span>Easy-to-Understand Patient Health Guide</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-800 dark:text-slate-200">
              <div className="space-y-1">
                <span className="font-extrabold text-emerald-900 dark:text-emerald-200 block">
                  ❤️ What your results mean:
                </span>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                  {patientEducation.patientVersion.whatResultsMean}
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-extrabold text-emerald-900 dark:text-emerald-200 block">
                  🥗 Healthy Eating Tips:
                </span>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                  {patientEducation.patientVersion.dietTips}
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-extrabold text-emerald-900 dark:text-emerald-200 block">
                  🚶 Physical Activity Goal:
                </span>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                  {patientEducation.patientVersion.exerciseGoal}
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-extrabold text-emerald-900 dark:text-emerald-200 block">
                  📅 Next Simple Steps:
                </span>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                  {patientEducation.patientVersion.nextSteps}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CARD 10: NEXT BEST ACTIONS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
              CARD 10 • ORDERED CLINICAL WORKFLOW
            </span>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
              <ListOrdered className="w-5 h-5 text-indigo-600" />
              Next Best Actions (Physician Execution Checklist)
            </h2>
          </div>

          <span className="text-xs text-slate-400">
            {completedActions.length} of {nextActionsPlan.length} Completed
          </span>
        </div>

        <div className="space-y-2.5">
          {nextActionsPlan.map((actionText, index) => {
            const isDone = completedActions.includes(index);

            return (
              <button
                key={actionText}
                onClick={() => toggleAction(index)}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between gap-3 text-xs font-semibold transition ${
                  isDone
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-slate-400 line-through'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:border-indigo-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                      isDone
                        ? 'bg-emerald-500 text-white'
                        : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                    }`}
                  >
                    {isDone ? <Check className="w-3.5 h-3.5" /> : index + 1}
                  </span>
                  <span>{actionText}</span>
                </div>

                <span className="text-[10px] text-slate-400 font-normal shrink-0">
                  {isDone ? 'Marked Done' : 'Click to complete'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* BOTTOM ACTION BAR (STICKY FOOTER) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-2xl py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold">{activePatient.name} (MRN #{activePatient.mrn})</span>
            <span className="text-slate-400">• Ready for Dispatch</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Generate Clinical Report */}
            <button
              onClick={() => {
                setActiveModal('report');
                showToast('Generating comprehensive HealthSense AI clinical report...');
              }}
              className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-bold text-xs transition flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Generate Report</span>
            </button>

            {/* Download PDF */}
            <button
              onClick={() => {
                showToast('Downloading HealthSense_AI_Analysis_Report.pdf');
                window.print();
              }}
              className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-bold text-xs transition flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-indigo-600" />
              <span>Download PDF</span>
            </button>

            {/* Share with Patient */}
            <button
              onClick={() => {
                setActiveModal('share');
                showToast('Patient portal summary dispatched to patient email & SMS.');
              }}
              className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-bold text-xs transition flex items-center gap-1.5"
            >
              <Share2 className="w-4 h-4 text-emerald-600" />
              <span>Share with Patient</span>
            </button>

            {/* Send Referral */}
            <button
              onClick={() => {
                setActiveModal('referral');
              }}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>Send Referral</span>
            </button>

            {/* Save Assessment */}
            <button
              onClick={() => {
                showToast(`Assessment saved to ${activePatient.name}'s medical records.`);
                setActiveModal('saved');
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Assessment</span>
            </button>
          </div>
        </div>
      </div>
        </>
      )}

      {/* ACTION MODALS */}
      {/* 1. REPORT PREVIEW MODAL */}
      {activeModal === 'report' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-600" />
                Clinical Intelligence Executive Report
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300 max-h-96 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
              <p className="font-bold text-slate-900 dark:text-white">
                PATIENT: {activePatient.name} (MRN: {activePatient.mrn}, Age: {activePatient.age})
              </p>
              <p>
                <strong>EXECUTIVE SUMMARY:</strong> High probability of Type 2 Diabetes ({hba1c}%) with moderate 10-year ASCVD risk and stage 1 hypertension ({bpSystolic} mmHg).
              </p>
              <p>
                <strong>DISEASE TRAJECTORIES:</strong> Diabetes (78% - High), Hypertension (64% - Moderate), CKD (38% - Moderate), CVD (54% - High), Stroke (26% - Low).
              </p>
              <p>
                <strong>URGENT INVESTIGATIONS:</strong> Urine Albumin-to-Creatinine Ratio (UACR), Lipid Panel, Dilated Eye Examination.
              </p>
              <p>
                <strong>SPECIALIST REFERRALS:</strong> Endocrinologist (Glycemic Control), Clinical Nutritionist.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Report</span>
              </button>
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. REFERRAL DISPATCH MODAL */}
      {activeModal === 'referral' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-indigo-600" />
                Dispatch Clinical Specialist Referral
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Department / Specialist
                </label>
                <select className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold">
                  <option>Endocrinology Department (Glycemic Care)</option>
                  <option>Cardiology Department (ASCVD Evaluation)</option>
                  <option>Nephrology Clinic (Renal Microvascular)</option>
                  <option>Clinical Nutrition & Medical Dietetics</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Urgency Level
                </label>
                <select className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold">
                  <option>Urgent (Within 7 Days)</option>
                  <option>Routine Follow-Up (Within 30 Days)</option>
                  <option>Immediate Transfer (24 Hours)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Clinical Referral Note
                </label>
                <textarea
                  rows={3}
                  defaultValue={`Referring ${activePatient.name} (MRN #${activePatient.mrn}) for glycemic optimization and metabolic risk consultation following HealthSense AI screening.`}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setActiveModal(null);
                  showToast('Referral dispatched to hospital network queue!');
                }}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. SHARE WITH PATIENT MODAL */}
      {activeModal === 'share' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Share2 className="w-5 h-5 text-emerald-600" />
                Share Portal Summary
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Dispatched simplified Patient Education Guide and Next Steps directly to <strong>{activePatient.name}&apos;s</strong> patient portal app and SMS contact.
            </p>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. SAVED ASSESSMENT MODAL */}
      {activeModal === 'saved' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Assessment Saved Successfully
            </h3>
            <p className="text-xs text-slate-500">
              All 10 clinical cards, risk scores, missing test flags, and referral recommendations have been synchronized with <strong>{activePatient.name}&apos;s</strong> EHR profile.
            </p>
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-6 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Continue Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Flame Icon
function FlameIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}
