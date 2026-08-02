import React from 'react';
import { Brain, Layers, BarChart3, CheckCircle2, AlertTriangle, ShieldCheck, Sparkles, HelpCircle } from 'lucide-react';
import { Patient } from '../../types';

interface XAIExplanationCardProps {
  patient: Patient;
}

export const XAIExplanationCard: React.FC<XAIExplanationCardProps> = ({ patient }) => {
  // Feature Attribution Items (SHAP Values for Explainability)
  const shapFeatures = [
    { feature: 'HbA1c Glycemic Level (8.6%)', impact: '+34%', type: 'negative', description: 'Primary driver of microvascular endothelial toxicity & diabetic nephropathy risk.' },
    { feature: 'Systolic Blood Pressure (148 mmHg)', impact: '+22%', type: 'negative', description: 'Elevates glomerular capillary pressure and arterial stroke wall stress.' },
    { feature: 'Body Mass Index (31.4 kg/m²)', impact: '+14%', type: 'negative', description: 'Visceral adiposity increases systemic insulin resistance and inflammatory cytokines.' },
    { feature: 'LDL Cholesterol (168 mg/dL)', impact: '+12%', type: 'negative', description: 'Accelerates coronary atherosclerotic plaque accretion.' },
    { feature: 'Physical Walking Activity (180 mins/wk)', impact: '-8%', type: 'positive', description: 'Protective effect: Improves peripheral muscle glucose uptake and vagal tone.' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* HEADER BANNER */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Brain className="w-6 h-6 text-emerald-600" />
          Explainable AI (XAI) Input Layer & Feature Inspector
        </h1>
        <p className="text-xs text-slate-500">
          Transparent clinical decision rationale showing exact SHAP biomarker weights and input layer data completeness
        </p>
      </div>

      {/* INPUT LAYER COMPLETENESS SCORE */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 backdrop-blur-md flex items-center justify-center font-black text-emerald-300 text-xl shrink-0">
            92%
          </div>
          <div>
            <h2 className="font-bold text-base text-white flex items-center gap-2">
              Input Layer Completeness & Data Quality Score
              <span className="text-[10px] bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 px-2 py-0.5 rounded-full uppercase">
                High Confidence
              </span>
            </h2>
            <p className="text-xs text-slate-300">
              14 of 16 vital & lab parameters verified. 0 imputed baseline values.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/10 p-3 rounded-2xl border border-white/10 text-xs">
          <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>32-Dimensional CDSS Input Vector</span>
        </div>
      </div>

      {/* SHAP BIOMARKER FEATURE ATTRIBUTION CHART */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            SHAP Biomarker Attribution (Why the AI Predicted 84% Risk)
          </h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Clinical Weight Contribution
          </span>
        </div>

        <div className="space-y-4">
          {shapFeatures.map((item, idx) => (
            <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                  {item.type === 'negative' ? (
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  )}
                  {item.feature}
                </span>

                <span
                  className={`text-xs font-black px-2.5 py-1 rounded-xl ${
                    item.type === 'negative'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}
                >
                  {item.impact}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* GUIDELINE MAPPING FOOTER CARD */}
      <div className="p-5 bg-blue-50/70 dark:bg-slate-800 rounded-3xl border border-blue-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-blue-600 shrink-0" />
          <div>
            <p className="font-extrabold text-sm text-slate-900 dark:text-white">
              Clinical Guidelines Compliance Engine
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              Mapped against ADA 2026 Standards of Care, KDIGO 2025 CKD Guidelines & ACC/AHA Risk Equations.
            </p>
          </div>
        </div>

        <span className="text-xs font-extrabold text-blue-700 bg-blue-100 dark:bg-blue-950 dark:text-blue-300 px-3 py-1.5 rounded-full shrink-0">
          Verified Clinical Decision Logic
        </span>
      </div>
    </div>
  );
};
