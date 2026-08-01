import React from 'react';
import { Play, Globe, Shield, Search } from 'lucide-react';
import { useCDSS, DemoPatientKey } from '../context/CDSSContext';

export const TopNavigation: React.FC = () => {
  const {
    activePatientKey,
    loadDemoProfile,
    educationLanguage,
    setEducationLanguage,
    setIsCommandPaletteOpen
  } = useCDSS();

  const demoProfiles: { key: DemoPatientKey; label: string }[] = [
    { key: 'patient-healthy', label: 'Healthy Baseline' },
    { key: 'patient-prediabetes', label: 'Prediabetes' },
    { key: 'patient-diabetes', label: 'T2 Diabetes' },
    { key: 'patient-hypertension', label: 'Hypertension' },
    { key: 'patient-ckd', label: 'Stage 3b CKD' },
    { key: 'patient-multimorbid', label: 'Multi-Comorbid' }
  ];

  return (
    <header className="flex-between pb-4 mb-4 border-b border-border">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-accent" />
          <span className="font-bold text-lg text-white tracking-wide">HealthSense AI</span>
          <span className="badge badge-accent text-2xs">CDSS v1.0</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* 1-Click Demo Mode Patient Profile Switcher */}
        <div className="flex items-center gap-1.5 bg-tertiary p-1 rounded-lg border border-border">
          <Play className="w-4 h-4 text-accent ml-1" />
          <span className="text-2xs font-semibold text-secondary uppercase tracking-wider mr-1">Demo Mode:</span>
          {demoProfiles.map((p) => (
            <button
              key={p.key}
              onClick={() => loadDemoProfile(p.key)}
              className={`px-2 py-1 text-xs rounded-md transition-all ${
                activePatientKey === p.key ? 'bg-accent text-white font-medium shadow-sm' : 'text-secondary hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Multilingual Selector */}
        <div className="flex items-center gap-1 bg-tertiary p-1 rounded-lg border border-border">
          <Globe className="w-4 h-4 text-secondary ml-1" />
          <button
            onClick={() => setEducationLanguage('en')}
            className={`px-2 py-0.5 text-xs rounded ${educationLanguage === 'en' ? 'bg-accent text-white' : 'text-secondary'}`}
          >
            EN
          </button>
          <button
            onClick={() => setEducationLanguage('hi')}
            className={`px-2 py-0.5 text-xs rounded ${educationLanguage === 'hi' ? 'bg-accent text-white' : 'text-secondary'}`}
          >
            HI
          </button>
          <button
            onClick={() => setEducationLanguage('gu')}
            className={`px-2 py-0.5 text-xs rounded ${educationLanguage === 'gu' ? 'bg-accent text-white' : 'text-secondary'}`}
          >
            GU
          </button>
        </div>

        {/* Command Palette Trigger */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="btn btn-secondary btn-sm flex items-center gap-1.5 text-xs"
        >
          <Search className="w-3.5 h-3.5" /> Search (Cmd+K)
        </button>
      </div>
    </header>
  );
};
