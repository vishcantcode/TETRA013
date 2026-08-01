import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Upload, Cpu, Stethoscope, Sparkles, Activity, Play, Users, Zap } from 'lucide-react';
import { useCDSS, DemoPatientKey } from '../context/CDSSContext';

const ECGLine: React.FC = () => (
  <svg className="absolute bottom-0 left-0 w-full" height="80" viewBox="0 0 1440 80" preserveAspectRatio="none">
    <polyline
      fill="none"
      stroke="rgba(56,189,248,0.25)"
      strokeWidth="2"
      points="0,60 80,60 100,60 120,40 140,10 160,70 180,30 200,60 320,60 340,60 360,40 380,10 400,70 420,30 440,60 560,60 580,40 600,10 620,70 640,30 660,60 780,60 800,40 820,10 840,70 860,30 880,60 1000,60 1020,40 1040,10 1060,70 1080,30 1100,60 1220,60 1240,40 1260,10 1280,70 1300,30 1320,60 1440,60"
      style={{ strokeDasharray: 2000, strokeDashoffset: 2000, animation: 'ecgDraw 3s ease forwards infinite' }}
    />
  </svg>
);

const DEMO_PROFILES: { key: DemoPatientKey; label: string; desc: string; risk: number; color: string }[] = [
  { key: 'patient-healthy',     label: 'Healthy Baseline',    desc: 'No active conditions',           risk: 12, color: '#22c55e' },
  { key: 'patient-prediabetes', label: 'Pre-Diabetic Adult',  desc: 'Borderline glucose',             risk: 52, color: '#f59e0b' },
  { key: 'patient-diabetes',    label: 'Type 2 Diabetes',     desc: 'HbA1c 8.4% — High Risk',        risk: 82, color: '#ef4444' },
  { key: 'patient-hypertension',label: 'Hypertension',        desc: 'SBP 154 mmHg',                  risk: 78, color: '#ef4444' },
  { key: 'patient-ckd',         label: 'Stage 3b CKD',        desc: 'eGFR 48 — Urgent Nephrology',   risk: 91, color: '#ef4444' },
  { key: 'patient-multimorbid', label: 'Multi-Comorbid',      desc: 'Complex Chronic Conditions',    risk: 96, color: '#ef4444' },
];

const QUICK_PROMPTS = [
  'Predict 5-year kidney decline',
  'Should I refer this patient?',
  'What happens without medication?',
  'Explain in Gujarati',
  'Generate care plan',
];

