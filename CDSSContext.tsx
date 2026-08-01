import React, { createContext, useContext, useState } from 'react';
import { IndividualDiseaseRisk } from '@healthsense/clinical-models';

interface CDSSContextType {
  selectedDiseaseRisk: IndividualDiseaseRisk | null;
  setSelectedDiseaseRisk: (risk: IndividualDiseaseRisk | null) => void;
  educationLanguage: 'en' | 'hi' | 'gu';
  setEducationLanguage: (lang: 'en' | 'hi' | 'gu') => void;
}

const CDSSContext = createContext<CDSSContextType | undefined>(undefined);

export const CDSSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedDiseaseRisk, setSelectedDiseaseRisk] = useState<IndividualDiseaseRisk | null>(null);
  const [educationLanguage, setEducationLanguage] = useState<'en' | 'hi' | 'gu'>('en');

  return (
    <CDSSContext.Provider value={{ selectedDiseaseRisk, setSelectedDiseaseRisk, educationLanguage, setEducationLanguage }}>
      {children}
    </CDSSContext.Provider>
  );
};

export const useCDSS = () => {
  const context = useContext(CDSSContext);
  if (!context) {
    throw new Error('useCDSS must be used within a CDSSProvider');
  }
  return context;
};
