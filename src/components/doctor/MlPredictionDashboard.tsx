import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Activity,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  Clock,
  Layers,
  Code2,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Sliders,
  ChevronRight,
  Info,
  HelpCircle,
  Zap,
  BarChart3,
  ListFilter,
  ArrowUpRight,
  ArrowDownRight,
  FileCode,
  Terminal,
  Database,
  X,
  Play,
} from 'lucide-react';
import { Patient } from '../../types';
import { MlPredictionEngine } from '../../services/mlPredictionEngine';
import {
  MlPredictionResponse,
  MlDiseasePrediction,
  MlContributor,
  MlPatientPayload,
} from '../../types/mlPrediction';

interface Props {
  activePatient: Patient;
  customVitals?: any;
}

// Circular Risk Gauge Component
const CircularGauge: React.FC<{
  percentage: number;
  category: 'Low' | 'Moderate' | 'High' | 'Critical';
}> = ({ percentage, category }) => {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  let strokeColor = '#10B981'; // Green (Low)
  if (category === 'Moderate') strokeColor = '#F59E0B'; // Amber
  if (category === 'High') strokeColor = '#EF4444'; // Red
  if (category === 'Critical') strokeColor = '#991B1B'; // Dark Red / Rose

  return (
    <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
      <svg className="w-24 h-24 transform -rotate-90">
        <circle
          cx="48"
          cy="48"
          r={radius}
          className="stroke-slate-100 dark:stroke-slate-800"
          strokeWidth="8"
          fill="transparent"
        />
        <circle
          cx="48"
          cy="48"
          r={radius}
          stroke={strokeColor}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xl font-black text-slate-900 dark:text-white leading-none">
          {percentage}%
        </span>
        <span className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">
          Risk
        </span>
      </div>
    </div>
  );
};

