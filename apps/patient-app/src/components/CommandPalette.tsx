import React, { useState } from 'react';
import { Search, X, User, Activity, FileText } from 'lucide-react';
import { useCDSS, DemoPatientKey } from '../context/CDSSContext';
import { DEMO_PATIENTS } from '@healthsense/clinical-models';

export const CommandPalette: React.FC = () => {
  const { isCommandPaletteOpen, setIsCommandPaletteOpen, loadDemoProfile } = useCDSS();
  const [query, setQuery] = useState('');

  if (!isCommandPaletteOpen) return null;

  const filteredPatients = Object.entries(DEMO_PATIENTS).filter(([key, bundle]) =>
    bundle.patient.name[0]?.given?.join(' ').toLowerCase().includes(query.toLowerCase()) ||
    key.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="modal-overlay" onClick={() => setIsCommandPaletteOpen(false)}>
      <div
        className="modal p-4 space-y-4 max-w-lg w-full slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <Search className="w-4 h-4 text-secondary" />
          <input
            type="text"
            className="w-full bg-transparent text-sm text-white focus:outline-none"
            placeholder="Search patients, LOINC codes, clinical guidelines (Cmd + K)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button className="btn btn-ghost btn-sm" onClick={() => setIsCommandPaletteOpen(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          <div className="text-2xs font-semibold text-secondary uppercase tracking-wider">Demo Patient Profiles</div>
          {filteredPatients.map(([key, bundle]) => {
            const name = bundle.patient.name[0]?.given?.join(' ') + ' ' + (bundle.patient.name[0]?.family || '');
            return (
              <button
                key={key}
                onClick={() => {
                  loadDemoProfile(key as DemoPatientKey);
                  setIsCommandPaletteOpen(false);
                }}
                className="w-full text-left p-2 rounded-md hover:bg-tertiary flex-between text-xs transition-all"
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-accent" />
                  <span className="font-semibold text-white">{name}</span>
                </div>
                <span className="badge badge-accent uppercase">{key.replace('patient-', '')}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
