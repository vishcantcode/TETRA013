import React from 'react';
import { X, BookOpen, ExternalLink, ShieldCheck } from 'lucide-react';
import { useCDSS } from '../../context/CDSSContext';

export const GuidelineDrawer: React.FC = () => {
  const { activeGuidelineDrawer, setActiveGuidelineDrawer } = useCDSS();

  if (!activeGuidelineDrawer) return null;

  return (
    <div className="modal-overlay" onClick={() => setActiveGuidelineDrawer(null)}>
      <div
        className="modal p-6 space-y-4 max-w-lg w-full slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
      >
        <div className="flex-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-accent" />
            <h3 className="text-base font-bold text-white">Clinical Guideline Evidence</h3>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setActiveGuidelineDrawer(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="badge badge-accent">{activeGuidelineDrawer.source}</span>
            <span className="badge badge-info">{activeGuidelineDrawer.evidenceLevel}</span>
          </div>

          <h4 className="text-sm font-semibold text-white">{activeGuidelineDrawer.title}</h4>
          <p className="text-xs text-secondary">Section: <strong className="text-white">{activeGuidelineDrawer.section}</strong></p>

          <div className="explainability-box bg-tertiary p-3 rounded-md">
            <p className="text-xs italic text-secondary">"{activeGuidelineDrawer.clinicalRationale || activeGuidelineDrawer.citationText || 'Clinical Guideline Rule'}"</p>
          </div>

          <div className="flex items-center gap-2 text-xs text-success">
            <ShieldCheck className="w-4 h-4" /> Hard deterministic boundary rule — Clinically Verified.
          </div>

          {activeGuidelineDrawer.url && (
            <a
              href={activeGuidelineDrawer.url}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary btn-sm w-full flex items-center justify-center gap-2"
            >
              View Official Reference <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
