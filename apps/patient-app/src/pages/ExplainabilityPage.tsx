import React, { useState } from 'react';
import { Eye, BookOpen, GitCommit, ShieldCheck, Activity, Award, Sparkles, Layers } from 'lucide-react';
import { useCDSS } from '../context/CDSSContext';
import { TopNavigation } from '../components/TopNavigation';
import { SHAPChart } from '../components/ui/SHAPChart';
import { GuidelineDrawer } from '../components/ui/GuidelineDrawer';

export default function ExplainabilityPage() {
  const { explainabilityReport, riskAssessment, setActiveGuidelineDrawer } = useCDSS();
  const diseaseKeys = Object.keys(riskAssessment.diseaseResults);
  const [selectedDisease, setSelectedDisease] = useState<string>(diseaseKeys[0] || 'diabetes');

  const selectedAttribution = explainabilityReport.diseaseAttributions[selectedDisease] || {
    diseaseId: selectedDisease,
    diseaseName: selectedDisease.toUpperCase(),
    topPositiveContributors: [],
    topNegativeContributors: [],
    missingDataImpact: []
  };

  const confidenceScore = Math.round((riskAssessment.overallConfidenceScore ?? 0.94) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-in">
      <TopNavigation />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Eye style={{ width: 22, height: 22, color: '#38bdf8' }} />
            Explainable AI & Clinical Reasoning Engine
          </h2>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
            SHAP feature attribution bubbles, evidence timelines, and ICMR 2024 / ADA 2025 guideline lineage
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ padding: '8px 16px', borderRadius: 999, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShieldCheck style={{ width: 14, height: 14, color: '#22c55e' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#22c55e' }}>Calibrated Confidence: {confidenceScore}%</span>
          </div>
        </div>
      </div>

      {/* Disease Selection Pills (9 Diseases) */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6 }}>
        {diseaseKeys.map((dis) => {
          const res = riskAssessment.diseaseResults[dis as keyof typeof riskAssessment.diseaseResults];
          const isSelected = selectedDisease === dis;
          return (
            <button
              key={dis}
              onClick={() => setSelectedDisease(dis)}
              style={{
                padding: '8px 16px', borderRadius: 14, fontSize: 12, fontWeight: 700,
                background: isSelected ? 'linear-gradient(135deg, #2563eb, #38bdf8)' : 'rgba(30,41,59,0.7)',
                color: isSelected ? '#fff' : '#94a3b8',
                border: `1px solid ${isSelected ? 'rgba(56,189,248,0.5)' : 'rgba(255,255,255,0.08)'}`,
                cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 6
              }}
            >
              <span style={{ textTransform: 'capitalize' }}>{dis.replace('_', ' ')}</span>
              {res && (
                <span style={{
                  fontSize: 10, padding: '1px 6px', borderRadius: 999,
                  background: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)',
                  color: isSelected ? '#fff' : '#64748b'
                }}>
                  {res.riskScore}%
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Interactive SHAP Feature Attribution Chart */}
      <SHAPChart diseaseName={selectedDisease.toUpperCase()} attribution={selectedAttribution} />

      {/* Interactive Feature Impact Bubbles */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles style={{ width: 16, height: 16, color: '#818cf8' }} />
          Biomarker Impact Weight Distribution
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {selectedAttribution.topPositiveContributors.map((factor, idx) => {
            const size = Math.max(70, Math.min(140, factor.weightPercentage * 2.5));
            return (
              <div
                key={idx}
                style={{
                  width: size, height: size, borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(245,158,11,0.15) 100%)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: 8, textAlign: 'center', transition: 'transform 0.2s', cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.3)'
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <div style={{ fontSize: 10, fontWeight: 700, color: '#fff', lineHeight: 1.1 }}>{factor.featureName}</div>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#ef4444', marginTop: 3 }}>+{factor.weightPercentage}%</div>
                <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 1 }}>{factor.value}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Official Guideline Lineage Citations */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <BookOpen style={{ width: 16, height: 16, color: '#38bdf8' }} />
          Embedded Clinical Guideline Citations (ICMR 2024 / ADA 2025)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
          {explainabilityReport.guidelineCitations.map((cite, idx) => (
            <div
              key={idx}
              onClick={() => setActiveGuidelineDrawer(cite)}
              style={{
                padding: 16, borderRadius: 16, background: 'rgba(30,41,59,0.7)',
                border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer',
                transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: 8
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(56,189,248,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: 'rgba(56,189,248,0.12)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.2)' }}>
                  {cite.source}
                </span>
                <span style={{ fontSize: 10, color: '#94a3b8' }}>Evidence: {cite.evidenceLevel}</span>
              </div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{cite.title}</h4>
              <p style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.5 }}>"{cite.clinicalRationale}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* Decision Trace Timeline Tree */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <GitCommit style={{ width: 16, height: 16, color: '#818cf8' }} />
          Step-by-Step Decision Pathway Trace
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {explainabilityReport.decisionTrace.steps.map((step, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: 14, borderRadius: 14, background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(56,189,248,0.15)', color: '#38bdf8', fontWeight: 800, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {step.stepNumber}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{step.title}</span>
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 999, background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>{step.stage}</span>
                </div>
                <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <GuidelineDrawer />
    </div>
  );
}
