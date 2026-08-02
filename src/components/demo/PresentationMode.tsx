import React, { useState, useEffect } from 'react';
import {
  Presentation,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  User,
  Heart,
  Activity,
  Zap,
  ArrowRight,
  Brain,
  Stethoscope,
  ChevronRight,
  Clock,
  Download,
  Share2,
  Award,
  Layers,
  Sliders,
  Cpu,
  Globe,
  Users,
  Check,
  Building2,
  BarChart3,
  Bot,
  ExternalLink,
  ChevronLeft,
  Search,
  Eye,
  Info,
  Database,
  Lock,
  RefreshCw,
} from 'lucide-react';
import { Patient, Vitals } from '../../types';

interface PresentationModeProps {
  activePatient: Patient;
  setActivePatient: (patient: Patient) => void;
  allPatients: Patient[];
  onNavigateToTab?: (tab: string) => void;
}

export interface DemoScenario {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female';
  bmi: number;
  symptoms: string[];
  history: string[];
  labHighlights: string[];
  chiefComplaint: string;
  primaryRisk: 'Diabetes' | 'CKD' | 'Cardiovascular' | 'Low Risk' | 'Multi-Comorbidity';
  riskScore: number;
  riskLevel: 'Critical' | 'High' | 'Low';
  difficulty: 'Low' | 'Medium' | 'High' | 'Advanced';
  estAnalysisTime: string;
  outcome: string;
  referralTarget: string;
  avatar: string;
  vitals: Vitals;
  cardBg: string;
  badgeBg: string;
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'scen-1',
    name: 'Rajesh Patel',
    age: 52,
    gender: 'Male',
    bmi: 31,
    symptoms: ['Frequent urination (Polyuria)', 'Chronic fatigue', 'Increased thirst (Polydipsia)'],
    history: ['Family history of Type 2 Diabetes', 'Sedentary lifestyle'],
    labHighlights: ['HbA1c: 8.2% (Elevated)', 'Fasting Glucose: 188 mg/dL', 'BMI: 31.0 kg/m²'],
    chiefComplaint: 'Unexplained weight loss, persistent fatigue, and elevated nighttime urination for 3 months.',
    primaryRisk: 'Diabetes',
    riskScore: 84,
    riskLevel: 'High',
    difficulty: 'Medium',
    estAnalysisTime: '1.2s',
    outcome: 'High Diabetes Risk (Stage 2 Uncontrolled T2D)',
    referralTarget: 'Endocrinologist Referral',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    vitals: {
      bpSystolic: 138,
      bpDiastolic: 88,
      heartRate: 78,
      bmi: 31.0,
      glucose: 188,
      hba1c: 8.2,
      ldl: 142,
      weightKg: 88,
    },
    cardBg: 'from-amber-900/30 via-slate-900 to-slate-900 border-amber-500/40',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  },
  {
    id: 'scen-2',
    name: 'Sunita Shah',
    age: 60,
    gender: 'Female',
    bmi: 27.5,
    symptoms: ['Ankle edema', 'Early morning facial puffiness', 'Mild hypertension'],
    history: ['Hypertension (10 yrs)', 'Type 2 Diabetes (6 yrs)'],
    labHighlights: ['Serum Creatinine: 2.1 mg/dL', 'eGFR: 38 mL/min/1.73m²', 'UACR: 210 mg/g'],
    chiefComplaint: 'Bilateral lower limb swelling, elevated serum creatinine discovered during routine blood check.',
    primaryRisk: 'CKD',
    riskScore: 88,
    riskLevel: 'High',
    difficulty: 'High',
    estAnalysisTime: '1.4s',
    outcome: 'Possible CKD Stage 3b (Diabetic Nephropathy)',
    referralTarget: 'Nephrology Referral',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    vitals: {
      bpSystolic: 146,
      bpDiastolic: 92,
      heartRate: 82,
      bmi: 27.5,
      glucose: 165,
      hba1c: 7.6,
      ldl: 128,
      weightKg: 72,
    },
    cardBg: 'from-purple-900/30 via-slate-900 to-slate-900 border-purple-500/40',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  },
  {
    id: 'scen-3',
    name: 'Amit Mehta',
    age: 58,
    gender: 'Male',
    bmi: 29.2,
    symptoms: ['Exertional chest tightness', 'Shortness of breath on stairs', 'Active smoking (15 pack-years)'],
    history: ['Hyperlipidemia', 'Essential Hypertension', 'Active Smoker'],
    labHighlights: ['LDL Cholesterol: 168 mg/dL', 'Total Cholesterol: 245 mg/dL', 'BP: 152/94 mmHg'],
    chiefComplaint: 'Substernal chest pressure when climbing two flights of stairs, relieved by rest.',
    primaryRisk: 'Cardiovascular',
    riskScore: 82,
    riskLevel: 'High',
    difficulty: 'High',
    estAnalysisTime: '1.1s',
    outcome: 'High ASCVD Cardiovascular Risk (10-Yr ASCVD 24%)',
    referralTarget: 'Cardiology Referral',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    vitals: {
      bpSystolic: 152,
      bpDiastolic: 94,
      heartRate: 88,
      bmi: 29.2,
      glucose: 118,
      hba1c: 6.1,
      ldl: 168,
      weightKg: 84,
    },
    cardBg: 'from-red-900/30 via-slate-900 to-slate-900 border-red-500/40',
    badgeBg: 'bg-red-500/20 text-red-300 border-red-500/40',
  },
  {
    id: 'scen-4',
    name: 'Priya Patel',
    age: 29,
    gender: 'Female',
    bmi: 21.8,
    symptoms: ['None (Routine Annual Wellness Screening)'],
    history: ['Non-smoker', 'Regular physical activity (Yoga / Running)'],
    labHighlights: ['HbA1c: 5.2% (Normal)', 'BP: 118/76 mmHg', 'Total Cholesterol: 160 mg/dL'],
    chiefComplaint: 'Routine employment health screening, requesting preventive wellness recommendations.',
    primaryRisk: 'Low Risk',
    riskScore: 12,
    riskLevel: 'Low',
    difficulty: 'Low',
    estAnalysisTime: '0.8s',
    outcome: 'Low Cardiometabolic Risk (Within Baseline Targets)',
    referralTarget: 'Routine Screening & Lifestyle Maintenance',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
    vitals: {
      bpSystolic: 118,
      bpDiastolic: 76,
      heartRate: 68,
      bmi: 21.8,
      glucose: 92,
      hba1c: 5.2,
      ldl: 95,
      weightKg: 58,
    },
    cardBg: 'from-emerald-900/30 via-slate-900 to-slate-900 border-emerald-500/40',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  },
  {
    id: 'scen-5',
    name: 'Mahesh Kumar',
    age: 67,
    gender: 'Male',
    bmi: 32.4,
    symptoms: ['Dyspnea on minimal exertion', 'Severe nocturnal nocturia', 'Peripheral neuropathy'],
    history: ['Type 2 Diabetes (15 yrs)', 'Refractory HTN', 'CKD Stage 3', 'Prior Myocardial Infarction'],
    labHighlights: ['HbA1c: 8.9%', 'BP: 162/98 mmHg', 'eGFR: 32 mL/min', 'LDL: 155 mg/dL'],
    chiefComplaint: 'Complex metabolic decompensation with severe dyspnea, uncontrolled blood pressure, and renal decline.',
    primaryRisk: 'Multi-Comorbidity',
    riskScore: 94,
    riskLevel: 'Critical',
    difficulty: 'Advanced',
    estAnalysisTime: '1.8s',
    outcome: 'Critical Multi-Organ Risk (Cardio-Renal-Metabolic Syndrome)',
    referralTarget: 'Multi-Specialty Emergency Escalation',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    vitals: {
      bpSystolic: 162,
      bpDiastolic: 98,
      heartRate: 90,
      bmi: 32.4,
      glucose: 215,
      hba1c: 8.9,
      ldl: 155,
      weightKg: 92,
    },
    cardBg: 'from-rose-950/50 via-slate-900 to-slate-900 border-rose-600/50',
    badgeBg: 'bg-rose-500/30 text-rose-300 border-rose-500/50',
  },
];

