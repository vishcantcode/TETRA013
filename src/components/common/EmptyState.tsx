import React from 'react';
import { FileBarChart, ClipboardList, Send, FilePlus, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  type: 'reports' | 'assessments' | 'referrals' | 'patients' | 'custom';
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}) => {
  const getDefaultContent = () => {
    switch (type) {
      case 'reports':
        return {
          icon: FileBarChart,
          title: title || 'No Laboratory Reports Uploaded',
          description:
            description ||
            'Upload a PDF or image of the patient lab slip to trigger automated OCR extraction, biomarker analysis, and anomaly detection.',
          actionLabel: actionLabel || 'Upload First Laboratory Report',
          color: 'blue',
        };
      case 'assessments':
        return {
          icon: ClipboardList,
          title: title || 'No Clinical Screening Assessments Saved',
          description:
            description ||
            'Start a new clinical assessment to record vitals, symptoms, and evaluate multi-disease risk indicators in under 2 minutes.',
          actionLabel: actionLabel || 'Start New Patient Assessment',
          color: 'emerald',
        };
      case 'referrals':
        return {
          icon: Send,
          title: title || 'No Specialist Referrals Generated Yet',
          description:
            description ||
            'When CDSS risk scores exceed clinical intervention thresholds, automated specialist referrals (Cardiology, Nephrology, Endocrinology) will appear here for doctor verification.',
          actionLabel: actionLabel || 'Run CDSS Risk Evaluation',
          color: 'amber',
        };
      case 'patients':
      default:
        return {
          icon: Sparkles,
          title: title || 'No Matching Records Found',
          description: description || 'Try adjusting your search query, risk filters, or clear active search constraints.',
          actionLabel: actionLabel || 'Reset Filters',
          color: 'indigo',
        };
    }
  };

  const content = getDefaultContent();
  const IconComponent = content.icon;

  return (
    <div className="p-8 sm:p-12 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-center flex flex-col items-center justify-center max-w-xl mx-auto shadow-sm my-6">
      <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 mb-4 shadow-inner">
        <IconComponent className="w-8 h-8 text-blue-600 dark:text-blue-400" />
      </div>

      <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
        {content.title}
      </h3>

      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md leading-relaxed">
        {content.description}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {onAction && (
          <button
            onClick={onAction}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-blue-600/20 transition flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span>{content.actionLabel}</span>
          </button>
        )}

        {onSecondaryAction && secondaryActionLabel && (
          <button
            onClick={onSecondaryAction}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-2xl transition"
          >
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </div>
  );
};
