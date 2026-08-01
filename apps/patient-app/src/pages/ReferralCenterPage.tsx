import React, { useState } from 'react';
import { Stethoscope, FileCode, CheckCircle, AlertCircle } from 'lucide-react';
import { useCDSS } from '../context/CDSSContext';
import { TopNavigation } from '../components/TopNavigation';
import { ReferralCard } from '../components/ui/ReferralCard';

export default function ReferralCenterPage() {
  const { referralDecision } = useCDSS();
  const [selectedFhirRequest, setSelectedFhirRequest] = useState<any | null>(null);

  return (
    <div className="space-y-6 animate-in">
      <TopNavigation />

      <div className="flex-between">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-accent" /> Specialist Referral & Care Orchestration
          </h2>
          <p className="text-xs text-secondary">
            Deterministic specialist routing (Nephrology, Cardiology, Endocrinology, Ophthalmology) with HL7 FHIR ServiceRequest payloads
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-secondary">Overall Urgency:</span>
          <span className={`badge ${referralDecision.overallUrgency === 'Emergency' || referralDecision.overallUrgency === 'Within 24 Hours' ? 'badge-danger' : 'badge-warning'}`}>
            {referralDecision.overallUrgency}
          </span>
        </div>
      </div>

      {!referralDecision.isReferralRequired || referralDecision.referrals.length === 0 ? (
        <div className="card p-8 text-center space-y-3">
          <CheckCircle className="w-10 h-10 text-success mx-auto" />
          <h3 className="text-base font-bold text-white">No Specialist Referral Currently Required</h3>
          <p className="text-xs text-secondary max-w-md mx-auto">{referralDecision.summaryNote}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {referralDecision.referrals.map((item) => (
            <div key={item.id} className="space-y-2">
              <ReferralCard item={item} />
              <button
                className="btn btn-secondary btn-sm w-full flex items-center justify-center gap-2"
                onClick={() => setSelectedFhirRequest(item.fhirServiceRequest)}
              >
                <FileCode className="w-3.5 h-3.5" /> Inspect HL7 FHIR ServiceRequest JSON
              </button>
            </div>
          ))}
        </div>
      )}

      {/* FHIR ServiceRequest Modal */}
      {selectedFhirRequest && (
        <div className="modal-overlay" onClick={() => setSelectedFhirRequest(null)}>
          <div className="modal p-6 space-y-4 max-w-xl w-full slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCode className="w-4 h-4 text-accent" /> HL7 FHIR R4 ServiceRequest Payload
              </h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedFhirRequest(null)}>Close</button>
            </div>
            <pre className="bg-tertiary p-4 rounded-md text-xs text-accent font-mono overflow-x-auto max-h-80">
              {JSON.stringify(selectedFhirRequest, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