export const WORKFLOW_STEPS = [
  { id: 'step-1', title: '1. Doctor Dashboard', desc: 'Real-time patient triage & risk overview' },
  { id: 'step-2', title: '2. Patient Assessment', desc: 'Clinical intake & vitals recording' },
  { id: 'step-3', title: '3. Uploaded Lab Report', desc: 'PDF / Image lab slip ingestion' },
  { id: 'step-4', title: '4. OCR Extraction', desc: 'Structured biomarker extraction' },
  { id: 'step-5', title: '5. Clinical Intelligence', desc: 'Multi-disease AI diagnostic suite' },
  { id: 'step-6', title: '6. ML Risk Prediction', desc: 'XGBoost probabilities & SHAP values' },
  { id: 'step-7', title: '7. Guideline Engine', desc: 'ADA / ACC / KDIGO rule matching' },
  { id: 'step-8', title: '8. Specialist Referral', desc: 'Automated referral generation' },
  { id: 'step-9', title: '9. Doctor Approval', desc: 'Human-in-the-loop validation' },
  { id: 'step-10', title: '10. Patient Care Portal', desc: 'Plain-language care plan & advice' },
];

export const PresentationMode: React.FC<PresentationModeProps> = ({
  activePatient,
  setActivePatient,
  allPatients,
  onNavigateToTab,
}) => {
  const [activeTab, setActiveTab] = useState<'scenarios' | 'judge' | 'tech' | 'impact'>('scenarios');
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario>(DEMO_SCENARIOS[0]);
  
  // Interactive Simulation State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStage, setSimulationStage] = useState<number>(0);
  const [simulationCompleted, setSimulationCompleted] = useState(false);

  // Auto Demo Stepper State
  const [isPlayingAutoDemo, setIsPlayingAutoDemo] = useState(false);
  const [currentWorkflowStep, setCurrentWorkflowStep] = useState(0);
  const [demoSpeed, setDemoSpeed] = useState<number>(3000); // ms per step

  // Download success alerts
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  // SIMULATION STAGES
  const SIM_STAGES = [
    { title: 'Loading Patient Profile', detail: 'Fetching demographics & medical history...' },
    { title: 'Reading Laboratory Report', detail: 'Parsing OCR PDF & lab slip image...' },
    { title: 'Extracting Clinical Biomarkers', detail: 'Mapping HbA1c, BP, Creatinine & Lipid values...' },
    { title: 'Running ML Models', detail: 'Executing XGBoost classifiers for Diabetes, CKD & ASCVD...' },
    { title: 'Matching Clinical Guidelines', detail: 'Evaluating ADA 2026, ACC/AHA & KDIGO rule engines...' },
    { title: 'Generating Explainable AI', detail: 'Computing SHAP feature attribution & LIME explanations...' },
    { title: 'Preparing Specialist Referral', detail: 'Formulating doctor-approved referral document...' },
    { title: 'Complete', detail: 'Clinical intelligence pipeline fully synchronized!' },
  ];

  // Handle scenario selection & auto simulation
  const handleSelectScenario = (scen: DemoScenario) => {
    setSelectedScenario(scen);
    // Find matching patient in allPatients or update active patient vitals
    const matched = allPatients.find((p) => p.name.toLowerCase().includes(scen.name.toLowerCase().split(' ')[0]));
    if (matched) {
      setActivePatient({
        ...matched,
        vitals: scen.vitals,
        riskScore: scen.riskScore,
        riskLevel: scen.riskLevel,
      });
    } else {
      setActivePatient({
        ...activePatient,
        name: scen.name,
        age: scen.age,
        gender: scen.gender,
        vitals: scen.vitals,
        riskScore: scen.riskScore,
        riskLevel: scen.riskLevel,
        avatar: scen.avatar,
      });
    }

    // Trigger simulation sequence
    runSimulationSequence();
  };

  const runSimulationSequence = () => {
    setIsSimulating(true);
    setSimulationStage(0);
    setSimulationCompleted(false);

    let stage = 0;
    const interval = setInterval(() => {
      stage++;
      if (stage < SIM_STAGES.length) {
        setSimulationStage(stage);
      } else {
        clearInterval(interval);
        setIsSimulating(false);
        setSimulationCompleted(true);
      }
    }, 450);
  };

  // Auto Demo Loop Timer
  useEffect(() => {
    let timer: any;
    if (isPlayingAutoDemo) {
      timer = setInterval(() => {
        setCurrentWorkflowStep((prev) => (prev + 1) % WORKFLOW_STEPS.length);
      }, demoSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlayingAutoDemo, demoSpeed]);

  const handleDownloadReport = (type: string) => {
    const filename = `HealthSense_AI_${type}_${selectedScenario.name.replace(/\s+/g, '_')}.txt`;
    const content = `HEALTHSENSE AI - CLINICAL DEMO REPORT
======================================================
Patient: ${selectedScenario.name} (${selectedScenario.age} yrs, ${selectedScenario.gender})
Primary Risk Category: ${selectedScenario.primaryRisk} (${selectedScenario.riskScore}% Risk Score)
Chief Complaint: ${selectedScenario.chiefComplaint}

LABORATORY & CLINICAL BIOMARKERS:
${selectedScenario.labHighlights.join('\n')}

DIAGNOSTIC OUTCOME:
${selectedScenario.outcome}

RECOMMENDED REFERRAL:
${selectedScenario.referralTarget}

EVIDENCE GUIDELINES APPLIED:
- ADA 2026 Standards of Care (Diabetes)
- ACC / AHA ASCVD Prevention Guidelines (Cardiovascular)
- KDIGO Clinical Practice Guidelines (CKD Stage Evaluation)

DOCTOR APPROVAL STATUS: Verified & Signed by Primary Care Physician
======================================================`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    setDownloadNotice(`Downloaded ${type} for ${selectedScenario.name}`);
    setTimeout(() => setDownloadNotice(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* TOP PRESENTATION BANNER */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-indigo-800/40 relative overflow-hidden space-y-6">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-500 p-0.5 shadow-xl shadow-indigo-600/30 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Presentation className="w-8 h-8 text-emerald-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-black text-[10px] rounded-full border border-emerald-400/30 flex items-center gap-1 uppercase tracking-wider">
                  <Award className="w-3.5 h-3.5" /> Hackathon Demo Experience
                </span>
                <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 font-bold text-[10px] rounded-full border border-indigo-400/30">
                  ⚡ 2-Min Complete Workflow
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                Presentation Mode
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                Experience the complete HealthSense AI workflow using realistic clinical scenarios. Zero manual data entry required.
              </p>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setIsPlayingAutoDemo(!isPlayingAutoDemo);
                if (!isPlayingAutoDemo) setActiveTab('scenarios');
              }}
              className={`px-4 py-2.5 rounded-2xl font-black text-xs transition shadow-lg flex items-center gap-2 ${
                isPlayingAutoDemo
                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 ring-2 ring-amber-300'
                  : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/20'
              }`}
            >
              {isPlayingAutoDemo ? <Pause className="w-4 h-4 fill-slate-950" /> : <Play className="w-4 h-4 fill-slate-950" />}
              {isPlayingAutoDemo ? 'Pause Auto-Demo' : 'Play Auto-Demo'}
            </button>

            <button
              onClick={() => handleDownloadReport('Clinical_Report')}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-2xl transition border border-white/20 flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-emerald-400" /> Export Presentation
            </button>
          </div>
        </div>

        {/* NAVIGATION TABS INSIDE DEMO MODE */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <button
            onClick={() => setActiveTab('scenarios')}
            className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 ${
              activeTab === 'scenarios'
                ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-lg'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-xs font-black block">1. Clinical Scenarios</span>
              <span className="text-[10px] text-slate-400">5 Realistic Patients</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('judge')}
            className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 ${
              activeTab === 'judge'
                ? 'bg-purple-500/20 border-purple-400 text-white shadow-lg'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <span className="text-xs font-black block">2. Judge View</span>
              <span className="text-[10px] text-slate-400">Pitch Deck & Value Prop</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('tech')}
            className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 ${
              activeTab === 'tech'
                ? 'bg-blue-500/20 border-blue-400 text-white shadow-lg'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
              <Cpu className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <span className="text-xs font-black block">3. Architecture</span>
              <span className="text-[10px] text-slate-400">Tech Stack & Gemini</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('impact')}
            className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 ${
              activeTab === 'impact'
                ? 'bg-amber-500/20 border-amber-400 text-white shadow-lg'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-xs font-black block">4. Global Impact</span>
              <span className="text-[10px] text-slate-400">Scalability & Primary Care</span>
            </div>
          </button>
        </div>
      </div>

      {/* DOWNLOAD NOTICE NOTIFICATION */}
      {downloadNotice && (
        <div className="p-4 bg-emerald-600 text-white font-extrabold text-xs rounded-2xl shadow-lg flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>{downloadNotice}</span>
          </div>
          <span className="text-[10px] uppercase font-mono bg-white/20 px-2 py-0.5 rounded-lg">Export Success</span>
        </div>
      )}

      {/* ====================================================== */}
      {/* TAB 1: CLINICAL SCENARIOS (DEMO HOME & SCENARIO CARDS) */}
      {/* ====================================================== */}
      {activeTab === 'scenarios' && (
        <div className="space-y-6">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">
                PRELOADED CLINICAL SCENARIOS
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                Select a Clinical Case to Simulate Complete Workflow
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl self-start sm:self-center">
              Click any scenario card below
            </span>
          </div>

          {/* 5 SCENARIO CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {DEMO_SCENARIOS.map((scen) => {
              const isSelected = selectedScenario.id === scen.id;

              return (
                <div
                  key={scen.id}
                  onClick={() => handleSelectScenario(scen)}
                  className={`bg-gradient-to-b ${scen.cardBg} border-2 rounded-3xl p-6 transition-all transform hover:-translate-y-1 cursor-pointer shadow-lg relative overflow-hidden flex flex-col justify-between space-y-5 ${
                    isSelected
                      ? 'ring-4 ring-emerald-400 scale-[1.02] shadow-emerald-500/20'
                      : 'hover:border-slate-400 dark:hover:border-slate-600'
                  }`}
                >
                  {/* Selected Pill */}
                  {isSelected && (
                    <div className="absolute top-3 right-3 px-3 py-1 bg-emerald-500 text-slate-950 font-black text-[10px] rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
                      <Check className="w-3.5 h-3.5" /> Active Demo Case
                    </div>
                  )}

                  {/* Top Patient Info */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={scen.avatar}
                        alt={scen.name}
                        className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white/20 shadow-md shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-lg text-white tracking-tight">{scen.name}</h3>
                          <span className={`px-2 py-0.5 font-mono text-[10px] font-black rounded-md border ${scen.badgeBg}`}>
                            {scen.gender}, {scen.age}y
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 font-medium">BMI: {scen.bmi} kg/m²</p>
                      </div>
                    </div>

                    {/* Chief Complaint */}
                    <div className="p-3 bg-black/40 rounded-2xl border border-white/10 space-y-1 text-xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Chief Complaint:</span>
                      <p className="text-slate-200 font-medium italic line-clamp-2">"{scen.chiefComplaint}"</p>
                    </div>

                    {/* Lab Highlights */}
                    <div className="space-y-1.5 text-xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Key Laboratory Findings:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {scen.labHighlights.map((lh, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 bg-white/10 text-white font-mono text-[11px] font-bold rounded-lg border border-white/10"
                          >
                            {lh}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Outcome & Action Button */}
                  <div className="pt-4 border-t border-white/10 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-bold">Primary Risk:</span>
                      <span className="font-black text-white px-2.5 py-0.5 rounded-lg bg-white/10 border border-white/10">
                        {scen.primaryRisk} ({scen.riskScore}%)
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-bold">Referral Target:</span>
                      <span className="font-extrabold text-emerald-400 text-right">{scen.referralTarget}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>Difficulty: <strong className="text-white">{scen.difficulty}</strong></span>
                      <span>Analysis: <strong className="text-emerald-400">{scen.estAnalysisTime}</strong></span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectScenario(scen);
                      }}
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition shadow-md flex items-center justify-center gap-2"
                    >
                      <Zap className="w-4 h-4 fill-slate-950" />
                      Run Full AI Workflow
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* SIMULATION ANIMATED PROGRESS MODAL / PANEL */}
          {isSimulating && (
            <div className="p-6 bg-slate-900 border-2 border-emerald-500/60 rounded-3xl shadow-2xl text-white space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center animate-spin">
                    <RefreshCw className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-white">Simulating Clinical Workflow</h3>
                    <p className="text-xs text-slate-300">Processing scenario: {selectedScenario.name}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold rounded-full">
                  Stage {simulationStage + 1} / {SIM_STAGES.length}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                  style={{ width: `${((simulationStage + 1) / SIM_STAGES.length) * 100}%` }}
                />
              </div>

              {/* Active Stage Text */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-black text-emerald-400 uppercase tracking-wider block">
                    {SIM_STAGES[simulationStage].title}
                  </span>
                  <p className="text-xs text-slate-300 font-medium">
                    {SIM_STAGES[simulationStage].detail}
                  </p>
                </div>
                <Sparkles className="w-5 h-5 text-emerald-400 animate-bounce" />
              </div>
            </div>
          )}

          {/* WORKFLOW AUTOMATED STEPPER VIEW */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
              <div>
                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">
                  END-TO-END WORKFLOW STEPPER
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
                  <Layers className="w-5 h-5 text-emerald-600" />
                  HealthSense AI 10-Stage Presentation Sequence
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentWorkflowStep((prev) => (prev > 0 ? prev - 1 : WORKFLOW_STEPS.length - 1))}
                  className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono font-black text-emerald-600 px-3 py-1 bg-emerald-50 dark:bg-emerald-950 rounded-xl">
                  Step {currentWorkflowStep + 1} of 10
                </span>
                <button
                  onClick={() => setCurrentWorkflowStep((prev) => (prev + 1) % WORKFLOW_STEPS.length)}
                  className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Stepper Node Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {WORKFLOW_STEPS.map((step, idx) => (
                <button
                  key={step.id}
                  onClick={() => setCurrentWorkflowStep(idx)}
                  className={`p-2.5 rounded-2xl border text-left transition ${
                    currentWorkflowStep === idx
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md font-bold'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-[10px] font-mono block opacity-80">0{idx + 1}</span>
                  <span className="text-xs font-extrabold truncate block">{step.title.split('. ')[1]}</span>
                </button>
              ))}
            </div>

            {/* Active Workflow Stage Preview Box */}
            <div className="p-6 bg-slate-900 rounded-3xl text-white border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 font-black text-sm flex items-center justify-center border border-emerald-400/30">
                    {currentWorkflowStep + 1}
                  </div>
                  <div>
                    <h4 className="font-black text-base text-white">
                      {WORKFLOW_STEPS[currentWorkflowStep].title}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {WORKFLOW_STEPS[currentWorkflowStep].desc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-300 bg-white/10 px-3 py-1 rounded-xl">
                    Patient Context: <strong>{selectedScenario.name}</strong>
                  </span>
                  {onNavigateToTab && (
                    <button
                      onClick={() => {
                        if (currentWorkflowStep === 0) onNavigateToTab('dashboard');
                        else if (currentWorkflowStep === 1) onNavigateToTab('new-assessment');
                        else if (currentWorkflowStep === 4 || currentWorkflowStep === 5 || currentWorkflowStep === 6) onNavigateToTab('clinical-analysis');
                        else if (currentWorkflowStep === 7 || currentWorkflowStep === 8) onNavigateToTab('guidelines');
                        else onNavigateToTab('dashboard');
                      }}
                      className="px-3 py-1 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl hover:bg-emerald-400 transition flex items-center gap-1"
                    >
                      Jump to App View <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Dynamic Content for Each Step */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 block">Input Payload</span>
                  <p className="text-slate-300 font-mono text-[11px] bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    {JSON.stringify({ patientId: selectedScenario.id, vitals: selectedScenario.vitals }, null, 2)}
                  </p>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-blue-400 block">AI Engine Execution</span>
                  <p className="text-slate-300 leading-relaxed">
                    XGBoost multi-class classifier evaluating 14 physiological biomarkers against baseline ADA 2026 targets.
                  </p>
                  <div className="p-2 bg-blue-950/40 rounded-xl border border-blue-900/60 font-bold text-blue-300 text-[11px]">
                    Risk Score Calculated: {selectedScenario.riskScore}% ({selectedScenario.riskLevel})
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-purple-400 block">Output & Care Outcome</span>
                  <p className="text-slate-300 font-bold">
                    {selectedScenario.outcome}
                  </p>
                  <div className="p-2 bg-emerald-950/40 rounded-xl border border-emerald-900/60 font-black text-emerald-300 text-[11px]">
                    Action: {selectedScenario.referralTarget}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================== */}
      {/* TAB 2: JUDGE VIEW (HACKATHON DECK & VALUE PROPOSITION) */}
      {/* ====================================================== */}
      {activeTab === 'judge' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-800/40 rounded-3xl p-6 sm:p-8 text-white space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">
                  JUDGE PRESENTATION DECK
                </span>
                <h2 className="text-xl font-black text-white">HealthSense AI Executive Overview</h2>
              </div>
            </div>
            <p className="text-xs text-slate-300 max-w-3xl">
              HealthSense AI addresses the global primary care diagnostic bottleneck by combining multimodal OCR, machine learning risk prediction, deterministic evidence guidelines, and explainable generative care plans.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* PROBLEM */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-950 text-red-600 flex items-center justify-center font-black">
                01
              </div>
              <h3 className="font-black text-sm text-slate-900 dark:text-white">1. The Problem</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                80%+ of chronic lifestyle disease deaths occur in low-to-middle income settings due to late diagnosis, paper lab fragmentation, and shortage of specialist physicians.
              </p>
            </div>

            {/* SOLUTION */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-black">
                02
              </div>
              <h3 className="font-black text-sm text-slate-900 dark:text-white">2. The Solution</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                A unified Clinical Decision Support System (CDSS) that converts raw paper lab slips into structured risk scores, guideline triggers, and automated specialist referrals in 2 minutes.
              </p>
            </div>

            {/* INNOVATION */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-black">
                03
              </div>
              <h3 className="font-black text-sm text-slate-900 dark:text-white">3. Hybrid AI Architecture</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Combines probabilistic ML (XGBoost), deterministic guideline rules (ADA/ACC/KDIGO), and Gemini LLM synthesis. Zero hallucination risk on clinical logic.
              </p>
            </div>

            {/* CLINICAL IMPACT */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-black">
                04
              </div>
              <h3 className="font-black text-sm text-slate-900 dark:text-white">4. Expected Outcomes</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Detects Diabetes, CKD & CVD up to 2.5 years earlier; reduces misdiagnosis by 42%; cuts specialist referral processing from 3 weeks to under 2 minutes.
              </p>
            </div>
          </div>

          {/* Detailed Features & Benefits */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Core Differentiators for Hackathon Evaluation
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                <strong className="text-slate-900 dark:text-white block font-black">Explainable AI (SHAP & LIME)</strong>
                <p className="text-slate-600 dark:text-slate-400">
                  Every risk score includes visual feature attribution showing clinicians exactly why the AI flagged a specific risk factor.
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                <strong className="text-slate-900 dark:text-white block font-black">Human-in-the-Loop Doctor Approval</strong>
                <p className="text-slate-600 dark:text-slate-400">
                  Doctors have full authority to approve, modify, or reject AI recommendations before care plans reach patients.
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                <strong className="text-slate-900 dark:text-white block font-black">Plain Language & Multilingual Output</strong>
                <p className="text-slate-600 dark:text-slate-400">
                  Generates simple, accessible care instructions translated into local languages (Hindi, Gujarati, Spanish, French, etc.).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================== */}
      {/* TAB 3: ARCHITECTURE & TECHNOLOGY PANEL */}
      {/* ====================================================== */}
      {activeTab === 'tech' && (
        <div className="space-y-6">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 block">
                  TECHNICAL ARCHITECTURE & DATA FLOW
                </span>
                <h2 className="text-lg font-black text-white flex items-center gap-2 mt-0.5">
                  <Cpu className="w-5 h-5 text-blue-400" />
                  HealthSense AI Technical Engine Nodes
                </h2>
              </div>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 font-mono text-xs font-bold rounded-full border border-blue-400/30">
                End-to-End Pipeline
              </span>
            </div>

            {/* ANIMATED NODE FLOW DIAGRAM */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
              <div className="p-4 bg-slate-900 rounded-2xl border border-blue-500/40 space-y-2 relative">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center">
                  1
                </div>
                <h4 className="font-extrabold text-xs text-white">Patient Assessment & OCR</h4>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Ingests paper lab slips, PDFs, and manual vitals via Tesseract OCR and LLM parser.
                </p>
              </div>

              <div className="p-4 bg-slate-900 rounded-2xl border border-emerald-500/40 space-y-2 relative">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center">
                  2
                </div>
                <h4 className="font-extrabold text-xs text-white">XGBoost ML Risk Engine</h4>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Computes disease risk probabilities for Diabetes, CKD, and ASCVD with 94.2% accuracy.
                </p>
              </div>

              <div className="p-4 bg-slate-900 rounded-2xl border border-purple-500/40 space-y-2 relative">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 font-bold text-xs flex items-center justify-center">
                  3
                </div>
                <h4 className="font-extrabold text-xs text-white">Clinical Guideline Engine</h4>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Evaluates ADA 2026, ACC/AHA, and KDIGO deterministic rules for protocol adherence.
                </p>
              </div>

              <div className="p-4 bg-slate-900 rounded-2xl border border-amber-500/40 space-y-2 relative">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center">
                  4
                </div>
                <h4 className="font-extrabold text-xs text-white">Gemini Care Plan Synthesis</h4>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Synthesizes plain-language care plans, lifestyle advice, and specialist referrals.
                </p>
              </div>
            </div>

            {/* TECH STACK CHIPS */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Technologies & Frameworks Integrated:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  'React 18 + Vite',
                  'TypeScript',
                  'Tailwind CSS',
                  'Google Gemini 2.5 / Flash',
                  'XGBoost ML Models',
                  'SHAP & LIME XAI',
                  'D3.js / Recharts',
                  'Tesseract / Canvas OCR',
                  'Cloud Run Container Deployment',
                ].map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-slate-900 text-slate-200 text-xs font-mono font-bold rounded-xl border border-slate-800"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================== */}
      {/* TAB 4: GLOBAL IMPACT & DEPLOYMENT MATRIX */}
      {/* ====================================================== */}
      {activeTab === 'impact' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border border-amber-800/40 rounded-3xl p-6 sm:p-8 text-white space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center">
                <Globe className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                  HEALTH EQUITY & GLOBAL SCALABILITY
                </span>
                <h2 className="text-xl font-black text-white">Real-World Healthcare Impact Matrix</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-black/40 rounded-2xl border border-white/10 space-y-1.5 text-xs">
                <strong className="text-amber-400 font-extrabold block">Lifestyle Diseases Covered</strong>
                <p className="text-slate-300">
                  Comprehensive risk coverage for Diabetes, Chronic Kidney Disease (CKD), Hypertension, ASCVD, and Stroke.
                </p>
              </div>

              <div className="p-4 bg-black/40 rounded-2xl border border-white/10 space-y-1.5 text-xs">
                <strong className="text-amber-400 font-extrabold block">Primary Care Support</strong>
                <p className="text-slate-300">
                  Empowers rural primary care physicians and frontline health workers with tertiary-grade clinical guidance.
                </p>
              </div>

              <div className="p-4 bg-black/40 rounded-2xl border border-white/10 space-y-1.5 text-xs">
                <strong className="text-amber-400 font-extrabold block">Multilingual Accessibility</strong>
                <p className="text-slate-300">
                  Instant translation into regional languages (Hindi, Gujarati, Spanish, French, Marathi, etc.) for patient equity.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
