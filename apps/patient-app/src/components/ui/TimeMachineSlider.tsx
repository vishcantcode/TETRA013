import React, { useState } from 'react';
import { Clock, TrendingUp, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';
import { useCDSS } from '../../context/CDSSContext';

export const TimeMachineSlider: React.FC = () => {
  const { riskAssessment, digitalTwin } = useCDSS();
  const [timeHorizon, setTimeHorizon] = useState<number>(0); // 0 = Today, 1 = 6M, 2 = 1Y, 3 = 3Y, 4 = 5Y, 5 = 10Y

  const horizons = [
    { label: 'TODAY', months: 0, multiplier: 1.0 },
    { label: '6 MONTHS', months: 6, multiplier: 1.08 },
    { label: '1 YEAR', months: 12, multiplier: 1.15 },
    { label: '3 YEARS', months: 36, multiplier: 1.28 },
    { label: '5 YEARS', months: 60, multiplier: 1.42 },
    { label: '10 YEARS', months: 120, multiplier: 1.65 }
  ];

  const currentHorizon = horizons[timeHorizon];
  const baselineRisk = riskAssessment.overallRiskScore;

  // Recalculate projected future risk dynamically
  const projectedRisk = Math.min(99, Math.round(baselineRisk * currentHorizon.multiplier));
  const projectedHealthScore = Math.max(1, 100 - projectedRisk);

  return (
    <div className="card p-6 space-y-4 bg-gradient-to-br from-bg-card via-bg-surface to-bg-card border-accent/30 shadow-xl">
      <div className="flex-between border-b border-border pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-accent-glow border border-accent/40 text-accent-cyan">
            <Clock className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              Clinical Time Machine — Predictive Horizon
            </h3>
            <p className="text-xs text-secondary">
              Simulating natural disease progression over time without therapeutic intervention
            </p>
          </div>
        </div>
        <span className="badge badge-accent text-xs font-bold px-3 py-1 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" /> Educational Simulation — Demo Projection
        </span>
      </div>

      {/* Time Horizon Slider Bar */}
      <div className="space-y-3 pt-2">
        <div className="flex-between">
          <span className="text-xs font-semibold text-secondary">Selected Time Horizon:</span>
          <span className="text-sm font-extrabold text-accent-cyan tracking-wider">{currentHorizon.label} ({currentHorizon.months} Months Ahead)</span>
        </div>

        <div className="grid grid-cols-6 gap-1 bg-surface p-1.5 rounded-2xl border border-border">
          {horizons.map((h, idx) => (
            <button
              key={idx}
              onClick={() => setTimeHorizon(idx)}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                timeHorizon === idx
                  ? 'bg-gradient-to-r from-accent to-accent-cyan text-white shadow-md scale-105'
                  : 'text-secondary hover:text-white'
              }`}
            >
              {h.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Projections Output Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="bg-surface p-4 rounded-2xl border border-border space-y-1">
          <div className="text-2xs text-secondary uppercase font-semibold">Projected Overall Health Score</div>
          <div className="text-3xl font-extrabold text-white">{projectedHealthScore} <span className="text-xs font-normal text-secondary">/ 100</span></div>
          <div className="text-2xs text-tertiary">Baseline: {digitalTwin.healthState.overallHealthScore} / 100</div>
        </div>

        <div className="bg-surface p-4 rounded-2xl border border-accent/40 space-y-1">
          <div className="text-2xs text-secondary uppercase font-semibold">Simulated Disease Risk Score</div>
          <div className="text-3xl font-extrabold text-danger">{projectedRisk}%</div>
          <div className="text-2xs text-danger font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +{projectedRisk - baselineRisk}% Shift over baseline
          </div>
        </div>

        <div className="bg-surface p-4 rounded-2xl border border-border space-y-1">
          <div className="text-2xs text-secondary uppercase font-semibold">Organ Deterioration Velocity</div>
          <div className="text-xs font-bold text-warning">
            {timeHorizon === 0 ? 'Stable Baseline' : timeHorizon <= 2 ? 'Moderate Renal Decline' : 'High Vascular Damage'}
          </div>
          <div className="text-2xs text-secondary">Guideline Escalation Required</div>
        </div>
      </div>
    </div>
  );
};
