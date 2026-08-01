import React from 'react';
import { Stethoscope, Calendar, Share2, FileText, CheckCircle2 } from 'lucide-react';
import { ReferralItem } from '@healthsense/clinical-referrals';

interface ReferralCardProps {
  item: ReferralItem;
  onPreviewPDF?: () => void;
  onWhatsAppShare?: () => void;
}

export const ReferralCard: React.FC<ReferralCardProps> = ({ item, onPreviewPDF, onWhatsAppShare }) => {
  const urgencyClass =
    item.priority.category === 'Emergency' || item.priority.category === 'Within 24 Hours' ? 'badge-danger' :
    item.priority.category === 'Within 48 Hours' || item.priority.category === 'Within 7 Days' ? 'badge-warning' : 'badge-info';

  const defaultShare = () => {
    const text = `HealthSense AI Specialist Referral for ${item.specialty}: Priority ${item.priority.category}. Reason: ${item.reason.primaryDiagnosis}.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="card p-4 space-y-3" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
      <div className="flex-between">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-accent" />
          <h4 className="text-sm font-bold text-white">Referral to {item.specialty}</h4>
        </div>
        <span className={`badge ${urgencyClass}`}>{item.priority.category}</span>
      </div>

      <div className="space-y-1">
        <div className="text-xs font-semibold text-accent">{item.reason.primaryDiagnosis}</div>
        <p className="text-xs text-secondary">{item.reason.clinicalJustification}</p>
      </div>

      <div className="bg-tertiary p-2.5 rounded-md space-y-1.5">
        <span className="text-2xs font-semibold text-secondary uppercase tracking-wider">Prerequisite Investigations Before Visit</span>
        <div className="space-y-1">
          {item.reason.prerequisiteInvestigations.map((inv, idx) => (
            <div key={idx} className="flex items-center gap-1.5 text-xs text-secondary">
              <CheckCircle2 className="w-3.5 h-3.5 text-success" />
              <span>{inv}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-between pt-2 border-t border-border">
        <div className="flex items-center gap-1.5 text-xs text-secondary">
          <Calendar className="w-3.5 h-3.5 text-accent" />
          <span>Recommended Timeframe: {item.priority.recommendedTimeframeDays} Days</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-secondary btn-sm" onClick={onPreviewPDF || (() => alert('FHIR ServiceRequest PDF generated.'))}>
            <FileText className="w-3.5 h-3.5" /> PDF
          </button>
          <button className="btn btn-primary btn-sm" onClick={onWhatsAppShare || defaultShare}>
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
        </div>
      </div>
    </div>
  );
};
