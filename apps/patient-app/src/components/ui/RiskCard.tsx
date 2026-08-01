import React from 'react';

export interface RiskCardProps {
  diseaseName: string;
  riskScore: number; // 0-100
  severityTier: 'low' | 'moderate' | 'high' | 'severe';
  confidenceScore?: number;
  onClick?: () => void;
}

export const RiskCard: React.FC<RiskCardProps> = ({
  diseaseName,
  riskScore,
  severityTier,
  confidenceScore = 0.95,
  onClick
}) => {
  const tierColors = {
    low: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', bar: 'bg-emerald-500' },
    moderate: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', bar: 'bg-amber-500' },
    high: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', bar: 'bg-orange-500' },
    severe: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', bar: 'bg-rose-500' }
  };

  const config = tierColors[severityTier];

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl border ${config.bg} ${config.border} cursor-pointer hover:border-slate-500 transition-all duration-200`}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-semibold text-slate-200 text-sm">{diseaseName}</h4>
          <span className={`text-xs font-bold uppercase tracking-wider ${config.text}`}>
            {severityTier} Risk
          </span>
        </div>
        <div className="text-right">
          <span className={`text-2xl font-black ${config.text}`}>{riskScore}%</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-2">
        <div
          className={`h-full ${config.bar} transition-all duration-500`}
          style={{ width: `${Math.min(100, Math.max(5, riskScore))}%` }}
        />
      </div>

      <div className="flex justify-between items-center text-[10px] text-slate-400">
        <span>Confidence: {Math.round(confidenceScore * 100)}%</span>
        <span>Click for SHAP & Citations &rarr;</span>
      </div>
    </div>
  );
};
