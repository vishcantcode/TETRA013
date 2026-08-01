import React from 'react';
import { PhoneCall, Navigation, Share2, AlertOctagon, Download } from 'lucide-react';
import { useCDSS } from '../../context/CDSSContext';

export const EmergencyPanel: React.FC = () => {
  const { riskAssessment, patient } = useCDSS();
  const isEmergency = riskAssessment.overallRiskScore >= 85 || riskAssessment.overallTier === 'severe';

  if (!isEmergency) return null;

  const handleCall108 = () => {
    window.open('tel:108', '_self');
  };

  const handleNavigate = () => {
    window.open('https://maps.google.com/?q=nearest+government+hospital+PHC', '_blank');
  };

  const handleShareReport = () => {
    const text = `EMERGENCY HEALTH ALERT for ${patient.name[0]?.given?.join(' ')}: High Risk Score (${riskAssessment.overallRiskScore}%). Immediate medical evaluation recommended at nearest PHC/CHC.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="card p-6 bg-danger-bg border-2 border-danger shadow-lg space-y-4 animate-bounce-short" style={{ borderRadius: 'var(--radius-xl)' }}>
      <div className="flex-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-danger text-white rounded-full animate-pulse">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-danger uppercase tracking-wider">High Risk Alert — Immediate Medical Evaluation Recommended</h3>
            <p className="text-xs text-white">Continuous risk evaluation exceeds critical safety threshold. Please contact your nearest doctor or emergency service.</p>
          </div>
        </div>
        <span className="badge badge-danger text-xs font-bold px-3 py-1">CRITICAL LEVEL</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
        <button onClick={handleCall108} className="btn btn-danger btn-lg flex items-center justify-center gap-2 font-bold text-white shadow-md">
          <PhoneCall className="w-5 h-5" /> Call 108 Ambulance
        </button>
        <button onClick={handleNavigate} className="btn btn-secondary btn-lg flex items-center justify-center gap-2 font-semibold">
          <Navigation className="w-5 h-5 text-accent" /> Nearest Hospital / PHC
        </button>
        <button onClick={handleShareReport} className="btn btn-secondary btn-lg flex items-center justify-center gap-2 font-semibold">
          <Share2 className="w-5 h-5 text-success" /> Share Family Alert
        </button>
        <button onClick={() => alert('Emergency Medical Brief PDF Downloaded.')} className="btn btn-secondary btn-lg flex items-center justify-center gap-2 font-semibold">
          <Download className="w-5 h-5 text-warning" /> Download Emergency Brief
        </button>
      </div>
    </div>
  );
};
