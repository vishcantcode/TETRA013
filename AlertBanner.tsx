import React from 'react';

export interface AlertBannerProps {
  title: string;
  description: string;
  variant?: 'info' | 'warning' | 'danger' | 'success';
  actionText?: string;
  onAction?: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  title,
  description,
  variant = 'warning',
  actionText,
  onAction
}) => {
  const variantStyles = {
    info: 'bg-sky-500/10 border-sky-500/30 text-sky-300',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
    danger: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
  };

  return (
    <div className={`p-4 border rounded-xl flex items-center justify-between gap-4 ${variantStyles[variant]}`}>
      <div>
        <h5 className="font-semibold text-sm mb-0.5">{title}</h5>
        <p className="text-xs opacity-90">{description}</p>
      </div>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 transition"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
