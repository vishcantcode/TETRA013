import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  BarChart2,
  FileText,
  Activity,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  Info,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Sliders,
  Layers,
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  UserCheck,
  ListCheck,
  Award,
  Clock,
  Zap,
  RotateCcw,
  User,
  Heart,
  Share2,
  Printer,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { Patient } from '../../types';
import { ExplainableAiEngine } from '../../services/explainableAiEngine';
import {
  ExplainableAiResult,
  FeatureContribution,
  EvidenceParameter,
  MissingInformationItem,
  GuidelineMatchItem,
  NextBestAction,
} from '../../types/explainableAi';

interface Props {
  activePatient: Patient;
  customVitals?: any;
}

export const ExplainableAiDashboard: React.FC<Props> = ({ activePatient, customVitals }) => {
  const [selectedDisease, setSelectedDisease] = useState<string>('Type 2 Diabetes');
  const [activeViewMode, setActiveViewMode] = useState<'doctor' | 'patient'>('doctor');
  const [explanation, setExplanation] = useState<ExplainableAiResult | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>('reasoning');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  const diseaseList = [
    'Type 2 Diabetes',
    'Essential Hypertension',
    'Atherosclerotic CVD',
    'Chronic Kidney Disease',
    'Metabolic Liver Disease',
  ];

  useEffect(() => {
    const engine = ExplainableAiEngine.getInstance();
    const result = engine.generateExplanation(activePatient, selectedDisease, customVitals);
    setExplanation(result);
  }, [activePatient, selectedDisease, customVitals]);

  if (!explanation) return null;

  const {
    clinicalReasoning,
    featureContributions,
    evidenceParameters,
    confidenceAnalysis,
    missingInformation,
    guidelineMatches,
    nextBestActions,
    patientExplanation,
    doctorExplanation,
    disclaimer,
  } = explanation;

  const handleCopySummary = () => {
    const textToCopy = `HEALTHSENSE AI EXPLAINABLE REASONING REPORT
Patient: ${activePatient.name} (MRN: #${activePatient.mrn})
Disease: ${explanation.disease}
Risk Level: ${clinicalReasoning.riskCategory} (${clinicalReasoning.riskPercentage}%)
Clinical Summary: ${clinicalReasoning.clinicalSummary}
Major Findings: ${doctorExplanation.majorFindings.join('; ')}
Suggested Workup: ${doctorExplanation.suggestedWorkup.join('; ')}
Disclaimer: ${disclaimer}`;

    navigator.clipboard.writeText(textToCopy);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Explainable AI Engine Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-600/20">
              <BrainCircuit className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Explainable AI (XAI) Reasoning Engine
                </h2>
                <span className="px-2.5 py-0.5 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-extrabold text-[10px] rounded-full border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-600" /> Evidence-Based Decision Support
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Transparent clinical justification, SHAP feature weights, guideline mapping & missing test suggestions.
              </p>
            </div>
          </div>

          {/* Action Tools & Explanation Audience Switch */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Toggle: Doctor vs Patient */}
            <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl flex items-center border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setActiveViewMode('doctor')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                  activeViewMode === 'doctor'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" /> Clinician View
              </button>
              <button
                onClick={() => setActiveViewMode('patient')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                  activeViewMode === 'patient'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" /> Patient Summary
              </button>
            </div>

            <button
              onClick={handleCopySummary}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
            >
              {copySuccess ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-purple-500" />}
              {copySuccess ? 'Copied to Clipboard!' : 'Copy Summary'}
            </button>
          </div>
        </div>

        {/* Disease Selection Chips */}
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block">
            Select Disease Prediction to Inspect Reasoning:
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {diseaseList.map((disease) => {
              const isSelected = disease === selectedDisease;
              return (
                <button
                  key={disease}
                  onClick={() => setSelectedDisease(disease)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 border ${
                    isSelected
                      ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Activity className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-purple-500'}`} />
                  <span>{disease}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 1: AI CLINICAL REASONING CARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest block">
              SECTION 1 • AI CLINICAL REASONING
            </span>
            <div className="flex items-center gap-2.5">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {clinicalReasoning.disease}
              </h3>
              <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                ICD-10: {clinicalReasoning.icdCode}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
              {clinicalReasoning.clinicalSummary}
            </p>
          </div>

          {/* Risk Level Badge */}
          <div className="text-right shrink-0">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Calculated Risk</span>
            <span
              className={`px-3 py-1.5 text-xs font-black rounded-xl inline-flex items-center gap-1.5 ${
                clinicalReasoning.riskCategory === 'Critical'
                  ? 'bg-red-600 text-white'
                  : clinicalReasoning.riskCategory === 'High'
                  ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'
                  : clinicalReasoning.riskCategory === 'Moderate'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
              }`}
            >
              {clinicalReasoning.riskCategory} Risk ({clinicalReasoning.riskPercentage}%)
            </span>
          </div>
        </div>

        {/* Deep Justification & Pathophysiology */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 rounded-2xl space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 dark:text-purple-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-purple-600" /> Pathophysiological Mechanism
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {clinicalReasoning.riskExplanation}
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" /> Remaining Clinical Uncertainty
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {clinicalReasoning.remainingUncertainty}
            </p>
          </div>
        </div>

        {/* Key Findings Checklist */}
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Supporting Evidence Findings:
          </span>
          <div className="flex flex-wrap gap-2">
            {clinicalReasoning.evidenceUsed.map((item, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 2: FEATURE CONTRIBUTION (INTERACTIVE GRAPH) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest block">
              SECTION 2 • FEATURE CONTRIBUTION ANALYSIS
            </span>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
              <BarChart2 className="w-5 h-5 text-purple-600" />
              Interactive Feature Impact Chart (SHAP Weights)
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">Model Feature Attribution</span>
        </div>

        <div className="space-y-4">
          {featureContributions.map((fc) => {
            const isPositive = fc.type === 'Positive';
            const isNegative = fc.type === 'Negative';

            return (
              <div
                key={fc.id}
                className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`p-1.5 rounded-xl text-xs font-bold ${
                        isPositive
                          ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                          : isNegative
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {isPositive ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : isNegative ? (
                        <ArrowDownRight className="w-4 h-4" />
                      ) : (
                        <HelpCircle className="w-4 h-4" />
                      )}
                    </span>
                    <div>
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                        {fc.featureName}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                        Observed Value: <strong className="text-slate-800 dark:text-slate-200">{fc.valueObserved}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold rounded-md">
                      Importance: {fc.clinicalImportance}
                    </span>
                    <span
                      className={`px-3 py-1 text-xs font-black rounded-xl ${
                        isPositive
                          ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          : isNegative
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {fc.impactWeightPercent > 0 ? `+${fc.impactWeightPercent}%` : `${fc.impactWeightPercent}%`} Weight
                    </span>
                  </div>
                </div>

                {/* Progress Bar Visual */}
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isPositive ? 'bg-red-500' : isNegative ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}
                    style={{ width: `${Math.min(100, Math.abs(fc.impactWeightPercent) * 2)}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                  <strong className="text-slate-500 uppercase text-[10px]">Pathophysiological Impact:</strong>{' '}
                  {fc.pathophysiology}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: EVIDENCE PANEL (EVERY FINDING USED) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest block">
              SECTION 3 • EVIDENCE PANEL
            </span>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
              <FileText className="w-5 h-5 text-purple-600" />
              Clinical Evidence Parameters & Reference Ranges
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider">
                <th className="py-3 px-3">Parameter</th>
                <th className="py-3 px-3">Observed Value</th>
                <th className="py-3 px-3">Reference Range</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Clinical Significance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {evidenceParameters.map((ev) => (
                <tr key={ev.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 font-extrabold text-slate-900 dark:text-white">
                    {ev.parameter}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                    {ev.observedValue}
                  </td>
                  <td className="py-3 px-3 text-slate-500 dark:text-slate-400 font-mono">
                    {ev.referenceRange}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-black rounded-full ${
                        ev.status === 'Abnormal' || ev.status === 'High'
                          ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          : ev.status === 'Elevated' || ev.status === 'Borderline'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {ev.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300 max-w-xs">
                    {ev.clinicalSignificance}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 4 & SECTION 5: CONFIDENCE ANALYSIS + MISSING INFORMATION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION 4: CONFIDENCE ANALYSIS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest block">
              SECTION 4 • CONFIDENCE ANALYSIS
            </span>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
              Model Confidence Breakdown
            </h3>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Overall Confidence</span>
              <span className="text-xl font-black text-purple-600 dark:text-purple-400">
                {confidenceAnalysis.overallScore}% ({confidenceAnalysis.overallLevel})
              </span>
            </div>
            <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600 rounded-full"
                style={{ width: `${confidenceAnalysis.overallScore}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Why Confidence is High:
              </span>
              <ul className="space-y-1 pl-5 list-disc text-xs text-slate-600 dark:text-slate-400">
                {confidenceAnalysis.highConfidenceReasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Factors Reducing Confidence:
              </span>
              <ul className="space-y-1 pl-5 list-disc text-xs text-slate-600 dark:text-slate-400">
                {confidenceAnalysis.reducedConfidenceReasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* SECTION 5: MISSING INFORMATION */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest block">
              SECTION 5 • MISSING INFORMATION & WORKUP
            </span>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
              <AlertCircle className="w-5 h-5 text-purple-600" />
              Suggested Additional Investigations
            </h3>
          </div>

          <div className="space-y-3">
            {missingInformation.map((mi) => (
              <div
                key={mi.id}
                className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                    {mi.informationMissing}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md ${
                      mi.priority === 'High'
                        ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {mi.priority} Priority
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  <strong className="text-slate-700 dark:text-slate-300">Suggested Action:</strong> {mi.suggestedInvestigation}
                </p>
                <p className="text-[11px] text-slate-400 italic">
                  Effect: {mi.potentialEffect}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 6: CLINICAL GUIDELINE MATCH */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest block">
            SECTION 6 • CLINICAL GUIDELINE MATCH
          </span>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
            <BookOpen className="w-5 h-5 text-purple-600" />
            Evidence-Based Guideline Cross-References
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {guidelineMatches.map((gm) => (
            <div
              key={gm.id}
              className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 text-[10px] font-black rounded-md">
                    {gm.supportingGuideline}
                  </span>
                  <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">
                    {gm.status}
                  </span>
                </div>
                <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">
                  {gm.recommendation}
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  {gm.reason}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 7: NEXT BEST ACTIONS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest block">
            SECTION 7 • NEXT BEST ACTIONS
          </span>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
            <ListCheck className="w-5 h-5 text-purple-600" />
            Prioritized Clinical Action Protocol
          </h3>
        </div>

        <div className="space-y-3">
          {nextBestActions.map((nba, idx) => (
            <div
              key={nba.id}
              className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div className="space-y-0.5">
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">
                    {nba.action}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    <strong className="text-slate-700 dark:text-slate-300">Rationale:</strong> {nba.reason}
                  </p>
                  <p className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">
                    Expected Outcome: {nba.expectedOutcome}
                  </p>
                </div>
              </div>

              <span
                className={`px-3 py-1 text-xs font-black rounded-xl shrink-0 self-start sm:self-center ${
                  nba.priority === 'High'
                    ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                {nba.priority} Priority
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 8 & SECTION 9: PATIENT VS DOCTOR EXPLANATION VIEWS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest block">
              {activeViewMode === 'doctor' ? 'SECTION 9 • CLINICAL SUMMARY (DOCTOR EXPLANATION)' : 'SECTION 8 • SIMPLIFIED PATIENT EXPLANATION'}
            </span>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
              {activeViewMode === 'doctor' ? <Stethoscope className="w-5 h-5 text-purple-600" /> : <User className="w-5 h-5 text-purple-600" />}
              {activeViewMode === 'doctor' ? 'Professional Clinical Summary' : 'Plain-Language Patient Summary'}
            </h3>
          </div>
        </div>

        {activeViewMode === 'doctor' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Major Findings</span>
                <ul className="space-y-1.5 list-disc pl-4 text-xs text-slate-700 dark:text-slate-300">
                  {doctorExplanation.majorFindings.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Suggested Workup</span>
                <ul className="space-y-1.5 list-disc pl-4 text-xs text-slate-700 dark:text-slate-300">
                  {doctorExplanation.suggestedWorkup.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-4 bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/40 rounded-2xl space-y-2">
              <span className="text-[10px] uppercase font-bold text-purple-800 dark:text-purple-300 block">
                Specialist Referral Advice & Clinical Considerations
              </span>
              <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                {doctorExplanation.referralAdvice}
              </p>
              <ul className="space-y-1 list-disc pl-4 text-xs text-slate-600 dark:text-slate-400 pt-1">
                {doctorExplanation.clinicalConsiderations.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 rounded-2xl space-y-4">
            <h4 className="text-lg font-black text-purple-900 dark:text-purple-200">
              {patientExplanation.headline}
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {patientExplanation.simplifiedExplanation}
            </p>

            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-purple-900 dark:text-purple-200 block">Key Action Steps:</span>
              <ul className="space-y-2">
                {patientExplanation.keyTakeaways.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-purple-700 dark:text-purple-300 italic pt-2 border-t border-purple-200/60 dark:border-purple-900/40">
              Note: {patientExplanation.reassuringNote}
            </p>
          </div>
        )}
      </div>

      {/* SECTION 10: DISCLAIMER */}
      <div className="p-4 bg-slate-900 text-slate-200 border border-slate-800 rounded-2xl flex items-start gap-3 text-xs shadow-md">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-extrabold uppercase text-[10px] text-amber-400 tracking-wider block">
            SECTION 10 • MANDATORY CLINICAL SUPPORT DISCLAIMER
          </span>
          <p className="text-slate-300 leading-relaxed">{disclaimer}</p>
        </div>
      </div>
    </div>
  );
};
