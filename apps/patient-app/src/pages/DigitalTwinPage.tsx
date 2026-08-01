import React, { useState } from 'react';
import { Cpu, Sliders, TrendingUp, Clock, Brain, Activity } from 'lucide-react';
import { useCDSS } from '../context/CDSSContext';
import { TopNavigation } from '../components/TopNavigation';
import { DigitalTwinViewer } from '../components/ui/DigitalTwinViewer';
import { InterventionSimulator } from '@healthsense/patient-digital-twin';

/* ─────────────────────────────────────
   Simulation slider component
───────────────────────────────────── */
const SimSlider: React.FC<{
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  color?: string;
}> = ({ label, unit, min, max, step, value, onChange, color = '#38bdf8' }) => {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: '#94a3b8' }}>{label}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>
          {value > 0 ? '+' : ''}{value} {unit}
        </span>
      </div>
      <div style={{ position: 'relative', height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.08)' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${Math.abs(pct)}%`, borderRadius: 999, background: `linear-gradient(90deg, ${color}80, ${color})`, transition: 'width 0.1s' }} />
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
          style={{ position: 'absolute', inset: '-6px 0', width: '100%', opacity: 0, cursor: 'pointer', zIndex: 2, height: 18 }}
        />
        <div style={{ position: 'absolute', top: '50%', left: `${pct}%`, transform: 'translate(-50%, -50%)', width: 14, height: 14, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}`, zIndex: 1, pointerEvents: 'none', transition: 'left 0.1s' }} />
      </div>
    </div>
  );
};

/* ─────────────────────────────────────
   Trajectory mini chart
───────────────────────────────────── */
const TrajectoryMini: React.FC<{ base: number; sim: number; label: string }> = ({ base, sim, label }) => {
  const improved = sim < base;
  const delta = base - sim;
  return (
    <div style={{ padding: '12px 14px', borderRadius: 14, background: 'rgba(30,41,59,0.7)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>{label}</div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#ef4444' }}>{base}%</span>
          <span style={{ color: '#475569', fontSize: 14 }}>→</span>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#22c55e' }}>{sim}%</span>
        </div>
      </div>
      <div style={{
        padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
        background: improved ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
        color: improved ? '#22c55e' : '#ef4444',
        border: `1px solid ${improved ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
      }}>
        {improved ? '↓' : '↑'} {Math.abs(delta).toFixed(0)}%
      </div>
    </div>
  );
};

