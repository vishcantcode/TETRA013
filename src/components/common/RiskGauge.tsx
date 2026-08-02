import React from 'react';
import { TrendingUp, TrendingDown, Minus, ShieldCheck, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';

interface RiskGaugeProps {
  score: number; // 0 to 100
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  confidence?: number; // e.g. 94.2
  trend?: 'up' | 'down' | 'stable';
  deltaText?: string; // e.g. "+5% vs 3 mos ago"
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  showDetails?: boolean;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  score,
  riskLevel,
  confidence = 94.5,
  trend = 'stable',
  deltaText,
  size = 'md',
  label = 'CDSS Risk Index',
  showDetails = true,
}) => {
  // Determine color theme based on risk level
  const getColorScheme = () => {
    switch (riskLevel) {
      case 'Critical':
        return {
          stroke: '#E11D48', // rose-600
          track: '#FFE4E6', // rose-100
          text: 'text-rose-600 dark:text-rose-400',
          badgeBg: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-900',
          gradientFrom: '#E11D48',
          gradientTo: '#9F1239',
        };
      case 'High':
        return {
          stroke: '#EF4444', // red-500
          track: '#FEE2E2', // red-100
          text: 'text-red-600 dark:text-red-400',
          badgeBg: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900',
          gradientFrom: '#EF4444',
          gradientTo: '#B91C1C',
        };
      case 'Moderate':
        return {
          stroke: '#F59E0B', // amber-500
          track: '#FEF3C7', // amber-100
          text: 'text-amber-600 dark:text-amber-400',
          badgeBg: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900',
          gradientFrom: '#F59E0B',
          gradientTo: '#D97706',
        };
      case 'Low':
      default:
        return {
          stroke: '#10B981', // emerald-500
          track: '#D1FAE5', // emerald-100
          text: 'text-emerald-600 dark:text-emerald-400',
          badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900',
          gradientFrom: '#10B981',
          gradientTo: '#047857',
        };
    }
  };

  const theme = getColorScheme();

  // SVG Gauge calculations
  const dimension = size === 'sm' ? 100 : size === 'lg' ? 180 : 140;
  const strokeWidth = size === 'sm' ? 8 : size === 'lg' ? 14 : 11;
  const radius = (dimension - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Arc angle setup (270 degrees gauge)
  const angle = 240; // 240 deg arc
  const arcLength = (angle / 360) * circumference;
  const dashOffset = arcLength - (Math.min(Math.max(score, 0), 100) / 100) * arcLength;

  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 backdrop-blur-sm transition-all hover:border-slate-300 dark:hover:border-slate-600">
      {/* Gauge Container */}
      <div className="relative flex items-center justify-center" style={{ width: dimension, height: dimension }}>
        <svg
          width={dimension}
          height={dimension}
          className="transform -rotate-210"
          style={{ transform: 'rotate(150deg)' }}
        >
          <defs>
            <linearGradient id={`riskGrad-${score}-${riskLevel}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={theme.gradientFrom} />
              <stop offset="100%" stopColor={theme.gradientTo} />
            </linearGradient>
          </defs>

          {/* Background Track */}
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-200 dark:text-slate-700"
            fill="transparent"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />

          {/* Progress Arc */}
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            stroke={`url(#riskGrad-${score}-${riskLevel})`}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`font-black tracking-tight ${size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-2xl'} ${theme.text}`}>
            {score}%
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            {riskLevel}
          </span>
        </div>
      </div>

      {/* Details & Badges */}
      {showDetails && (
        <div className="mt-2 w-full space-y-1.5 text-center">
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${theme.badgeBg} flex items-center gap-1`}>
              {riskLevel === 'Critical' || riskLevel === 'High' ? (
                <AlertTriangle className="w-3 h-3 shrink-0" />
              ) : (
                <CheckCircle2 className="w-3 h-3 shrink-0" />
              )}
              {riskLevel} Risk
            </span>

            {confidence && (
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900 rounded-full text-[10px] font-bold flex items-center gap-0.5">
                <Zap className="w-2.5 h-2.5 text-blue-500" />
                {confidence}% Conf.
              </span>
            )}
          </div>

          {/* Trend & Delta */}
          {(trend || deltaText) && (
            <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              {trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-rose-500" />}
              {trend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />}
              {trend === 'stable' && <Minus className="w-3.5 h-3.5 text-slate-400" />}
              <span>{deltaText || (trend === 'up' ? 'Elevated risk vs prior' : trend === 'down' ? 'Reduced risk vs prior' : 'Stable trajectory')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
