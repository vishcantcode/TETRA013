import React from 'react';

export interface ClinicalCardProps {
  title: string;
  subtitle?: string;
  badgeText?: string;
  badgeVariant?: 'success' | 'warning' | 'danger' | 'info';
  children: React.ReactNode;
  actionButton?: React.ReactNode;
  className?: string;
}

export const ClinicalCard: React.FC<ClinicalCardProps> = ({
  title,
  subtitle,
  badgeText,
  badgeVariant = 'info',
  children,
  actionButton,
  className = ''
}) => {
  const badgeColors = {
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    info: 'bg-sky-500/10 text-sky-400 border-sky-500/20'
  };

  return (
    <div className={`card p-5 border border-slate-700/50 bg-slate-900/60 backdrop-blur-md rounded-xl shadow-lg ${className}`}>
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            {title}
            {badgeText && (
              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${badgeColors[badgeVariant]}`}>
                {badgeText}
              </span>
            )}
          </h3>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {actionButton && <div>{actionButton}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
};
