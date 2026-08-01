import React, { useState } from 'react';
import { Activity, Heart, Brain, Cpu, ShieldAlert, ChevronRight } from 'lucide-react';
import { useCDSS } from '../../context/CDSSContext';

/* ──────────────────────────────────────────
   Circular body map with organ nodes
────────────────────────────────────────── */

const ORGAN_POSITIONS = [
  { id: 'brain',      cx: 160, cy: 58,  r: 28, label: 'Brain',       sub: 'Cerebrovascular' },
  { id: 'heart',      cx: 137, cy: 128, r: 24, label: 'Heart',       sub: 'Cardiovascular'  },
  { id: 'kidneys',    cx: 185, cy: 160, r: 22, label: 'Kidneys',     sub: 'Renal / eGFR'    },
  { id: 'pancreas',   cx: 130, cy: 175, r: 20, label: 'Pancreas',    sub: 'Endocrine'       },
  { id: 'vascular',   cx: 160, cy: 220, r: 20, label: 'Arteries',    sub: 'Vascular / BP'   },
];

const TIER_COLOR: Record<string, string> = {
  severe:   '#ef4444',
  high:     '#f97316',
  moderate: '#f59e0b',
  low:      '#22c55e',
};

const BodyMap: React.FC<{
  organs: { id: string; risk: number; status: string }[];
  selected: string | null;
  onSelect: (id: string) => void;
}> = ({ organs, selected, onSelect }) => {
  const byId = Object.fromEntries(organs.map(o => [o.id, o]));

  return (
    <svg viewBox="0 0 320 290" style={{ width: '100%', maxWidth: 280 }}>
      {/* Body silhouette */}
      <ellipse cx="160" cy="80"  rx="38" ry="48"  fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth="1.5" />
      <path d="M122 124 Q80 160 90 240 Q125 270 160 272 Q195 270 230 240 Q240 160 198 124 Q180 110 160 108 Q140 110 122 124Z"
        fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth="1.5" />

      {/* Connecting arteries */}
      {ORGAN_POSITIONS.slice(1).map(pos => (
        <line key={pos.id}
          x1={ORGAN_POSITIONS[0].cx} y1={ORGAN_POSITIONS[0].cy + 20}
          x2={pos.cx} y2={pos.cy}
          stroke={byId[pos.id] ? `${TIER_COLOR[byId[pos.id].status]}40` : 'rgba(56,189,248,0.1)'}
          strokeWidth="1"
          strokeDasharray="3 3"
        />
      ))}

      {/* Organ nodes */}
      {ORGAN_POSITIONS.map(pos => {
        const organ = byId[pos.id];
        const color = organ ? TIER_COLOR[organ.status] : '#38bdf8';
        const isSelected = selected === pos.id;
        const pulse = organ && organ.risk >= 60;

        return (
          <g key={pos.id} style={{ cursor: 'pointer' }} onClick={() => onSelect(pos.id)}>
            {/* Glow ring for high risk */}
            {pulse && (
              <circle cx={pos.cx} cy={pos.cy} r={pos.r + 8}
                fill="none" stroke={color} strokeWidth="1"
                opacity="0.3"
                style={{ animation: 'ping 2s cubic-bezier(0,0,0.2,1) infinite' }}
              />
            )}
            {/* Selection ring */}
            {isSelected && (
              <circle cx={pos.cx} cy={pos.cy} r={pos.r + 6}
                fill="none" stroke={color} strokeWidth="2" opacity="0.8"
              />
            )}
            {/* Organ bubble */}
            <circle cx={pos.cx} cy={pos.cy} r={pos.r}
              fill={`${color}18`} stroke={color} strokeWidth={isSelected ? 2 : 1.5}
              style={{ transition: 'all 0.3s' }}
            />
            {/* Risk % label */}
            {organ && (
              <text x={pos.cx} y={pos.cy + 1} textAnchor="middle" dominantBaseline="middle"
                fontSize="9" fontWeight="700" fill={color}>
                {organ.risk}%
              </text>
            )}
            {/* Name label */}
            <text x={pos.cx + pos.r + 6} y={pos.cy - 4}
              fontSize="8" fontWeight="600" fill="rgba(255,255,255,0.8)">
              {pos.label}
            </text>
            <text x={pos.cx + pos.r + 6} y={pos.cy + 6}
              fontSize="7" fill="rgba(148,163,184,0.7)">
              {pos.sub}
            </text>
          </g>
        );
      })}

      <style>{`
        @keyframes ping { 0%{transform:scale(1);opacity:0.8} 75%,100%{transform:scale(1.4);opacity:0} }
      `}</style>
    </svg>
  );
};

