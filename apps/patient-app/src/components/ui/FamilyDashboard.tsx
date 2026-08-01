import React, { useState } from 'react';
import { Users, Heart, ShieldCheck, ChevronRight } from 'lucide-react';
import { useCDSS, DemoPatientKey } from '../../context/CDSSContext';

interface FamilyMember {
  id: string;
  role: 'Father' | 'Mother' | 'Grandmother' | 'Grandfather' | 'Child';
  name: string;
  age: number;
  demoKey: DemoPatientKey;
  healthScore: number;
  status: 'Good' | 'Attention Needed' | 'Critical';
}

export const FamilyDashboard: React.FC = () => {
  const { loadDemoProfile, activePatientKey } = useCDSS();

  const familyMembers: FamilyMember[] = [
    { id: 'f-1', role: 'Father', name: 'Ramesh Patel', age: 54, demoKey: 'patient-diabetes', healthScore: 68, status: 'Attention Needed' },
    { id: 'f-2', role: 'Mother', name: 'Sunita Patel', age: 51, demoKey: 'patient-hypertension', healthScore: 72, status: 'Attention Needed' },
    { id: 'f-3', role: 'Grandmother', name: 'Kashiben Patel', age: 76, demoKey: 'patient-ckd', healthScore: 42, status: 'Critical' },
    { id: 'f-4', role: 'Grandfather', name: 'Manubhai Patel', age: 79, demoKey: 'patient-multimorbid', healthScore: 38, status: 'Critical' },
    { id: 'f-5', role: 'Child', name: 'Aarav Patel', age: 16, demoKey: 'patient-healthy', healthScore: 95, status: 'Good' }
  ];

  return (
    <div className="card p-4 space-y-3">
      <div className="flex-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-accent" />
          <h4 className="text-sm font-bold text-white">Family Health Dashboard</h4>
        </div>
        <span className="badge badge-accent text-2xs">5 Family Members</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {familyMembers.map((member) => {
          const isActive = activePatientKey === member.demoKey;
          const badgeClass =
            member.status === 'Critical' ? 'badge-danger' :
            member.status === 'Attention Needed' ? 'badge-warning' : 'badge-success';

          return (
            <button
              key={member.id}
              onClick={() => loadDemoProfile(member.demoKey)}
              className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all ${
                isActive ? 'border-accent bg-accent-glow' : 'border-border bg-tertiary hover:border-border-hover'
              }`}
            >
              <div className="flex-between w-full">
                <span className="text-2xs font-semibold text-secondary uppercase">{member.role}</span>
                <span className={`badge ${badgeClass}`}>{member.healthScore}%</span>
              </div>
              <div className="mt-2">
                <div className="text-xs font-bold text-white truncate">{member.name}</div>
                <div className="text-2xs text-secondary">{member.age} yrs</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
