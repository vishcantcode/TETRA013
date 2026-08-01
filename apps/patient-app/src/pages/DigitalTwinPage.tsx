import React, { useState } from 'react';
import { Cpu, Sliders, TrendingUp, Clock, Brain, Activity, Heart, Eye, Footprints, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { useCDSS } from '../context/CDSSContext';
import { TopNavigation } from '../components/TopNavigation';
import { DigitalTwinViewer } from '../components/ui/DigitalTwinViewer';
import { InterventionSimulator } from '@healthsense/patient-digital-twin';
import { api } from '../api';

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
        <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>
          {value > 0 ? '+' : ''}{value} {unit}
        </span>
      </div>
      <div style={{ position: 'relative', height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.08)' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${Math.min(100, Math.max(0, pct))}%`, borderRadius: 999, background: `linear-gradient(90deg, ${color}80, ${color})`, transition: 'width 0.1s' }} />
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
          style={{ position: 'absolute', inset: '-6px 0', width: '100%', opacity: 0, cursor: 'pointer', zIndex: 2, height: 18 }}
        />
        <div style={{ position: 'absolute', top: '50%', left: `${Math.min(100, Math.max(0, pct))}%`, transform: 'translate(-50%, -50%)', width: 14, height: 14, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}`, zIndex: 1, pointerEvents: 'none', transition: 'left 0.1s' }} />
      </div>
    </div>
  );
};

export default function DigitalTwinPage() {
  const { digitalTwin, riskAssessment } = useCDSS();
  const [hba1cDelta, setHba1cDelta] = useState(-1.2);
  const [bpDelta, setBpDelta] = useState(-12);
  const [bmiDelta, setBmiDelta] = useState(-2.5);
  const [adherencePct, setAdherencePct] = useState(90);
  const [exerciseHours, setExerciseHours] = useState(4);
  const [ldlDelta, setLdlDelta] = useState(-20);
  const [quitSmoking, setQuitSmoking] = useState(true);

  // Synchronous calculation
  const sim = InterventionSimulator.simulate(riskAssessment, { hba1cDelta, systolicBPDelta: bpDelta, bmiDelta, quitSmoking });
  const riskDelta = sim.baselineRiskScore - sim.simulatedRiskScore;
  const healthyYearsGained = Number((Math.max(0, riskDelta) * 0.12 + (exerciseHours * 0.35) + (adherencePct > 80 ? 1.5 : 0)).toFixed(1));
  const lifeExpectancyGain = Number((Math.max(0, riskDelta) * 0.15 + (quitSmoking ? 2.8 : 0)).toFixed(1));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }} className="animate-in">
      <TopNavigation />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Cpu style={{ width: 22, height: 22, color: '#38bdf8' }} />
            Patient Digital Twin & What-If Simulator
          </h2>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
            Virtual biological organ map, longitudinal biomarker projections, and healthy years gained analysis
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ padding: '6px 14px', borderRadius: 999, background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)', fontSize: 12, fontWeight: 600, color: '#38bdf8' }}>
            <Activity style={{ width: 12, height: 12, display: 'inline', marginRight: 5 }} />
            Active Version: {digitalTwin.activeVersion.version}
          </span>
        </div>
      </div>

      {/* Organ Map & Health Radar */}
      <DigitalTwinViewer />

      {/* Interactive What-If Intervention Simulator */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Controls */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sliders style={{ width: 16, height: 16, color: '#38bdf8' }} />
            Interactive Intervention Controls
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <SimSlider label="Medication Adherence" unit="%" min={0} max={100} step={5} value={adherencePct} onChange={setAdherencePct} color="#38bdf8" />
            <SimSlider label="HbA1c Target Reduction" unit="%" min={-3.0} max={0} step={0.1} value={hba1cDelta} onChange={setHba1cDelta} color="#818cf8" />
            <SimSlider label="Systolic BP Target Reduction" unit="mmHg" min={-30} max={0} step={2} value={bpDelta} onChange={setBpDelta} color="#22c55e" />
            <SimSlider label="BMI Weight Loss Target" unit="kg/m²" min={-5.0} max={0} step={0.5} value={bmiDelta} onChange={setBmiDelta} color="#f59e0b" />
            <SimSlider label="LDL Cholesterol Reduction" unit="mg/dL" min={-40} max={0} step={5} value={ldlDelta} onChange={setLdlDelta} color="#ec4899" />
            <SimSlider label="Weekly Exercise" unit="hrs/wk" min={0} max={7} step={0.5} value={exerciseHours} onChange={setExerciseHours} color="#34d399" />

            {/* Smoking Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Tobacco & Smoking Cessation</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>Complete tobacco cessation</div>
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

        {/* Simulation Projections */}
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles style={{ width: 16, height: 16, color: '#818cf8' }} />
            Simulated Health & Life Expectancy Output
          </h3>

          {/* Gained Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ padding: 16, borderRadius: 16, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>Healthy Years Gained</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#22c55e', lineHeight: 1 }}>+{healthyYearsGained} yrs</div>
              <div style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>Quality-Adjusted Life Years</div>
            </div>
            <div style={{ padding: 16, borderRadius: 16, background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>Life Expectancy Gain</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#38bdf8', lineHeight: 1 }}>+{lifeExpectancyGain} yrs</div>
              <div style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>Overall Survival Trajectory</div>
            </div>
          </div>

          {/* Big risk shift indicator */}
          <div style={{
            padding: 18, borderRadius: 16, textAlign: 'center',
            background: riskDelta >= 0 ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
            border: `1px solid ${riskDelta >= 0 ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
          }}>
            <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>Simulated Risk Reduction</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: riskDelta >= 0 ? '#22c55e' : '#ef4444', lineHeight: 1 }}>
              {sim.riskReductionPercentage}% Shift
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>
              Baseline Risk: {sim.baselineRiskScore}% → Simulated: {sim.simulatedRiskScore}%
            </div>
          </div>

          <div style={{ padding: 14, borderRadius: 14, background: 'rgba(255,255,255,0.04)', fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
            {sim.clinicalImpactSummary}
          </div>
        </div>
      </div>

      {/* Trajectory Projections Grid */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp style={{ width: 16, height: 16, color: '#38bdf8' }} />
          Multi-Horizon Disease Progression Trajectories
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
          {digitalTwin.projections.map((proj, idx) => {
            const isBad = proj.projectedRiskTier === 'severe' || proj.projectedRiskTier === 'high';
            const c = isBad ? '#ef4444' : '#22c55e';
            return (
              <div key={idx} style={{
                padding: 16, borderRadius: 16,
                background: `${c}08`, border: `1px solid ${c}20`,
                display: 'flex', flexDirection: 'column', gap: 8
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#64748b' }}>{proj.monthsAhead} months ahead</span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: `${c}15`, color: c, textTransform: 'capitalize' }}>
                    {proj.projectedRiskTier}
                  </span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{proj.scenario}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 24, fontWeight: 900, color: c }}>{proj.projectedRiskScore}%</span>
                  <span style={{ fontSize: 11, color: '#64748b' }}>{Math.round(proj.confidenceScore * 100)}% conf.</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
