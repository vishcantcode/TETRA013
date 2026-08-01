import React from 'react';

interface RiskGaugeProps {
  score: number; // 0 to 100
  title: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ score, title, subtitle, size = 'md' }) => {
  const radius = size === 'sm' ? 36 : size === 'lg' ? 64 : 48;
  const strokeWidth = size === 'sm' ? 7 : size === 'lg' ? 12 : 9;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const colorClass =
    score >= 75 ? '#ef4444' :
    score >= 50 ? '#f59e0b' :
    score >= 25 ? '#3b82f6' : '#10b981';

  const tierBadge =
    score >= 75 ? 'SEVERE' :
    score >= 50 ? 'HIGH' :
    score >= 25 ? 'MODERATE' : 'LOW';

  const badgeBg =
    score >= 75 ? 'rgba(239, 68, 68, 0.15)' :
    score >= 50 ? 'rgba(245, 158, 11, 0.15)' :
    score >= 25 ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)';

  return (
    <div className="flex flex-col items-center justify-center p-3 card" style={{ background: 'var(--bg-glass)', borderRadius: 'var(--radius-lg)' }}>
      <div className="relative flex items-center justify-center">
        <svg width={(radius + strokeWidth) * 2} height={(radius + strokeWidth) * 2} className="transform -rotate-90">
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke="var(--border)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke={colorClass}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-bold" style={{ color: colorClass }}>{score}%</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: badgeBg, color: colorClass }}>
            {tierBadge}
          </span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <h4 className="text-sm font-semibold text-white">{title}</h4>
        {subtitle && <p className="text-xs text-secondary">{subtitle}</p>}
      </div>
    </div>
  );
};
