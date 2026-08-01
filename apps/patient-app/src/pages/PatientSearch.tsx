import React, { useState } from 'react';
import { Search, User, Filter, ArrowRight } from 'lucide-react';
import { DEMO_PATIENTS } from '@healthsense/clinical-models';
import { useCDSS, DemoPatientKey } from '../context/CDSSContext';
import { useNavigate } from 'react-router-dom';

export default function PatientSearch() {
  const navigate = useNavigate();
  const { loadDemoProfile } = useCDSS();
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');

  const patientEntries = Object.entries(DEMO_PATIENTS);

  const filtered = patientEntries.filter(([key, bundle]) => {
    const name = (bundle.patient.name[0]?.given?.join(' ') || '') + ' ' + (bundle.patient.name[0]?.family || '');
    const matchesName = name.toLowerCase().includes(searchTerm.toLowerCase()) || key.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesName;
  });

  return (
    <div className="space-y-6 animate-in">
      <div className="flex-between">
        <div>
          <h2 className="text-xl font-extrabold text-white">Patient Search & Directory</h2>
          <p className="text-xs text-secondary">Browse pre-seeded patient profiles, clinical histories, and risk tiers</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/clinician')}>
          Back to Workstation
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="card p-4 flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-secondary absolute left-3 top-3" />
          <input
            type="text"
            className="input pl-9"
            placeholder="Search by patient name, Abha ID, or condition..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-secondary" />
          <select className="select text-xs" value={tierFilter} onChange={(e) => setTierFilter(e.target.value)}>
            <option value="all">All Risk Tiers</option>
            <option value="severe">Severe Risk</option>
            <option value="high">High Risk</option>
            <option value="moderate">Moderate Risk</option>
            <option value="low">Low Risk</option>
          </select>
        </div>
      </div>

      {/* Patient Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filtered.map(([key, bundle]) => {
          const name = (bundle.patient.name[0]?.given?.join(' ') || '') + ' ' + (bundle.patient.name[0]?.family || '');
          const gender = bundle.patient.gender;

          return (
            <div key={key} className="card p-4 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-accent-glow flex items-center justify-center text-accent font-bold text-xs">
                      {name[0]}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{name}</h4>
                      <p className="text-2xs text-secondary">ID: {bundle.patient.id} • {gender}</p>
                    </div>
                  </div>
                  <span className="badge badge-accent uppercase">{key.replace('patient-', '')}</span>
                </div>

                <div className="bg-tertiary p-2 rounded text-xs space-y-1">
                  <div className="text-2xs text-secondary">Recorded Conditions ({bundle.conditions.length})</div>
                  <div className="font-medium text-white">
                    {bundle.conditions.map(c => c.code.text).join(', ') || 'No active conditions'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  loadDemoProfile(key as DemoPatientKey);
                  navigate('/clinician');
                }}
                className="btn btn-secondary btn-sm w-full flex items-center justify-center gap-2 mt-3"
              >
                Inspect Clinical Profile <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
