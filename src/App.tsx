import React, { useState } from 'react';
import { Mode, DoctorTab, PatientTab, CaregiverTab, Patient, Vitals, LabReport, FullMedication } from './types';
import { INITIAL_PATIENTS, MOCK_LAB_REPORTS } from './mockData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { DoctorDashboard } from './components/doctor/DoctorDashboard';
import { PatientsList } from './components/doctor/PatientsList';
import { NewAssessment } from './components/doctor/NewAssessment';
import { DoctorReports } from './components/doctor/DoctorReports';
import { DoctorAiAssistant } from './components/doctor/DoctorAiAssistant';
import { DoctorSettings } from './components/doctor/DoctorSettings';
import { ClinicalIntelligenceAnalysis } from './components/doctor/ClinicalIntelligenceAnalysis';
import { ClinicalGuidelineEngineDashboard } from './components/doctor/ClinicalGuidelineEngineDashboard';
import { PresentationMode } from './components/demo/PresentationMode';
import { PatientDashboard } from './components/patient/PatientDashboard';
import { MyHealth } from './components/patient/MyHealth';
import { PatientReports } from './components/patient/PatientReports';
import { PatientRecommendations } from './components/patient/PatientRecommendations';
import { PatientHistory } from './components/patient/PatientHistory';
import { PatientProfile } from './components/patient/PatientProfile';
import { PatientEducation } from './components/patient/PatientEducation';
import { PatientAiCompanion } from './components/patient/PatientAiCompanion';
import { CaregiverDashboard } from './components/caregiver/CaregiverDashboard';
import { MedicineManagement } from './components/common/MedicineManagement';
import { AiDailyHealthPlanner } from './components/common/AiDailyHealthPlanner';
import { IndianDietPlanner } from './components/common/IndianDietPlanner';
import { AiFoodScanner } from './components/common/AiFoodScanner';
import { FollowUpIntelligenceEngine } from './components/common/FollowUpIntelligenceEngine';
import { DrugInteractionEngine } from './components/common/DrugInteractionEngine';
import { PopulationHealthAnalytics } from './components/common/PopulationHealthAnalytics';
import { DigitalHealthTwin } from './components/common/DigitalHealthTwin';
import { UploadReportModal } from './components/modals/UploadReportModal';
import { UpdateVitalsModal } from './components/modals/UpdateVitalsModal';
import { AiSummaryModal } from './components/modals/AiSummaryModal';
import { DownloadSummaryModal } from './components/modals/DownloadSummaryModal';
import { LabReportAnalyzerModal } from './components/common/LabReportAnalyzerModal';
import { SmartIntakeChat } from './components/patient/SmartIntakeChat';
import { BluetoothVitalsPortal } from './components/common/BluetoothVitalsPortal';
import { EarlyWarningCommandCenter } from './components/doctor/EarlyWarningCommandCenter';
import { XAIExplanationCard } from './components/doctor/XAIExplanationCard';
import { PatientRegistrationModal } from './components/modals/PatientRegistrationModal';
import { UnifiedInputConsole } from './components/doctor/UnifiedInputConsole';
import { FuturisticMotionBackground } from './components/common/FuturisticMotionBackground';

