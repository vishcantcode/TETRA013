import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { DEMO_PATIENTS, FHIRPatient, FHIRObservation, FHIRCondition, FHIRMedicationRequest } from '@healthsense/clinical-models';
import { ClinicalEngine, UnifiedRiskAssessment } from '@healthsense/clinical-intelligence';
import { ExplainabilityEngine, CompleteExplainabilityReport } from '@healthsense/clinical-explainability';
import { ReferralEngine, ReferralDecision } from '@healthsense/clinical-referrals';
import { EducationEngine, PersonalizedEducationPlan } from '@healthsense/patient-engagement';
import { DigitalTwinEngine, DigitalTwin } from '@healthsense/patient-digital-twin';
import { PopulationAnalyticsEngine, PopulationSnapshot } from '@healthsense/population-health';

export type DemoPatientKey = 'patient-healthy' | 'patient-prediabetes' | 'patient-diabetes' | 'patient-hypertension' | 'patient-ckd' | 'patient-multimorbid';

interface CDSSContextType {
  activePatientKey: DemoPatientKey;
  setActivePatientKey: (key: DemoPatientKey) => void;
  patient: FHIRPatient;
  vitals: FHIRObservation[];
  labs: FHIRObservation[];
  conditions: FHIRCondition[];
  medications: FHIRMedicationRequest[];
  
  // Computed Engine Results
  riskAssessment: UnifiedRiskAssessment;
  explainabilityReport: CompleteExplainabilityReport;
  referralDecision: ReferralDecision;
  educationPlan: PersonalizedEducationPlan;
  digitalTwin: DigitalTwin;
  populationSnapshot: PopulationSnapshot;
  
  // Interactive UI State
  educationLanguage: 'en' | 'hi' | 'gu';
  setEducationLanguage: (lang: 'en' | 'hi' | 'gu') => void;
  selectedOrgan: string | null;
  setSelectedOrgan: (organ: string | null) => void;
  activeGuidelineDrawer: any | null;
  setActiveGuidelineDrawer: (citation: any | null) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  loadDemoProfile: (key: DemoPatientKey) => void;
}

const CDSSContext = createContext<CDSSContextType | undefined>(undefined);

const clinicalEngine = new ClinicalEngine();
const explainabilityEngine = new ExplainabilityEngine();
const referralEngine = new ReferralEngine();
const educationEngine = new EducationEngine();
const digitalTwinEngine = new DigitalTwinEngine();
const populationEngine = new PopulationAnalyticsEngine();

export const CDSSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePatientKey, setActivePatientKey] = useState<DemoPatientKey>('patient-diabetes');
  const [educationLanguage, setEducationLanguage] = useState<'en' | 'hi' | 'gu'>('en');
  const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null);
  const [activeGuidelineDrawer, setActiveGuidelineDrawer] = useState<any | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);

  const activeBundle = DEMO_PATIENTS[activePatientKey];

  // Global Keyboard Shortcut Listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Memoize All Core Engine Evaluations for Performance (Sub-50ms)
  const riskAssessment = useMemo(() => {
    return clinicalEngine.evaluatePatient(
      activeBundle.patient,
      activeBundle.vitals,
      activeBundle.labs,
      activeBundle.conditions,
      [],
      []
    );
  }, [activePatientKey]);

  const explainabilityReport = useMemo(() => {
    return explainabilityEngine.generateReport(riskAssessment);
  }, [riskAssessment]);

  const referralDecision = useMemo(() => {
    return referralEngine.evaluateReferral(riskAssessment, explainabilityReport);
  }, [riskAssessment, explainabilityReport]);

  const educationPlan = useMemo(() => {
    return educationEngine.generateEducationPlan(riskAssessment, explainabilityReport, referralDecision, educationLanguage);
  }, [riskAssessment, explainabilityReport, referralDecision, educationLanguage]);

  const digitalTwin = useMemo(() => {
    return digitalTwinEngine.createDigitalTwin(
      activeBundle.patient,
      activeBundle.vitals,
      activeBundle.labs,
      activeBundle.conditions,
      [],
      []
    );
  }, [activePatientKey]);

  const populationSnapshot = useMemo(() => {
    return populationEngine.generatePopulationSnapshot([digitalTwin]);
  }, [digitalTwin]);

  const loadDemoProfile = (key: DemoPatientKey) => {
    setActivePatientKey(key);
  };

  return (
    <CDSSContext.Provider
      value={{
        activePatientKey,
        setActivePatientKey,
        patient: activeBundle.patient,
        vitals: activeBundle.vitals,
        labs: activeBundle.labs,
        conditions: activeBundle.conditions,
        medications: [],
        riskAssessment,
        explainabilityReport,
        referralDecision,
        educationPlan,
        digitalTwin,
        populationSnapshot,
        educationLanguage,
        setEducationLanguage,
        selectedOrgan,
        setSelectedOrgan,
        activeGuidelineDrawer,
        setActiveGuidelineDrawer,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        loadDemoProfile
      }}
    >
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