export default function Landing() {
  const navigate = useNavigate();
  const { loadDemoProfile } = useCDSS();
  const [query, setQuery] = useState('');
  const [stage, setStage] = useState<'home' | 'select'>('home');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick(p => p + 1), 2000);
    return () => clearInterval(t);
  }, []);

  const handleLaunch = (key: DemoPatientKey) => {
    loadDemoProfile(key);
    navigate('/clinician');
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

      {/* ── AMBIENT BACKGROUND LAYER ── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        {/* Radial glow blobs */}
        <div style={{ position: 'absolute', top: '10%', left: '15%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)', animation: 'pulse 6s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '15%', right: '10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.09) 0%, transparent 70%)', animation: 'pulse 8s ease-in-out 2s infinite' }} />
        <div style={{ position: 'absolute', top: '50%', right: '25%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)', animation: 'pulse 10s ease-in-out 1s infinite' }} />

        {/* Fine grid */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04 }}>
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(56,189,248,1)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* ECG strip */}
        <ECGLine />
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="animate-in" style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 820, margin: '0 auto', padding: '2rem' }}>

        {stage === 'home' && (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>

            {/* Wordmark badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 999, background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.25)', fontSize: 12, fontWeight: 600, color: '#38bdf8' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite', display: 'inline-block' }} />
              Enterprise AI Clinical Decision Intelligence Platform
            </div>

            {/* Hero headline */}
            <div>
              <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.04em', color: '#fff', marginBottom: '1rem' }}>
                What will happen to<br />
                <span style={{ background: 'linear-gradient(135deg, #60a5fa 0%, #38bdf8 50%, #818cf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  this patient's future?
                </span>
              </h1>
              <p style={{ fontSize: 16, color: '#94a3b8', maxWidth: 540, margin: '0 auto', lineHeight: 1.6 }}>
                HealthSense AI predicts chronic disease trajectories, explains every decision, and guides the right clinical action — powered by ICMR, ADA, KDIGO, and AHA guidelines.
              </p>
            </div>

            {/* AI Prompt Bar */}
            <div style={{ width: '100%', position: 'relative' }}>
              <div style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: '#38bdf8' }}>
                <Sparkles style={{ width: 18, height: 18 }} />
              </div>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') setStage('select'); }}
                placeholder="Ask AI: 'Predict 5-year kidney decline for a 56-year-old diabetic patient...'"
                style={{
                  width: '100%', padding: '18px 140px 18px 52px',
                  borderRadius: 20, border: '1px solid rgba(56,189,248,0.3)',
                  background: 'rgba(30,41,59,0.8)', backdropFilter: 'blur(16px)',
                  color: '#fff', fontSize: 15, outline: 'none',
                  boxShadow: '0 0 40px rgba(56,189,248,0.1)',
                  transition: 'all 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(56,189,248,0.6)'; e.target.style.boxShadow = '0 0 60px rgba(56,189,248,0.2)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(56,189,248,0.3)'; e.target.style.boxShadow = '0 0 40px rgba(56,189,248,0.1)'; }}
              />
              <button
                onClick={() => setStage('select')}
                style={{
                  position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                  padding: '10px 20px', borderRadius: 14,
                  background: 'linear-gradient(135deg, #2563eb, #38bdf8)',
                  color: '#fff', fontWeight: 700, fontSize: 14,
                  border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                Analyse <ArrowRight style={{ width: 16, height: 16 }} />
              </button>
            </div>

            {/* Quick Prompt Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
              {QUICK_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => { setQuery(p); setStage('select'); }}
                  style={{
                    padding: '6px 14px', borderRadius: 999,
                    background: 'rgba(30,41,59,0.7)', border: '1px solid rgba(255,255,255,0.08)',
                    color: '#94a3b8', fontSize: 12, cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { (e.target as HTMLButtonElement).style.color = '#fff'; (e.target as HTMLButtonElement).style.borderColor = 'rgba(56,189,248,0.4)'; }}
                  onMouseLeave={e => { (e.target as HTMLButtonElement).style.color = '#94a3b8'; (e.target as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Action Trio */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, width: '100%' }}>
              {[
                { icon: <Play style={{ width: 20, height: 20 }} />, label: 'Load Demo Patient', sub: '6 Clinical Scenarios', action: () => setStage('select'), color: '#2563eb' },
                { icon: <Upload style={{ width: 20, height: 20 }} />, label: 'Upload Lab Report', sub: 'OCR Auto-Extraction', action: () => navigate('/ocr-upload'), color: '#38bdf8' },
                { icon: <Cpu style={{ width: 20, height: 20 }} />, label: 'Digital Twin Model', sub: 'Interactive Organ View', action: () => navigate('/digital-twin'), color: '#818cf8' },
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={item.action}
                  style={{
                    padding: '20px 16px', borderRadius: 20,
                    background: 'rgba(30,41,59,0.7)', backdropFilter: 'blur(12px)',
                    border: `1px solid rgba(255,255,255,0.08)`,
                    cursor: 'pointer', textAlign: 'center',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { const el = e.currentTarget; el.style.transform = 'translateY(-4px)'; el.style.borderColor = `${item.color}60`; el.style.boxShadow = `0 12px 30px rgba(0,0,0,0.4), 0 0 20px ${item.color}20`; }}
                  onMouseLeave={e => { const el = e.currentTarget; el.style.transform = 'none'; el.style.borderColor = 'rgba(255,255,255,0.08)'; el.style.boxShadow = 'none'; }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: `${item.color}20`, border: `1px solid ${item.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{item.sub}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Credibility strip */}
            <div style={{ display: 'flex', gap: 24, fontSize: 11, color: '#475569', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16, width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
              {['ICMR Guidelines', 'ADA 2024', 'KDIGO 2023', 'AHA Standards', 'WHO Protocols', 'HL7 FHIR R4', 'ABDM Ready', 'Sub-50ms Engine'].map(tag => (
                <span key={tag} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#38bdf8', display: 'inline-block' }} />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {stage === 'select' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>
                Select a Clinical Scenario
              </h2>
              <p style={{ fontSize: 14, color: '#64748b', marginTop: 6 }}>
                Each profile runs all 12 AI engines in real-time — Educational Simulation
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
              {DEMO_PROFILES.map(p => (
                <button
                  key={p.key}
                  onClick={() => handleLaunch(p.key)}
                  style={{
                    padding: '20px', borderRadius: 20,
                    background: 'rgba(30,41,59,0.8)', backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    textAlign: 'left', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', gap: 12,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { const el = e.currentTarget; el.style.transform = 'translateY(-3px)'; el.style.borderColor = `${p.color}50`; el.style.boxShadow = `0 16px 32px rgba(0,0,0,0.4), 0 0 20px ${p.color}15`; }}
                  onMouseLeave={e => { const el = e.currentTarget; el.style.transform = 'none'; el.style.borderColor = 'rgba(255,255,255,0.08)'; el.style.boxShadow = 'none'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: `${p.color}18`, border: `1px solid ${p.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users style={{ width: 18, height: 18, color: p.color }} />
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: p.color }}>{p.risk}%</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>{p.label}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>{p.desc}</div>
                  </div>
                  {/* Mini risk bar */}
                  <div style={{ height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${p.risk}%`, borderRadius: 999, background: `linear-gradient(90deg, ${p.color}80, ${p.color})`, transition: 'width 0.6s ease' }} />
                  </div>
                </button>
              ))}
            </div>

            <button onClick={() => setStage('home')} style={{ alignSelf: 'center', padding: '8px 20px', borderRadius: 999, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#64748b', fontSize: 13, cursor: 'pointer' }}>
              ← Back to Home
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes ecgDraw { 0%{stroke-dashoffset:2000} 70%{stroke-dashoffset:0} 100%{stroke-dashoffset:-2000} }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.7;transform:scale(1.05)} }
      `}</style>
    </div>
  );
}
