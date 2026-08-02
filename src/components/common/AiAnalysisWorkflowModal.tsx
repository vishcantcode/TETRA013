import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  Brain,
  ShieldCheck,
  Activity,
  FileText,
  Zap,
  ArrowRight,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { Patient, Vitals } from '../../types';

interface AiAnalysisWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  onCompleteAnalysis?: () => void;
}

export const AI_STAGES = [
  { id: 'stage-1', label: 'Validating Patient Data', desc: 'Verifying demographics, MRN history, and baseline vitals...' },
  { id: 'stage-2', label: 'Reading Laboratory Report', desc: 'Parsing OCR PDF image, normalizing units, & flagging abnormal values...' },
  { id: 'stage-3', label: 'Running Risk Prediction Models', desc: 'Executing XGBoost classifiers for Diabetes, CKD, & ASCVD risk...' },
  { id: 'stage-4', label: 'Checking Clinical Guidelines', desc: 'Matching ADA 2026, ACC/AHA, & KDIGO evidence protocols...' },
  { id: 'stage-5', label: 'Generating Explainable AI', desc: 'Computing SHAP feature importance & risk contribution vectors...' },
  { id: 'stage-6', label: 'Preparing Referral Recommendations', desc: 'Formulating specialist consult letter & patient care directions...' },
  { id: 'stage-7', label: 'Analysis Complete', desc: 'Clinical intelligence pipeline fully synchronized and signed.' },
];

export const AiAnalysisWorkflowModal: React.FC<AiAnalysisWorkflowModalProps> = ({
  isOpen,
  onClose,
  patient,
  onCompleteAnalysis,
}) => {
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStageIndex(0);
      setIsFinished(false);
      return;
    }

    let current = 0;
    const interval = setInterval(() => {
      current++;
      if (current < AI_STAGES.length - 1) {
        setCurrentStageIndex(current);
      } else {
        setCurrentStageIndex(AI_STAGES.length - 1);
        setIsFinished(true);
        clearInterval(interval);
      }
    }, 600);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border-2 border-indigo-500/50 text-white rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 relative overflow-hidden animate-fade-in">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-500 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Brain className="w-6 h-6 text-emerald-400 animate-pulse" />
              </div>
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">Clinical AI Inference Suite</h3>
              <p className="text-xs text-slate-400">
                Patient: <strong className="text-white">{patient.name}</strong> (MRN #{patient.mrn})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sequential Processing Stepper */}
        <div className="space-y-3 relative z-10">
          {AI_STAGES.map((stage, idx) => {
            const isDone = idx < currentStageIndex;
            const isActive = idx === currentStageIndex && !isFinished;
            const isCompletedStage = idx === currentStageIndex && isFinished;

            return (
              <div
                key={stage.id}
                className={`p-3.5 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-3 ${
                  isDone || isCompletedStage
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    : isActive
                    ? 'bg-indigo-950/60 border-indigo-400 text-white shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-400'
                    : 'bg-slate-950/40 border-slate-800/80 text-slate-500 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                      isDone || isCompletedStage
                        ? 'bg-emerald-500 text-slate-950'
                        : isActive
                        ? 'bg-indigo-500 text-white animate-bounce'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isDone || isCompletedStage ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isActive ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      idx + 1
                    )}
                  </div>

                  <div>
                    <span className="font-extrabold text-xs sm:text-sm block">{stage.label}</span>
                    <span className="text-[11px] opacity-80 font-medium block mt-0.5">{stage.desc}</span>
                  </div>
                </div>

                {isActive && (
                  <span className="px-2.5 py-1 bg-indigo-500/30 text-indigo-300 font-mono text-[10px] font-extrabold rounded-full border border-indigo-400/40 shrink-0">
                    RUNNING...
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Complete State Actions */}
        <div className="pt-2 relative z-10">
          {isFinished ? (
            <button
              onClick={() => {
                if (onCompleteAnalysis) onCompleteAnalysis();
                onClose();
              }}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-2xl transition shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5 fill-slate-950" />
              <span>View Generated Intelligence & Referral</span>
            </button>
          ) : (
            <div className="text-center text-xs text-slate-400 font-medium flex items-center justify-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              <span>Executing CDSS multi-disease pipeline... Please wait.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
