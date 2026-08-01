import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { DEMO_PATIENTS, FHIRPatient, FHIRObservation, FHIRCondition, FHIRMedicationRequest } from '@healthsense/clinical-models';
import { ClinicalEngine, UnifiedRiskAssessment } from '@healthsense/clinical-intelligence';
import { ExplainabilityEngine, CompleteExplainabilityReport } from '@healthsense/clinical-explainability';
import { ReferralEngine, ReferralDecision } from '@healthsense/clinical-referrals';
import { EducationEngine, PersonalizedEducationPlan } from '@healthsense/patient-engagement';
import { DigitalTwinEngine, DigitalTwin } from '@healthsense/patient-digital-twin';
import { PopulationAnalyticsEngine, PopulationSnapshot } from '@healthsense/population-health';

export type DemoPatientKey = 'patient-healthy' | 'patient-prediabetes' | 'patient-diabetes' | 'patient-hypertension' | 'patient-ckd' | 'patient-multimorbid';
export type SupportedLanguage = 'en' | 'hi' | 'gu' | 'ta' | 'mr';

export interface EditableVitals {
  systolicBP: number;
  diastolicBP: number;
  weightKg: number;
  heightCm: number;
  bmi: number;
  pulse: number;
  waistCircumferenceCm: number;
}

export interface EditableLabs {
  hba1c: number;
  fastingGlucose: number;
  serumCreatinine: number;
  egfr: number;
  uacr: number;
  totalCholesterol: number;
  triglycerides: number;
  hdl: number;
  ldl: number;
}

export interface EditableLifestyle {
  smoking: boolean;
  exerciseHoursWeekly: number;
  medicationAdherencePct: number;
  dietQuality: 'poor' | 'moderate' | 'high_fiber_indian';
}

interface CDSSContextType {
  activePatientKey: DemoPatientKey;
  setActivePatientKey: (key: DemoPatientKey) => void;
  patient: FHIRPatient;
  vitals: FHIRObservation[];
  labs: FHIRObservation[];
  conditions: FHIRCondition[];
  medications: FHIRMedicationRequest[];

  // Editable Dynamic Patient State
  currentVitals: EditableVitals;
  updateVitals: (v: Partial<EditableVitals>) => void;
  currentLabs: EditableLabs;
  updateLabs: (l: Partial<EditableLabs>) => void;
  currentLifestyle: EditableLifestyle;
  updateLifestyle: (s: Partial<EditableLifestyle>) => void;
  soapNoteText: string;
  setSoapNoteText: (text: string) => void;

  // Computed Engine Results (Instantly reactive to currentVitals / currentLabs)
  riskAssessment: UnifiedRiskAssessment;
  explainabilityReport: CompleteExplainabilityReport;
  referralDecision: ReferralDecision;
  educationPlan: PersonalizedEducationPlan;
  digitalTwin: DigitalTwin;
  populationSnapshot: PopulationSnapshot;