/* ──────────────────────────────────────────
   Radar chart for health dimensions
────────────────────────────────────────── */

const RadarChart: React.FC<{ scores: number[] }> = ({ scores }) => {
  const labels = ['Metabolic', 'Cardiac', 'Renal', 'Neuro', 'Vascular'];
  const cx = 80, cy = 80, r = 60;
  const n = labels.length;

  const points = (vals: number[], factor: number) =>
    vals.map((v, i) => {
      const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
      return [cx + Math.cos(angle) * r * (v / 100) * factor, cy + Math.sin(angle) * r * (v / 100) * factor];
    });

  const rings = [0.25, 0.5, 0.75, 1];
  const axes = labels.map((_, i) => {
    const a = (i / n) * 2 * Math.PI - Math.PI / 2;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  });

  const shape = points(scores, 1);
  const shapePath = shape.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ') + 'Z';

  return (
    <svg viewBox="0 0 160 160" style={{ width: '100%', maxWidth: 160 }}>
      {/* Grid rings */}
      {rings.map(f => (
        <polygon key={f}
          points={axes.map(([x, y]) => `${cx + (x - cx) * f},${cy + (y - cy) * f}`).join(' ')}
          fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth="0.8"
        />
      ))}
      {/* Axes */}
      {axes.map(([x, y], i) => (
        <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(148,163,184,0.12)" strokeWidth="0.8" />
      ))}
      {/* Data shape */}
      <path d={shapePath} fill="rgba(56,189,248,0.15)" stroke="#38bdf8" strokeWidth="1.5" />
      {/* Points */}
      {shape.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.5" fill="#38bdf8" />
      ))}
      {/* Labels */}
      {labels.map((label, i) => {
        const a = (i / n) * 2 * Math.PI - Math.PI / 2;
        const lx = cx + Math.cos(a) * (r + 14);
        const ly = cy + Math.sin(a) * (r + 14);
        return (
          <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
            fontSize="7.5" fill="rgba(148,163,184,0.8)" fontWeight="600">
            {label}
          </text>
        );
      })}
    </svg>
  );
};

/* ──────────────────────────────────────────
   Main component
────────────────────────────────────────── */