export default function DigitalTwinPage() {
  const { digitalTwin, riskAssessment } = useCDSS();
  const [hba1cDelta,  setHba1cDelta]  = useState(-1.0);
  const [bpDelta,     setBpDelta]     = useState(-10);
  const [bmiDelta,    setBmiDelta]    = useState(-2.0);
  const [quitSmoking, setQuitSmoking] = useState(true);

  const sim = InterventionSimulator.simulate(riskAssessment, { hba1cDelta, systolicBPDelta: bpDelta, bmiDelta, quitSmoking });
  const riskDelta = sim.baselineRiskScore - sim.simulatedRiskScore;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }} className="animate-in">
      <TopNavigation />

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Cpu style={{ width: 22, height: 22, color: '#38bdf8' }} />
            Patient Digital Twin
          </h2>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
            Continuously evolving virtual biological state ·{' '}
            <span style={{ fontFamily: 'monospace', color: '#94a3b8' }}>{digitalTwin.activeVersion.version}</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ padding: '6px 14px', borderRadius: 999, background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)', fontSize: 12, fontWeight: 600, color: '#38bdf8' }}>
            <Activity style={{ width: 12, height: 12, display: 'inline', marginRight: 5 }} />
            Live Model
          </span>
          <span style={{ padding: '6px 14px', borderRadius: 999, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', fontSize: 12, fontWeight: 600, color: '#f59e0b' }}>
            Educational Simulation
          </span>
        </div>
      </div>

      {/* ── Organ Map + Radar + Detail ── */}
      <DigitalTwinViewer />

      {/* ── Intervention Simulator ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Controls */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sliders style={{ width: 16, height: 16, color: '#38bdf8' }} />
            What-If Intervention Controls
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <SimSlider label="HbA1c Reduction" unit="%" min={-3.0} max={0} step={0.1} value={hba1cDelta} onChange={setHba1cDelta} color="#818cf8" />
            <SimSlider label="Systolic BP Reduction" unit="mmHg" min={-30} max={0} step={2} value={bpDelta} onChange={setBpDelta} color="#38bdf8" />
            <SimSlider label="BMI Weight Loss" unit="kg/m²" min={-5.0} max={0} step={0.5} value={bmiDelta} onChange={setBmiDelta} color="#22c55e" />

            {/* Smoking Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Tobacco Cessation</div>
                <div style={{ fontSize: 11, color: '#475569' }}>Complete smoking cessation</div>
              </div>
              <button
                onClick={() => setQuitSmoking(q => !q)}
                style={{
                  width: 44, height: 24, borderRadius: 999, border: 'none', cursor: 'pointer',
                  background: quitSmoking ? '#22c55e' : 'rgba(255,255,255,0.1)',
                  position: 'relative', transition: 'background 0.2s',
                }}
              >
                <span style={{
                  position: 'absolute', top: 2, left: quitSmoking ? 22 : 2,
                  width: 20, height: 20, borderRadius: '50%', background: '#fff',
                  transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                }} />
              </button>
            </div>
          </div>
        </div>

        {/* Simulation Output */}
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Brain style={{ width: 16, height: 16, color: '#818cf8' }} />
            AI Projected Outcome
          </h3>

          {/* Big risk shift indicator */}
          <div style={{
            padding: 20, borderRadius: 18, textAlign: 'center',
            background: riskDelta >= 5 ? 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(56,189,248,0.08))' : 'rgba(30,41,59,0.6)',
            border: `1px solid ${riskDelta >= 5 ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.07)'}`,
          }}>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>Overall Risk Shift</div>
            <div style={{ fontSize: 48, fontWeight: 900, color: riskDelta >= 0 ? '#22c55e' : '#ef4444', lineHeight: 1, letterSpacing: '-0.03em' }}>
              {riskDelta >= 0 ? '↓' : '↑'}{Math.abs(riskDelta).toFixed(0)}%
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{sim.clinicalImpactSummary?.slice(0, 80) ?? 'With all interventions applied'}</div>
          </div>

          <TrajectoryMini base={sim.baselineRiskScore} sim={sim.simulatedRiskScore} label="Composite Risk" />

          {/* Tier change */}
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, padding: '10px 14px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#64748b', marginBottom: 2 }}>Baseline Tier</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#ef4444', textTransform: 'uppercase' }}>{sim.baselineTier}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', color: '#475569' }}>→</div>
            <div style={{ flex: 1, padding: '10px 14px', borderRadius: 12, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)', textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#64748b', marginBottom: 2 }}>Simulated Tier</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#22c55e', textTransform: 'uppercase' }}>{sim.simulatedTier}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Trajectory Projection Table ── */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp style={{ width: 16, height: 16, color: '#38bdf8' }} />
          Disease Progression Trajectories
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#475569', fontWeight: 400, display: 'flex', alignItems: 'center', gap: 5 }}>
            <Clock style={{ width: 11, height: 11 }} /> Multi-horizon projections
          </span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {digitalTwin.projections.map((proj, idx) => {
            const isBad = proj.projectedRiskTier === 'severe' || proj.projectedRiskTier === 'high';
            const c = isBad ? '#ef4444' : '#22c55e';
            return (
              <div key={idx} style={{
                padding: '16px', borderRadius: 16,
                background: `${c}08`,
                border: `1px solid ${c}20`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 11, color: '#64748b' }}>{proj.monthsAhead} months</span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: `${c}15`, color: c, textTransform: 'capitalize' }}>
                    {proj.projectedRiskTier}
                  </span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{proj.scenario}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color: c }}>{proj.projectedRiskScore}%</span>
                  <span style={{ fontSize: 11, color: '#475569' }}>{Math.round(proj.confidenceScore * 100)}% conf.</span>
                </div>
                <div style={{ height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.06)', marginTop: 10 }}>
                  <div style={{ height: '100%', width: `${proj.projectedRiskScore}%`, borderRadius: 999, background: c, transition: 'width 0.5s' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
