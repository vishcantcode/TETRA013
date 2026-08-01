import React, { useState } from 'react';
import { Sliders, RotateCcw, Wifi, WifiOff, Clock } from 'lucide-react';
import { useCDSS } from '../context/CDSSContext';

export const DemoModeControls: React.FC = () => {
  const { loadDemoProfile, activePatientKey } = useCDSS();
  const [fakeLatencyMs, setFakeLatencyMs] = useState<number>(0);
  const [isOfflineSimulated, setIsOfflineSimulated] = useState<boolean>(false);

  const handleResetDemo = () => {
    localStorage.clear();
    loadDemoProfile('patient-diabetes');
    alert('Demo State Reset to Default (Type 2 Diabetes Patient)');
  };

  return (
    <div className="card p-4 space-y-3 bg-tertiary/70 border-border">
      <div className="flex-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
          <Sliders className="w-4 h-4 text-accent" /> Demo Stability & Latency Controls
        </h4>
        <button className="btn btn-ghost btn-sm text-2xs text-danger flex items-center gap-1" onClick={handleResetDemo}>
          <RotateCcw className="w-3 h-3" /> Reset Demo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="flex items-center justify-between bg-elevated p-2 rounded border border-border">
          <span className="text-secondary flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-accent" /> Simulated Latency:
          </span>
          <div className="flex gap-1">
            {[0, 500, 1500].map((ms) => (
              <button
                key={ms}
                onClick={() => setFakeLatencyMs(ms)}
                className={`px-2 py-0.5 rounded text-2xs ${fakeLatencyMs === ms ? 'bg-accent text-white' : 'bg-tertiary text-secondary'}`}
              >
                {ms}ms
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between bg-elevated p-2 rounded border border-border">
          <span className="text-secondary flex items-center gap-1">
            {isOfflineSimulated ? <WifiOff className="w-3.5 h-3.5 text-warning" /> : <Wifi className="w-3.5 h-3.5 text-success" />}
            Network State:
          </span>
          <button
            onClick={() => setIsOfflineSimulated(!isOfflineSimulated)}
            className={`btn btn-sm text-2xs ${isOfflineSimulated ? 'btn-danger' : 'btn-secondary'}`}
          >
            {isOfflineSimulated ? 'Offline Mode (Local PWA Cache)' : 'Online Connected'}
          </button>
        </div>
      </div>
    </div>
  );
};