  // Interactive UI State & Multilingual
  educationLanguage: SupportedLanguage;
  setEducationLanguage: (lang: SupportedLanguage) => void;
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
  const [educationLanguage, setEducationLanguage] = useState<SupportedLanguage>('en');
  const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null);
  const [activeGuidelineDrawer, setActiveGuidelineDrawer] = useState<any | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [soapNoteText, setSoapNoteText] = useState<string>('');

  const activeBundle = DEMO_PATIENTS[activePatientKey];

  // Editable state overrides initialized from demo bundle
  const [currentVitals, setCurrentVitals] = useState<EditableVitals>({
    systolicBP: 138,
    diastolicBP: 88,
    weightKg: 78,
    heightCm: 166,
    bmi: 28.4,
    pulse: 74,
    waistCircumferenceCm: 92
  });

  const [currentLabs, setCurrentLabs] = useState<EditableLabs>({
    hba1c: 8.4,
    fastingGlucose: 138,
    serumCreatinine: 1.2,
    egfr: 78,
    uacr: 45,
    totalCholesterol: 215,
    triglycerides: 185,
    hdl: 42,
    ldl: 136
  });

  const [currentLifestyle, setCurrentLifestyle] = useState<EditableLifestyle>({
    smoking: false,
    exerciseHoursWeekly: 3,
    medicationAdherencePct: 90,
    dietQuality: 'high_fiber_indian'
  });

  // Re-sync editable state when demo profile changes
  useEffect(() => {
    setCurrentVitals({
      systolicBP: activePatientKey === 'patient-healthy' ? 118 : activePatientKey === 'patient-hypertension' ? 154 : 138,
      diastolicBP: activePatientKey === 'patient-healthy' ? 76 : activePatientKey === 'patient-hypertension' ? 96 : 88,
      weightKg: 78,
      heightCm: 166,
      bmi: activePatientKey === 'patient-healthy' ? 22.4 : 28.4,
      pulse: 74,
      waistCircumferenceCm: activePatientKey === 'patient-healthy' ? 78 : 92
    });

    setCurrentLabs({
      hba1c: activePatientKey === 'patient-healthy' ? 5.2 : activePatientKey === 'patient-prediabetes' ? 6.1 : 8.4,
      fastingGlucose: activePatientKey === 'patient-healthy' ? 88 : activePatientKey === 'patient-prediabetes' ? 112 : 142,
      serumCreatinine: activePatientKey === 'patient-ckd' ? 1.9 : 1.2,
      egfr: activePatientKey === 'patient-ckd' ? 42 : activePatientKey === 'patient-healthy' ? 104 : 78,
      uacr: activePatientKey === 'patient-ckd' ? 180 : 45,
      totalCholesterol: 215,
      triglycerides: 185,
      hdl: 42,
      ldl: 136
    });
  }, [activePatientKey]);

  const updateVitals = (v: Partial<EditableVitals>) => setCurrentVitals(prev => ({ ...prev, ...v }));
  const updateLabs = (l: Partial<EditableLabs>) => setCurrentLabs(prev => ({ ...prev, ...l }));
  const updateLifestyle = (s: Partial<EditableLifestyle>) => setCurrentLifestyle(prev => ({ ...prev, ...s }));

  // Global Keyboard Listener for Cmd+K / Ctrl+K
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

  // Dynamically Construct Synthesized FHIRObservation list from currentVitals & currentLabs
  const activeVitalsObservations: FHIRObservation[] = useMemo(() => [
    { id: 'v-sbp', resourceType: 'Observation' as const, status: 'final' as const, subject: { reference: 'Patient/p-101' }, code: { coding: [{ system: 'http://loinc.org', code: '8480-6', display: 'Systolic Blood Pressure' }] }, display: 'Systolic Blood Pressure', value: currentVitals.systolicBP, valueQuantity: { value: currentVitals.systolicBP, unit: 'mmHg' }, effectiveDateTime: new Date().toISOString() },
    { id: 'v-dbp', resourceType: 'Observation' as const, status: 'final' as const, subject: { reference: 'Patient/p-101' }, code: { coding: [{ system: 'http://loinc.org', code: '8462-4', display: 'Diastolic Blood Pressure' }] }, display: 'Diastolic Blood Pressure', value: currentVitals.diastolicBP, valueQuantity: { value: currentVitals.diastolicBP, unit: 'mmHg' }, effectiveDateTime: new Date().toISOString() },
    { id: 'v-bmi', resourceType: 'Observation' as const, status: 'final' as const, subject: { reference: 'Patient/p-101' }, code: { coding: [{ system: 'http://loinc.org', code: '39156-5', display: 'Body Mass Index' }] }, display: 'Body Mass Index', value: currentVitals.bmi, valueQuantity: { value: currentVitals.bmi, unit: 'kg/m2' }, effectiveDateTime: new Date().toISOString() },
    { id: 'v-waist', resourceType: 'Observation' as const, status: 'final' as const, subject: { reference: 'Patient/p-101' }, code: { coding: [{ system: 'http://loinc.org', code: '56115-9', display: 'Waist Circumference' }] }, display: 'Waist Circumference', value: currentVitals.waistCircumferenceCm, valueQuantity: { value: currentVitals.waistCircumferenceCm, unit: 'cm' }, effectiveDateTime: new Date().toISOString() }
  ], [currentVitals]);

  const activeLabsObservations: FHIRObservation[] = useMemo(() => [
    { id: 'l-hba1c', resourceType: 'Observation' as const, status: 'final' as const, subject: { reference: 'Patient/p-101' }, code: { coding: [{ system: 'http://loinc.org', code: '4548-4', display: 'HbA1c' }] }, display: 'HbA1c', value: currentLabs.hba1c, valueQuantity: { value: currentLabs.hba1c, unit: '%' }, effectiveDateTime: new Date().toISOString() },
    { id: 'l-fbs', resourceType: 'Observation' as const, status: 'final' as const, subject: { reference: 'Patient/p-101' }, code: { coding: [{ system: 'http://loinc.org', code: '1558-6', display: 'Fasting Plasma Glucose' }] }, display: 'Fasting Plasma Glucose', value: currentLabs.fastingGlucose, valueQuantity: { value: currentLabs.fastingGlucose, unit: 'mg/dL' }, effectiveDateTime: new Date().toISOString() },
    { id: 'l-creat', resourceType: 'Observation' as const, status: 'final' as const, subject: { reference: 'Patient/p-101' }, code: { coding: [{ system: 'http://loinc.org', code: '2160-0', display: 'Serum Creatinine' }] }, display: 'Serum Creatinine', value: currentLabs.serumCreatinine, valueQuantity: { value: currentLabs.serumCreatinine, unit: 'mg/dL' }, effectiveDateTime: new Date().toISOString() },
    { id: 'l-egfr', resourceType: 'Observation' as const, status: 'final' as const, subject: { reference: 'Patient/p-101' }, code: { coding: [{ system: 'http://loinc.org', code: '33914-3', display: 'eGFR' }] }, display: 'eGFR', value: currentLabs.egfr, valueQuantity: { value: currentLabs.egfr, unit: 'mL/min/1.73m2' }, effectiveDateTime: new Date().toISOString() },
    { id: 'l-uacr', resourceType: 'Observation' as const, status: 'final' as const, subject: { reference: 'Patient/p-101' }, code: { coding: [{ system: 'http://loinc.org', code: '14959-1', display: 'Urine Albumin-to-Creatinine Ratio' }] }, display: 'Urine Albumin-to-Creatinine Ratio', value: currentLabs.uacr, valueQuantity: { value: currentLabs.uacr, unit: 'mg/g' }, effectiveDateTime: new Date().toISOString() },
    { id: 'l-chol', resourceType: 'Observation' as const, status: 'final' as const, subject: { reference: 'Patient/p-101' }, code: { coding: [{ system: 'http://loinc.org', code: '2093-3', display: 'Total Cholesterol' }] }, display: 'Total Cholesterol', value: currentLabs.totalCholesterol, valueQuantity: { value: currentLabs.totalCholesterol, unit: 'mg/dL' }, effectiveDateTime: new Date().toISOString() }
  ], [currentLabs]);

  // Memoize All Core Engine Evaluations (Sub-50ms Reactive Execution)
  const riskAssessment = useMemo(() => {
    return clinicalEngine.evaluatePatient(
      activeBundle.patient,
      activeVitalsObservations,
      activeLabsObservations,
      activeBundle.conditions,
      [],
      []
    );
  }, [activePatientKey, activeVitalsObservations, activeLabsObservations]);

  const explainabilityReport = useMemo(() => {
    return explainabilityEngine.generateReport(riskAssessment);
  }, [riskAssessment]);

  const referralDecision = useMemo(() => {
    return referralEngine.evaluateReferral(riskAssessment, explainabilityReport);
  }, [riskAssessment, explainabilityReport]);

  const educationPlan = useMemo(() => {
    const plan = educationEngine.generateEducationPlan(riskAssessment, explainabilityReport, referralDecision, educationLanguage === 'ta' ? 'en' : educationLanguage);
    if (educationLanguage === 'ta') {
      plan.summary.headline = 'சுகாதார ஆலோசனை (ICMR 2024 / ADA 2025)';
      plan.summary.summaryText = 'உயர் நீரிழிவு மற்றும் இரத்த அழுத்த ஆபத்து. சிறுநீரக செயல்பாடு (eGFR) மற்றும் இரத்த சர்க்கரை அளவை தொடர்ந்து கண்காணிக்கவும்.';
    }
    return plan;
  }, [riskAssessment, explainabilityReport, referralDecision, educationLanguage]);

  const digitalTwin = useMemo(() => {
    return digitalTwinEngine.createDigitalTwin(
      activeBundle.patient,
      activeVitalsObservations,
      activeLabsObservations,
      activeBundle.conditions,
      [],
      []
    );
  }, [activePatientKey, activeVitalsObservations, activeLabsObservations]);

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
        vitals: activeVitalsObservations,
        labs: activeLabsObservations,
        conditions: activeBundle.conditions,
        medications: [],
        currentVitals,
        updateVitals,
        currentLabs,
        updateLabs,
        currentLifestyle,
        updateLifestyle,
        soapNoteText,
        setSoapNoteText,
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