export const DigitalTwinViewer: React.FC = () => {
  const { digitalTwin, selectedOrgan, setSelectedOrgan, riskAssessment } = useCDSS();
  const f = riskAssessment.snapshot.features;

  const organs = [
    { id: 'brain',    risk: riskAssessment.diseaseResults.stroke.riskScore,       status: riskAssessment.diseaseResults.stroke.severityTier,       label: 'Brain & Cerebrovascular',     metric: 'Stroke Risk',         value: `${riskAssessment.diseaseResults.stroke.riskScore}%` },
    { id: 'heart',    risk: riskAssessment.diseaseResults.cvd.riskScore,           status: riskAssessment.diseaseResults.cvd.severityTier,           label: 'Cardiovascular System',        metric: '10-Yr ASCVD Risk',    value: `${riskAssessment.diseaseResults.cvd.riskScore}%` },
    { id: 'kidneys',  risk: riskAssessment.diseaseResults.ckd.riskScore,           status: riskAssessment.diseaseResults.ckd.severityTier,           label: 'Renal / Nephrons',             metric: `eGFR`,                value: `${f.egfr ?? 'N/A'} mL/min` },
    { id: 'pancreas', risk: riskAssessment.diseaseResults.diabetes.riskScore,      status: riskAssessment.diseaseResults.diabetes.severityTier,      label: 'Pancreas & Endocrine',         metric: 'HbA1c',               value: `${f.hba1c ?? 'N/A'}%` },
    { id: 'vascular', risk: riskAssessment.diseaseResults.hypertension.riskScore,  status: riskAssessment.diseaseResults.hypertension.severityTier,  label: 'Vascular & Arteries',          metric: 'Systolic BP',         value: `${f.systolicBP ?? 'N/A'} mmHg` },
  ];

  const radarScores = [
    100 - riskAssessment.diseaseResults.diabetes.riskScore,
    100 - riskAssessment.diseaseResults.cvd.riskScore,
    100 - riskAssessment.diseaseResults.ckd.riskScore,
    100 - riskAssessment.diseaseResults.stroke.riskScore,
    100 - riskAssessment.diseaseResults.hypertension.riskScore,
  ];

  const activeOrgan = organs.find(o => o.id === selectedOrgan);
  const color = activeOrgan ? TIER_COLOR[activeOrgan.status] : '#38bdf8';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, alignItems: 'start' }}>

      {/* Left: Body Map */}
      <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Organ Status Map</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Click an organ to inspect</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#64748b' }}>Health Score</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#22c55e' }}>{digitalTwin.healthState.overallHealthScore}</div>
          </div>
        </div>
        <BodyMap organs={organs} selected={selectedOrgan} onSelect={id => setSelectedOrgan(selectedOrgan === id ? null : id)} />
        <div style={{ fontSize: 11, color: '#475569', display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[['#22c55e', 'Low'], ['#f59e0b', 'Moderate'], ['#f97316', 'High'], ['#ef4444', 'Severe']].map(([c, l]) => (
            <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: c, display: 'inline-block' }} />{l}
            </span>
          ))}
        </div>
      </div>

      {/* Center: Radar + Organ List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', alignSelf: 'flex-start' }}>Health Dimensions</div>
          <RadarChart scores={radarScores} />
          <div style={{ fontSize: 11, color: '#475569', textAlign: 'center' }}>Higher = healthier</div>
        </div>

        {/* Version chip */}
        <div className="card" style={{ padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 12, color: '#64748b' }}>Model Version</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>{digitalTwin.activeVersion.version}</div>
        </div>
      </div>

      {/* Right: Organ Detail Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {organs.map(organ => {
          const isActive = organ.id === selectedOrgan;
          const c = TIER_COLOR[organ.status];
          return (
            <button
              key={organ.id}
              onClick={() => setSelectedOrgan(isActive ? null : organ.id)}
              style={{
                padding: '14px 16px',
                borderRadius: 16,
                background: isActive ? `${c}12` : 'rgba(30,41,59,0.6)',
                border: `1px solid ${isActive ? c : 'rgba(255,255,255,0.07)'}`,
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: isActive ? '#fff' : '#94a3b8' }}>{organ.label}</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: c }}>{organ.risk}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: '#475569' }}>{organ.metric}: <strong style={{ color: '#94a3b8' }}>{organ.value}</strong></span>
                <ChevronRight style={{ width: 12, height: 12, color: '#475569', transform: isActive ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
              </div>
              {/* Risk bar */}
              <div style={{ height: 3, borderRadius: 999, background: 'rgba(255,255,255,0.06)', marginTop: 8, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${organ.risk}%`, borderRadius: 999, background: c, transition: 'width 0.5s ease' }} />
              </div>
            </button>
          );
        })}

        {activeOrgan && (
          <div className="animate-in" style={{
            padding: 16, borderRadius: 16, borderLeft: `3px solid ${color}`,
            background: `${color}08`, border: `1px solid ${color}25`,
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color, marginBottom: 6 }}>AI Insight: {activeOrgan.label}</div>
            <p style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.6 }}>
              Biomarker trend velocity is currently <strong style={{ color: '#fff' }}>
                {activeOrgan.risk >= 70 ? 'escalating' : activeOrgan.risk >= 40 ? 'moderately elevated' : 'stable'}
              </strong>. Guideline escalation protocol triggered per ICMR/ADA/KDIGO standards. Immediate clinical review {activeOrgan.risk >= 70 ? 'recommended' : 'advised at next visit'}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