export const MlPredictionDashboard: React.FC<Props> = ({ activePatient, customVitals }) => {
  const [mlResponse, setMlResponse] = useState<MlPredictionResponse | null>(null);
  const [patientPayload, setPatientPayload] = useState<MlPatientPayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [simulateError, setSimulateError] = useState<boolean>(false);
  const [selectedDisease, setSelectedDisease] = useState<string>('Type 2 Diabetes');
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'comparison' | 'timeline' | 'architecture'>('overview');
  const [showJsonModal, setShowJsonModal] = useState<boolean>(false);

  const fetchPredictions = async (forceError = simulateError) => {
    setIsLoading(true);
    setError(null);

    const engine = MlPredictionEngine.getInstance();
    const payload = engine.preparePatientPayload(activePatient, customVitals);
    setPatientPayload(payload);

    try {
      const response = await engine.predictDiseaseRisk(payload, {
        simulateError: forceError,
      });

      if (response.status === 'error') {
        setError(response.errorMessage || 'Unable to generate prediction. Please try again.');
        setMlResponse(null);
      } else {
        setMlResponse(response);
      }
    } catch (err) {
      setError('Unable to generate prediction. Please try again.');
      setMlResponse(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions(simulateError);
  }, [activePatient, customVitals, simulateError]);

  const activePrediction = mlResponse?.predictions.find(
    (p) => p.disease === selectedDisease
  ) || mlResponse?.predictions[0];

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Modular ML Prediction Engine
                </h2>
                <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold text-[10px] rounded-full border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> REST API Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Independent inference layer decoupled from UI, rules, and LLM services.
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowJsonModal(true)}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
            >
              <Code2 className="w-4 h-4 text-indigo-500" />
              Inspect JSON Payload
            </button>

            <button
              onClick={() => {
                const nextState = !simulateError;
                setSimulateError(nextState);
                fetchPredictions(nextState);
              }}
              className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 border ${
                simulateError
                  ? 'bg-red-500 text-white border-red-600'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              {simulateError ? 'Reset API Call' : 'Test Error State'}
            </button>

            <button
              onClick={() => fetchPredictions(simulateError)}
              disabled={isLoading}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Re-Predict
            </button>
          </div>
        </div>

        {/* System Diagnostics Metrics Bar */}
        {mlResponse && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">REST Endpoint</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-[11px] truncate block">
                {mlResponse.endpointCalled}
              </span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Model Version</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                {mlResponse.modelVersion}
              </span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Inference Latency</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-[11px] flex items-center gap-1">
                <Clock className="w-3 h-3" /> {mlResponse.executionTimeMs} ms
              </span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Payload Completeness</span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-[11px]">
                {Math.round(mlResponse.payloadSummary.completenessRatio * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Error Fallback Display */}
      {error && (
        <div className="p-8 bg-red-50 dark:bg-red-950/40 border-2 border-red-200 dark:border-red-900/60 rounded-3xl text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto border border-red-200 dark:border-red-800">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-black text-red-900 dark:text-red-200">
              Unable to generate prediction.
            </h3>
            <p className="text-xs text-red-700 dark:text-red-300 font-medium">
              Please try again. The prediction microservice endpoint returned an error or timed out during inference.
            </p>
          </div>
          <button
            onClick={() => {
              setSimulateError(false);
              fetchPredictions(false);
            }}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Retry Prediction Call
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && !error && (
        <div className="p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-center space-y-4">
          <Cpu className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto" />
          <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
            Running XGBoost / LightGBM Ensembles via Prediction Service...
          </p>
          <p className="text-xs text-slate-400">Parsing standardized Patient JSON payload and computing feature weights</p>
        </div>
      )}

      {/* Main Content Area */}
      {!isLoading && !error && mlResponse && (
        <div className="space-y-6">
          {/* Diseases Tab Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {mlResponse.predictions.map((p) => {
              const isSelected = p.disease === selectedDisease;
              return (
                <button
                  key={p.disease}
                  onClick={() => setSelectedDisease(p.disease)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all shrink-0 flex items-center gap-2.5 border ${
                    isSelected
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-md'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{p.disease}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      p.riskCategory === 'Critical' || p.riskCategory === 'High'
                        ? isSelected
                          ? 'bg-red-500 text-white'
                          : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                        : p.riskCategory === 'Moderate'
                        ? isSelected
                          ? 'bg-amber-500 text-slate-900'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : isSelected
                        ? 'bg-emerald-500 text-white'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {p.riskPercentage}%
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Disease Overview Card */}
          {activePrediction && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-6">
                <div className="flex items-center gap-5">
                  <CircularGauge
                    percentage={activePrediction.riskPercentage}
                    category={activePrediction.riskCategory}
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-black text-slate-900 dark:text-white">
                        {activePrediction.disease}
                      </h3>
                      <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                        ICD-10: {activePrediction.diseaseCode}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
                      {activePrediction.description}
                    </p>
                    <div className="pt-1 flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Category:
                      </span>
                      <span
                        className={`px-2.5 py-0.5 text-xs font-black rounded-lg ${
                          activePrediction.riskCategory === 'Critical'
                            ? 'bg-red-600 text-white'
                            : activePrediction.riskCategory === 'High'
                            ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'
                            : activePrediction.riskCategory === 'Moderate'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                        }`}
                      >
                        {activePrediction.riskCategory} Risk ({activePrediction.riskPercentage}%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Confidence Card */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2 min-w-[260px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" /> Model Confidence
                    </span>
                    <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 text-[10px] font-black rounded-md">
                      {activePrediction.confidence} ({Math.round(activePrediction.confidenceScore * 100)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.round(activePrediction.confidenceScore * 100)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                    {activePrediction.confidenceRationale}
                  </p>
                </div>
              </div>

              {/* Sub Navigation Tabs inside Active Disease */}
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                    activeTab === 'overview'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Feature Importance
                </button>
                <button
                  onClick={() => setActiveTab('features')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                    activeTab === 'features'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Positive vs Negative Factors
                </button>
                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                    activeTab === 'timeline'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Historical Risk Timeline
                </button>
                <button
                  onClick={() => setActiveTab('comparison')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                    activeTab === 'comparison'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  All Diseases Comparison
                </button>
              </div>

              {/* Tab 1: Feature Importance List */}
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-indigo-500" />
                      Top Clinical Contribution Features
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Calculated via SHAP / Feature Weights
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {activePrediction.featureImportance.topFeatures.map((feat) => {
                      const isPositive = feat.type === 'Positive';
                      return (
                        <div
                          key={feat.id}
                          className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className={`p-1 rounded-lg ${
                                  isPositive
                                    ? 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400'
                                    : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                                }`}
                              >
                                {isPositive ? (
                                  <ArrowUpRight className="w-4 h-4" />
                                ) : (
                                  <ArrowDownRight className="w-4 h-4" />
                                )}
                              </span>
                              <div>
                                <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                                  {feat.featureName}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium block">
                                  Value: {feat.value}
                                </span>
                              </div>
                            </div>

                            <span
                              className={`px-2.5 py-1 text-xs font-black rounded-xl ${
                                isPositive
                                  ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              }`}
                            >
                              {feat.impactWeightPercent > 0 ? `+${feat.impactWeightPercent}%` : `${feat.impactWeightPercent}%`} Weight
                            </span>
                          </div>

                          {/* Progress bar visual */}
                          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isPositive ? 'bg-red-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, Math.abs(feat.impactWeightPercent) * 2)}%` }}
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                            <div className="text-slate-600 dark:text-slate-300">
                              <span className="font-bold text-slate-400 block text-[10px] uppercase">Pathophysiology:</span>
                              {feat.clinicalReason}
                            </div>
                            <div className="text-slate-600 dark:text-slate-300">
                              <span className="font-bold text-slate-400 block text-[10px] uppercase">Clinical Significance:</span>
                              {feat.significance}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Missing Info callout */}
                  {activePrediction.featureImportance.missingInformation.length > 0 && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-2xl flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                      <div>
                        <span className="font-bold">Missing Laboratory Data: </span>
                        {activePrediction.featureImportance.missingInformation.join(', ')}. Supplying these markers will improve prediction precision.
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Positive vs Negative Factors */}
              {activeTab === 'features' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Positive Contributors */}
                  <div className="p-5 bg-red-50/50 dark:bg-red-950/20 border border-red-200/70 dark:border-red-900/40 rounded-2xl space-y-3">
                    <h4 className="text-xs font-black text-red-900 dark:text-red-200 uppercase tracking-wider flex items-center gap-1.5">
                      <ArrowUpRight className="w-4 h-4 text-red-600" />
                      Risk Elevators (+ Contributors)
                    </h4>
                    <p className="text-[11px] text-red-700/80 dark:text-red-300/80">
                      Biomarkers and clinical factors driving risk percentage upwards
                    </p>

                    <div className="space-y-2">
                      {activePrediction.featureImportance.positiveContributors.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-red-100 dark:border-red-900/30 space-y-1"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-extrabold text-slate-900 dark:text-white">
                              {item.featureName}
                            </span>
                            <span className="font-mono font-black text-red-600 dark:text-red-400">
                              +{item.impactWeightPercent}%
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">{item.clinicalReason}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Negative / Protective Contributors */}
                  <div className="p-5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/40 rounded-2xl space-y-3">
                    <h4 className="text-xs font-black text-emerald-900 dark:text-emerald-200 uppercase tracking-wider flex items-center gap-1.5">
                      <ArrowDownRight className="w-4 h-4 text-emerald-600" />
                      Protective Factors (- Contributors)
                    </h4>
                    <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80">
                      Healthy lifestyle factors and normal lab ranges lowering risk
                    </p>

                    <div className="space-y-2">
                      {activePrediction.featureImportance.negativeContributors.length > 0 ? (
                        activePrediction.featureImportance.negativeContributors.map((item) => (
                          <div
                            key={item.id}
                            className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-emerald-900/30 space-y-1"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-extrabold text-slate-900 dark:text-white">
                                {item.featureName}
                              </span>
                              <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                                {item.impactWeightPercent}%
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500">{item.clinicalReason}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic">No specific protective biomarkers detected in current payload.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Historical Risk Timeline */}
              {activeTab === 'timeline' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-indigo-500" />
                    Historical Risk Trajectory
                  </h4>

                  <div className="p-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-6">
                    <div className="flex items-end justify-between gap-4 h-36 pt-4 border-b border-slate-200 dark:border-slate-700 px-4">
                      {activePrediction.historicalRiskTimeline?.map((point, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                          <span className="text-xs font-black text-slate-900 dark:text-white">
                            {point.riskPercentage}%
                          </span>
                          <div
                            className={`w-full max-w-[48px] rounded-t-xl transition-all duration-500 ${
                              point.category === 'Critical' || point.category === 'High'
                                ? 'bg-red-500'
                                : point.category === 'Moderate'
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ height: `${point.riskPercentage}%` }}
                          />
                          <span className="text-[10px] font-bold text-slate-400 mt-1">
                            {point.date}
                          </span>
                        </div>
                      ))}
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                      Trajectory shows 6-month progression trajectory computed across historical EHR checkpoints.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 4: All Diseases Comparison */}
              {activeTab === 'comparison' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mlResponse.predictions.map((item) => (
                    <div
                      key={item.disease}
                      className={`p-5 rounded-2xl border transition-all space-y-3 ${
                        item.disease === selectedDisease
                          ? 'bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-800 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {item.disease}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {item.diseaseCode}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span
                          className={`text-2xl font-black ${
                            item.riskCategory === 'Critical' || item.riskCategory === 'High'
                              ? 'text-red-600 dark:text-red-400'
                              : item.riskCategory === 'Moderate'
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {item.riskPercentage}%
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          {item.riskCategory} Risk
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                        {item.description}
                      </p>

                      <button
                        onClick={() => {
                          setSelectedDisease(item.disease);
                          setActiveTab('overview');
                        }}
                        className="w-full py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-1"
                      >
                        Inspect Deep Factors <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* JSON Payload & Microservice Inspector Modal */}
      {showJsonModal && patientPayload && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 text-slate-100 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden space-y-0">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-3">
                <Terminal className="w-6 h-6 text-indigo-400" />
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    REST API Request & Response Inspector
                  </h3>
                  <p className="text-xs text-slate-400">
                    Standardized JSON payload passed to <code className="text-indigo-300">POST /api/ml/v1/predict</code>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowJsonModal(false)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: 2 Code columns */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto font-mono text-[11px]">
              {/* Left Column: Request Payload */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase tracking-wider font-bold">
                  <span>Standardized Request JSON</span>
                  <span className="text-emerald-400">Client Payload</span>
                </div>
                <pre className="p-4 bg-slate-950 border border-slate-800 rounded-2xl overflow-x-auto text-indigo-300 selection:bg-indigo-900">
                  {JSON.stringify(patientPayload, null, 2)}
                </pre>
              </div>

              {/* Right Column: Prediction Service Response */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase tracking-wider font-bold">
                  <span>Structured Response JSON</span>
                  <span className="text-blue-400">ML Service Response</span>
                </div>
                <pre className="p-4 bg-slate-950 border border-slate-800 rounded-2xl overflow-x-auto text-emerald-300 selection:bg-emerald-900">
                  {JSON.stringify(mlResponse, null, 2)}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Database className="w-4 h-4 text-indigo-400" />
                Decoupled microservice architecture — zero UI modifications needed when connecting FastAPI/Python backend.
              </span>
              <button
                onClick={() => setShowJsonModal(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