export default function App() {
  const [mode, setMode] = useState<Mode>('doctor');
  const [doctorTab, setDoctorTab] = useState<DoctorTab>('dashboard');
  const [patientTab, setPatientTab] = useState<PatientTab>('dashboard');
  const [caregiverTab, setCaregiverTab] = useState<CaregiverTab>('overview');

  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [activePatient, setActivePatient] = useState<Patient>(INITIAL_PATIENTS[0]);
  const [reports, setReports] = useState<LabReport[]>(MOCK_LAB_REPORTS);

  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Sync dark class on document element for tailwind dark: selectors
  React.useEffect(() => {
    if (isHighContrast) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isHighContrast]);

  // Modals state
  const [isUploadReportOpen, setIsUploadReportOpen] = useState(false);
  const [isLabAnalyzerOpen, setIsLabAnalyzerOpen] = useState(false);
  const [isUpdateVitalsOpen, setIsUpdateVitalsOpen] = useState(false);
  const [isAiSummaryOpen, setIsAiSummaryOpen] = useState(false);
  const [isDownloadSummaryOpen, setIsDownloadSummaryOpen] = useState(false);
  const [isPatientRegistrationOpen, setIsPatientRegistrationOpen] = useState(false);

  const handleRegisterPatient = (newPatient: Patient) => {
    setPatients((prev) => [newPatient, ...prev]);
    setActivePatient(newPatient);
  };

  const handleApplyAutoFillFromLab = (updatedVitals: Partial<Vitals>, reportSummary: string) => {
    const mergedVitals: Vitals = {
      ...activePatient.vitals,
      ...updatedVitals,
    };

    handleVitalsUpdated(mergedVitals);

    // Add activity log entry
    const newActivity = {
      id: `act-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'lab' as const,
      title: 'Pathology OCR Extraction Auto-Synced',
      description: reportSummary || 'Extracted parameters automatically updated in EHR and 10-Stage CDSS Risk Pipeline.',
      badgeText: 'OCR Auto-Fill',
      badgeType: 'warning' as const,
    };

    const updatedPatient: Patient = {
      ...activePatient,
      vitals: mergedVitals,
      recentActivity: [newActivity, ...activePatient.recentActivity],
    };

    setPatients((prev) => prev.map((p) => (p.id === activePatient.id ? updatedPatient : p)));
    setActivePatient(updatedPatient);
  };

  const handleVitalsUpdated = (newVitals: Vitals) => {
    // Recalculate risk score based on vitals
    const newRiskScore = Math.min(
      99,
      Math.max(10, Math.round(newVitals.hba1c * 8 + newVitals.bpSystolic / 3))
    );
    const newRiskLevel = newRiskScore >= 75 ? 'High' : newRiskScore >= 45 ? 'Moderate' : 'Low';

    const updatedPatient: Patient = {
      ...activePatient,
      vitals: newVitals,
      riskScore: newRiskScore,
      riskLevel: newRiskLevel,
    };

    setPatients((prev) => prev.map((p) => (p.id === activePatient.id ? updatedPatient : p)));
    setActivePatient(updatedPatient);
  };

  const handleReportUploaded = (title: string, category: string) => {
    const newReport: LabReport = {
      id: `rep-${Date.now()}`,
      patientId: activePatient.id,
      patientName: activePatient.name,
      title: title || 'Biomarker Screening Report',
      category: (category as any) || 'Lab Test',
      uploadDate: new Date().toISOString().split('T')[0],
      fileSize: '1.9 MB PDF',
      status: 'Reviewed',
      summary: `Automated extraction complete for ${activePatient.name}. Parameter values updated in longitudinal EHR record.`,
      abnormalItems: [
        { parameter: 'HbA1c', value: `${activePatient.vitals.hba1c} %`, normalRange: '< 5.7 %', severity: activePatient.vitals.hba1c >= 6.5 ? 'High' : 'Normal' },
        { parameter: 'Systolic BP', value: `${activePatient.vitals.bpSystolic} mmHg`, normalRange: '< 120 mmHg', severity: activePatient.vitals.bpSystolic >= 130 ? 'High' : 'Normal' },
      ],
    };

    setReports((prev) => [newReport, ...prev]);
  };

  const handleSaveAssessment = (updatedVitals: Vitals, notes: string) => {
    handleVitalsUpdated(updatedVitals);
    setDoctorTab('dashboard');
  };

  const handleUpdatePatientMedications = (updatedMeds: FullMedication[]) => {
    const updatedPatient: Patient = {
      ...activePatient,
      medications: updatedMeds,
    };
    setPatients((prev) => prev.map((p) => (p.id === activePatient.id ? updatedPatient : p)));
    setActivePatient(updatedPatient);
  };

  const handleUpdateActivePatient = (updatedPatient: Patient) => {
    setActivePatient(updatedPatient);
    setPatients((prev) => prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p)));
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
      isHighContrast
        ? 'bg-[#081A2B] text-white'
        : 'bg-[#F6FAFF] text-[#1B263B] dark:bg-[#081A2B] dark:text-white'
    }`}>
      {/* Top Header */}
      <Header
        mode={mode}
        setMode={setMode}
        activePatient={activePatient}
        setActivePatient={setActivePatient}
        allPatients={patients}
        isHighContrast={isHighContrast}
        setIsHighContrast={setIsHighContrast}
        onOpenPatientRegistration={() => setIsPatientRegistrationOpen(true)}
      />

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar
          mode={mode}
          doctorTab={doctorTab}
          setDoctorTab={setDoctorTab}
          patientTab={patientTab}
          setPatientTab={setPatientTab}
          caregiverTab={caregiverTab}
          setCaregiverTab={setCaregiverTab}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          activePatient={activePatient}
          isHighContrast={isHighContrast}
          onOpenPatientRegistration={() => setIsPatientRegistrationOpen(true)}
        />

        {/* Viewport Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {mode === 'landing' && (
            <LandingPage
              setMode={setMode}
              isHighContrast={isHighContrast}
              onLaunchDemo={() => {
                setMode('doctor');
                setDoctorTab('demo');
              }}
            />
          )}

          {/* DOCTOR MODE VIEWS */}
          {mode === 'doctor' && (
            <>
              {doctorTab === 'demo' && (
                <PresentationMode
                  activePatient={activePatient}
                  setActivePatient={setActivePatient}
                  allPatients={patients}
                  onNavigateToTab={(tab) => setDoctorTab(tab as DoctorTab)}
                />
              )}
              {doctorTab === 'dashboard' && (
                <DoctorDashboard
                  patients={patients}
                  reports={reports}
                  activePatient={activePatient}
                  setActivePatient={setActivePatient}
                  onOpenNewAssessment={() => setDoctorTab('new-assessment')}
                  onOpenUploadReport={() => setIsUploadReportOpen(true)}
                  onOpenAiSummary={() => setIsAiSummaryOpen(true)}
                  onNavigateToPatients={() => setDoctorTab('patients')}
                  onOpenPatientRegistration={() => setIsPatientRegistrationOpen(true)}
                  onNavigateToTab={(tab) => setDoctorTab(tab as DoctorTab)}
                />
              )}

              {doctorTab === 'patients' && (
                <PatientsList
                  patients={patients}
                  activePatient={activePatient}
                  setActivePatient={setActivePatient}
                  onOpenNewAssessment={() => setDoctorTab('new-assessment')}
                  onOpenUploadReport={() => setIsUploadReportOpen(true)}
                  onOpenAiSummary={() => setIsAiSummaryOpen(true)}
                />
              )}

              {doctorTab === 'new-assessment' && (
                <NewAssessment
                  activePatient={activePatient}
                  onSaveAssessment={handleSaveAssessment}
                  onNavigateToAnalysis={() => setDoctorTab('clinical-analysis')}
                  onOpenLabAnalyzer={() => setIsLabAnalyzerOpen(true)}
                  onApplyAutoFillVitals={handleApplyAutoFillFromLab}
                />
              )}

              {doctorTab === 'clinical-analysis' && (
                <ClinicalIntelligenceAnalysis
                  activePatient={activePatient}
                  onNavigateBack={() => setDoctorTab('new-assessment')}
                  onNewAssessment={() => setDoctorTab('new-assessment')}
                />
              )}

              {doctorTab === 'guidelines' && (
                <ClinicalGuidelineEngineDashboard activePatient={activePatient} />
              )}

              {doctorTab === 'medications' && (
                <MedicineManagement
                  mode="doctor"
                  activePatient={activePatient}
                  onUpdatePatientMedications={handleUpdatePatientMedications}
                />
              )}

              {doctorTab === 'health-planner' && (
                <AiDailyHealthPlanner
                  mode="doctor"
                  activePatient={activePatient}
                />
              )}

              {doctorTab === 'diet-planner' && (
                <IndianDietPlanner
                  mode="doctor"
                  activePatient={activePatient}
                />
              )}

              {doctorTab === 'food-scanner' && (
                <AiFoodScanner
                  mode="doctor"
                  activePatient={activePatient}
                />
              )}

              {doctorTab === 'follow-up-engine' && (
                <FollowUpIntelligenceEngine
                  activePatient={activePatient}
                  onUpdatePatient={handleUpdateActivePatient}
                  isDoctorMode={true}
                  isHighContrast={isHighContrast}
                />
              )}

              {doctorTab === 'drug-interaction-engine' && (
                <DrugInteractionEngine
                  activePatient={activePatient}
                  onUpdatePatient={handleUpdateActivePatient}
                  isDoctorMode={true}
                  isHighContrast={isHighContrast}
                />
              )}

              {doctorTab === 'digital-health-twin' && (
                <DigitalHealthTwin
                  activePatient={activePatient}
                  isHighContrast={isHighContrast}
                />
              )}

              {doctorTab === 'population-analytics' && (
                <PopulationHealthAnalytics
                  activePatient={activePatient}
                  isHighContrast={isHighContrast}
                />
              )}

              {doctorTab === 'reports' && (
                <DoctorReports
                  reports={reports}
                  activePatient={activePatient}
                  onOpenUploadReport={() => setIsLabAnalyzerOpen(true)}
                  onOpenAiSummary={() => setIsAiSummaryOpen(true)}
                  onOpenLabAnalyzer={() => setIsLabAnalyzerOpen(true)}
                />
              )}

              {doctorTab === 'ai-assistant' && (
                <DoctorAiAssistant activePatient={activePatient} />
              )}

              {doctorTab === 'bluetooth-vitals' && (
                <BluetoothVitalsPortal activePatient={activePatient} />
              )}

              {doctorTab === 'early-warning' && (
                <EarlyWarningCommandCenter patient={activePatient} />
              )}

              {doctorTab === 'xai-inspector' && (
                <XAIExplanationCard patient={activePatient} />
              )}

              {doctorTab === 'input-console' && (
                <UnifiedInputConsole
                  activePatient={activePatient}
                  onUpdatePatient={handleUpdateActivePatient}
                  onNavigateToTab={(tab) => setDoctorTab(tab as DoctorTab)}
                />
              )}

              {doctorTab === 'settings' && (
                <DoctorSettings
                  isHighContrast={isHighContrast}
                  setIsHighContrast={setIsHighContrast}
                />
              )}
            </>
          )}

          {/* PATIENT MODE VIEWS */}
          {mode === 'patient' && (
            <>
              {patientTab === 'dashboard' && (
                <PatientDashboard
                  activePatient={activePatient}
                  reports={reports}
                  onOpenUploadReport={() => setIsUploadReportOpen(true)}
                  onOpenUpdateVitals={() => setIsUpdateVitalsOpen(true)}
                  onOpenAiSummary={() => setIsAiSummaryOpen(true)}
                  onOpenDownloadSummary={() => setIsDownloadSummaryOpen(true)}
                  onNavigateToTab={(tab) => setPatientTab(tab)}
                />
              )}

              {patientTab === 'smart-intake' && (
                <SmartIntakeChat />
              )}

              {patientTab === 'input-console' && (
                <UnifiedInputConsole
                  activePatient={activePatient}
                  onUpdatePatient={handleUpdateActivePatient}
                  onNavigateToTab={(tab) => setPatientTab(tab as PatientTab)}
                />
              )}

              {patientTab === 'bluetooth-vitals' && (
                <BluetoothVitalsPortal activePatient={activePatient} />
              )}

              {patientTab === 'early-warning' && (
                <EarlyWarningCommandCenter patient={activePatient} />
              )}

              {patientTab === 'xai-inspector' && (
                <XAIExplanationCard patient={activePatient} />
              )}

              {patientTab === 'my-health' && (
                <MyHealth
                  activePatient={activePatient}
                  onOpenUpdateVitals={() => setIsUpdateVitalsOpen(true)}
                />
              )}

              {patientTab === 'ai-companion' && (
                <PatientAiCompanion activePatient={activePatient} />
              )}

              {patientTab === 'medications' && (
                <MedicineManagement
                  mode="patient"
                  activePatient={activePatient}
                  onUpdatePatientMedications={handleUpdatePatientMedications}
                />
              )}

              {patientTab === 'health-planner' && (
                <AiDailyHealthPlanner
                  mode="patient"
                  activePatient={activePatient}
                />
              )}

              {patientTab === 'diet-planner' && (
                <IndianDietPlanner
                  mode="patient"
                  activePatient={activePatient}
                />
              )}

              {patientTab === 'food-scanner' && (
                <AiFoodScanner
                  mode="patient"
                  activePatient={activePatient}
                />
              )}

              {patientTab === 'follow-up-engine' && (
                <FollowUpIntelligenceEngine
                  activePatient={activePatient}
                  onUpdatePatient={handleUpdateActivePatient}
                  isDoctorMode={false}
                  isHighContrast={isHighContrast}
                />
              )}

              {patientTab === 'drug-interaction-engine' && (
                <DrugInteractionEngine
                  activePatient={activePatient}
                  onUpdatePatient={handleUpdateActivePatient}
                  isDoctorMode={false}
                  isHighContrast={isHighContrast}
                />
              )}

              {patientTab === 'digital-health-twin' && (
                <DigitalHealthTwin
                  activePatient={activePatient}
                  isHighContrast={isHighContrast}
                />
              )}

              {patientTab === 'population-analytics' && (
                <PopulationHealthAnalytics
                  activePatient={activePatient}
                  isHighContrast={isHighContrast}
                />
              )}

              {patientTab === 'reports' && (
                <PatientReports
                  reports={reports}
                  activePatient={activePatient}
                  onOpenUploadReport={() => setIsLabAnalyzerOpen(true)}
                  onOpenDownloadSummary={() => setIsDownloadSummaryOpen(true)}
                  onOpenLabAnalyzer={() => setIsLabAnalyzerOpen(true)}
                />
              )}

              {patientTab === 'recommendations' && (
                <PatientRecommendations />
              )}

              {patientTab === 'history' && (
                <PatientHistory activePatient={activePatient} />
              )}

              {patientTab === 'education' && (
                <PatientEducation />
              )}

              {patientTab === 'profile' && (
                <PatientProfile activePatient={activePatient} />
              )}
            </>
          )}

          {/* CAREGIVER MODE VIEWS */}
          {mode === 'caregiver' && (
            <CaregiverDashboard
              activePatient={activePatient}
              caregiverTab={caregiverTab}
              setCaregiverTab={setCaregiverTab}
              isHighContrast={isHighContrast}
              onUpdatePatient={handleUpdateActivePatient}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <UploadReportModal
        isOpen={isUploadReportOpen}
        onClose={() => setIsUploadReportOpen(false)}
        activePatient={activePatient}
        onReportUploaded={handleReportUploaded}
        onLaunchLabAnalyzer={() => {
          setIsUploadReportOpen(false);
          setIsLabAnalyzerOpen(true);
        }}
      />

      <LabReportAnalyzerModal
        isOpen={isLabAnalyzerOpen}
        onClose={() => setIsLabAnalyzerOpen(false)}
        activePatient={activePatient}
        onApplyAutoFill={handleApplyAutoFillFromLab}
      />

      <UpdateVitalsModal
        isOpen={isUpdateVitalsOpen}
        onClose={() => setIsUpdateVitalsOpen(false)}
        activePatient={activePatient}
        onVitalsUpdated={handleVitalsUpdated}
      />

      <AiSummaryModal
        isOpen={isAiSummaryOpen}
        onClose={() => setIsAiSummaryOpen(false)}
        activePatient={activePatient}
      />

      <DownloadSummaryModal
        isOpen={isDownloadSummaryOpen}
        onClose={() => setIsDownloadSummaryOpen(false)}
        activePatient={activePatient}
      />

      <PatientRegistrationModal
        isOpen={isPatientRegistrationOpen}
        onClose={() => setIsPatientRegistrationOpen(false)}
        patients={patients}
        activePatient={activePatient}
        onSelectPatient={setActivePatient}
        onRegisterPatient={handleRegisterPatient}
      />
    </div>
  );
}
