import React, { createContext, useContext, useState } from 'react';
import { DemoPatientBundle, DEMO_PATIENTS } from '@healthsense/clinical-models';

interface PatientContextType {
  activePatientId: string;
  activePatientBundle: DemoPatientBundle;
  selectPatient: (patientId: string) => void;
  availablePatients: { id: string; name: string; age: number; riskTier: string; score: number }[];
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePatientId, setActivePatientId] = useState<string>('patient-diabetes');

  const activePatientBundle = DEMO_PATIENTS[activePatientId] || DEMO_PATIENTS['patient-diabetes'];

  const availablePatients = Object.values(DEMO_PATIENTS).map(b => {
    const birthYear = new Date(b.patient.birthDate).getFullYear();
    const age = new Date().getFullYear() - birthYear;
    return {
      id: b.patient.id,
      name: b.patient.name[0]?.text || 'Unknown',
      age,
      riskTier: b.riskAssessment.overallTier,
      score: b.riskAssessment.overallRiskScore
    };
  });

  const selectPatient = (patientId: string) => {
    if (DEMO_PATIENTS[patientId]) {
      setActivePatientId(patientId);
    }
  };

  return (
    <PatientContext.Provider value={{ activePatientId, activePatientBundle, selectPatient, availablePatients }}>
      {children}
    </PatientContext.Provider>
  );
};

export const usePatient = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatient must be used within a PatientProvider');
  }
  return context;
};
