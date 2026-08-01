import React, { useState } from 'react';
import { Eye, BookOpen, GitCommit, ShieldCheck } from 'lucide-react';
import { useCDSS } from '../context/CDSSContext';
import { TopNavigation } from '../components/TopNavigation';
import { SHAPChart } from '../components/ui/SHAPChart';
import { GuidelineDrawer } from '../components/ui/GuidelineDrawer';

export default function ExplainabilityPage() {
  const { explainabilityReport, setActiveGuidelineDrawer } = useCDSS();
  const [selectedDisease, setSelectedDisease] = useState<'diabetes' | 'hypertension' | 'ckd' | 'cvd' | 'stroke'>('diabetes');

  const selectedAttribution = explainabilityReport.diseaseAttributions[selectedDisease];

  return (
    <div className="space-y-6 animate-in">
      <TopNavigation />

      <div className="flex-between">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-accent" /> Explainability & Clinical Reasoning Engine
          </h2>
          <p className="text-xs text-secondary">
            SHAP-style feature attributions, official medical guideline citations, and deterministic decision traces
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-secondary">Calibrated Confidence:</span>
          <span className="badge badge-success">{Math.round((explainabilityReport.confidenceBreakdown.overallConfidenceScore ?? 0.94) * 100)}%</span>
        </div>
      </div>

      {/* Disease Selection Tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        {(['diabetes', 'hypertension', 'ckd', 'cvd', 'stroke'] as const).map((dis) => (
          <button
            key={dis}
            onClick={() => setSelectedDisease(dis)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-all ${
              selectedDisease === dis ? 'bg-accent text-white shadow-sm' : 'bg-tertiary text-secondary hover:text-white'
            }`}
          >
            {dis}
          </button>
        ))}
      </div>

      {/* SHAP Feature Attribution Chart */}
      <SHAPChart diseaseName={selectedDisease.toUpperCase()} attribution={selectedAttribution} />

      {/* Guideline Citations List */}
      <div className="card p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-accent" /> Official Clinical Guideline Citations
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {explainabilityReport.guidelineCitations.map((cite, idx) => (
            <div
              key={idx}
              onClick={() => setActiveGuidelineDrawer(cite)}
              className="p-4 bg-tertiary rounded-lg border border-border hover:border-accent transition-all cursor-pointer space-y-2"
            >
              <div className="flex-between">
                <span className="badge badge-accent">{cite.source}</span>
                <span className="badge badge-info">{cite.evidenceLevel}</span>
              </div>
              <h4 className="text-sm font-bold text-white">{cite.title}</h4>
              <p className="text-xs text-secondary line-clamp-2">"{cite.clinicalRationale}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* Decision Trace Tree */}
      <div className="card p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <GitCommit className="w-5 h-5 text-accent" /> Step-by-Step Decision Trace
        </h3>

        <div className="space-y-3">
          {explainabilityReport.decisionTrace.steps.map((step, idx) => (
            <div key={idx} className="flex gap-4 items-start p-3 bg-tertiary rounded-lg border border-border">
              <div className="p-2 bg-accent-glow text-accent rounded-full text-xs font-bold w-6 h-6 flex items-center justify-center">
                {step.stepNumber}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{step.title}</span>
                  <span className="badge badge-info text-2xs">{step.stage}</span>
                </div>
                <p className="text-xs text-secondary">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <GuidelineDrawer />
    </div>
  );
}
