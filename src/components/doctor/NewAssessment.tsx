import React, { useState, useEffect } from 'react';
import {
  User,
  Activity,
  Stethoscope,
  HeartPulse,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Upload,
  Edit3,
  BrainCircuit,
  Save,
  RefreshCw,
  ShieldAlert,
  Flame,
  Check,
  Plus,
  Trash2,
  FileCheck,
  Heart,
  Pill,
} from 'lucide-react';
import { Patient, Vitals } from '../../types';

interface SymptomDetail {
  id: string;
  name: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  durationValue: number;
  durationUnit: 'Days' | 'Weeks' | 'Months';
}

interface AssessmentFormData {
  // Step 1: Patient Information
  patientName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  patientId: string;
  heightCm: number;
  weightKg: number;
  occupation: string;
  address: string;
  emergencyContact: string;
  bloodGroup: string;
  maritalStatus: string;

  // Step 2: Lifestyle
  smoking: 'Never' | 'Former' | 'Current';
  alcohol: 'Never' | 'Occasionally' | 'Regularly';
  exercise: 'None' | '1–2 Days' | '3–5 Days' | 'Daily';
  diet: 'Vegetarian' | 'Mixed' | 'High Sugar' | 'High Fat';
  sleepHours: number;
  stressLevel: 'Low' | 'Medium' | 'High';

  // Step 3: Symptoms
  selectedSymptoms: SymptomDetail[];
  otherSymptomsText: string;

  // Step 4: Vitals
  bpSystolic: number;
  bpDiastolic: number;
  heartRate: number;
  respiratoryRate: number;
  temperature: number;
  spo2: number;
  waistCircumference: number;
  randomGlucose: number;
  fastingGlucose: number;

  // Step 5: Medical History
  existingConditions: string[];
  familyHistory: string[];
  currentMedications: string;
  drugAllergies: string;
  previousSurgeries: string;

  // Step 6: Laboratory Results
  hba1c: number;
  creatinine: number;
  egfr: number;
  urineAlbumin: number;
  hemoglobin: number;
  totalCholesterol: number;
  hdl: number;
  ldl: number;
  triglycerides: number;
  ecgStatus: 'Normal' | 'Abnormal' | 'Not Available';
  uploadedFile: { name: string; size: string } | null;
  aiExtracted: boolean;
}

interface Props {
  activePatient: Patient;
  onSaveAssessment?: (updatedVitals: Vitals, notes: string) => void;
  onNavigateToAnalysis: () => void;
  onOpenLabAnalyzer?: () => void;
  onApplyAutoFillVitals?: (vitals: Partial<Vitals>, summary: string) => void;
}

const AVAILABLE_SYMPTOMS = [
  'Frequent Urination',
  'Excessive Thirst',
  'Fatigue',
  'Chest Pain',
  'Shortness of Breath',
  'Blurred Vision',
  'Headache',
  'Dizziness',
  'Swelling',
  'Weight Loss',
  'Palpitations',
  'Numbness',
];

const CONDITIONS_LIST = [
  'Diabetes',
  'Hypertension',
  'CKD',
  'Heart Disease',
  'Stroke',
  'Thyroid Disorder',
  'Liver Disease',
  'Asthma',
];

const FAMILY_HISTORY_LIST = ['Diabetes', 'Heart Disease', 'Stroke', 'Hypertension'];

export const NewAssessment: React.FC<Props> = ({
  activePatient,
  onSaveAssessment,
  onNavigateToAnalysis,
  onOpenLabAnalyzer,
  onApplyAutoFillVitals,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<string>('Just now');
  const [isUploading, setIsUploading] = useState(false);

  // Initialize form state with active patient defaults
  const [formData, setFormData] = useState<AssessmentFormData>({
    patientName: activePatient.name || 'John Vance',
    age: activePatient.age || 52,
    gender: (activePatient.gender as any) || 'Male',
    phone: '+1 (555) 234-5678',
    patientId: activePatient.mrn || `PAT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    heightCm: 175,
    weightKg: activePatient.vitals.weightKg || 84,
    occupation: 'Software Engineer',
    address: '742 Evergreen Terrace, San Francisco, CA',
    emergencyContact: 'Sarah Vance (Spouse) - +1 (555) 987-6543',
    bloodGroup: 'O+',
    maritalStatus: 'Married',

    smoking: 'Never',
    alcohol: 'Occasionally',
    exercise: '1–2 Days',
    diet: 'Mixed',
    sleepHours: 7,
    stressLevel: 'Medium',

    selectedSymptoms: [
      { id: 'sym-1', name: 'Excessive Thirst', severity: 'Moderate', durationValue: 3, durationUnit: 'Weeks' },
      { id: 'sym-2', name: 'Fatigue', severity: 'Mild', durationValue: 1, durationUnit: 'Months' },
    ],
    otherSymptomsText: '',

    bpSystolic: activePatient.vitals.bpSystolic || 138,
    bpDiastolic: activePatient.vitals.bpDiastolic || 88,
    heartRate: 78,
    respiratoryRate: 16,
    temperature: 98.6,
    spo2: 98,
    waistCircumference: 92,
    randomGlucose: 162,
    fastingGlucose: activePatient.vitals.glucose || 128,

    existingConditions: activePatient.conditions || ['Hypertension', 'Diabetes'],
    familyHistory: ['Diabetes', 'Hypertension'],
    currentMedications: 'Metformin 500mg BD, Lisinopril 10mg OD',
    drugAllergies: 'Penicillin (Mild Rash)',
    previousSurgeries: 'Appendectomy (2018)',

    hba1c: activePatient.vitals.hba1c || 7.2,
    creatinine: 1.1,
    egfr: 82,
    urineAlbumin: 24,
    hemoglobin: 14.2,
    totalCholesterol: 210,
    hdl: 42,
    ldl: activePatient.vitals.ldl || 135,
    triglycerides: 180,
    ecgStatus: 'Normal',
    uploadedFile: null,
    aiExtracted: false,
  });

  // Calculate BMI dynamically
  const calculatedBmi =
    formData.heightCm > 0
      ? Number((formData.weightKg / Math.pow(formData.heightCm / 100, 2)).toFixed(1))
      : 0;

  const getBmiCategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60' };
    if (bmi < 25) return { label: 'Normal Weight', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60' };
    return { label: 'Obese Range', color: 'text-red-600 bg-red-50 dark:bg-red-950/60' };
  };

  // Auto-save effect timestamp trigger
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setLastAutoSaveTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 15000);
    return () => clearInterval(timer);
  }, [formData]);

  // Handle Symptom Toggle
  const toggleSymptom = (symptomName: string) => {
    const exists = formData.selectedSymptoms.find((s) => s.name === symptomName);
    if (exists) {
      setFormData({
        ...formData,
        selectedSymptoms: formData.selectedSymptoms.filter((s) => s.name !== symptomName),
      });
    } else {
      setFormData({
        ...formData,
        selectedSymptoms: [
          ...formData.selectedSymptoms,
          {
            id: `sym-${Date.now()}`,
            name: symptomName,
            severity: 'Mild',
            durationValue: 1,
            durationUnit: 'Weeks',
          },
        ],
      });
    }
  };

  const updateSymptomDetail = (
    symptomName: string,
    field: 'severity' | 'durationValue' | 'durationUnit',
    value: any
  ) => {
    setFormData({
      ...formData,
      selectedSymptoms: formData.selectedSymptoms.map((s) =>
        s.name === symptomName ? { ...s, [field]: value } : s
      ),
    });
  };

  // Condition toggle
  const toggleCondition = (cond: string) => {
    if (formData.existingConditions.includes(cond)) {
      setFormData({
        ...formData,
        existingConditions: formData.existingConditions.filter((c) => c !== cond),
      });
    } else {
      setFormData({
        ...formData,
        existingConditions: [...formData.existingConditions, cond],
      });
    }
  };

  // Family history toggle
  const toggleFamilyHistory = (item: string) => {
    if (formData.familyHistory.includes(item)) {
      setFormData({
        ...formData,
        familyHistory: formData.familyHistory.filter((f) => f !== item),
      });
    } else {
      setFormData({
        ...formData,
        familyHistory: [...formData.familyHistory, item],
      });
    }
  };

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setTimeout(() => {
        setFormData((prev) => ({
          ...prev,
          uploadedFile: { name: file.name, size: `${(file.size / (1024 * 1024)).toFixed(1)} MB` },
          aiExtracted: true,
          hba1c: 7.4,
          creatinine: 1.2,
          egfr: 78,
          fastingGlucose: 134,
          ldl: 142,
        }));
        setIsUploading(false);
      }, 1200);
    }
  };

  // Missing required fields calculator
  const getMissingFields = () => {
    const missing: string[] = [];
    if (!formData.patientName.trim()) missing.push('Patient Name');
    if (!formData.age || formData.age <= 0) missing.push('Patient Age');
    if (!formData.phone.trim()) missing.push('Phone Number');
    if (!formData.bpSystolic) missing.push('Systolic BP');
    if (!formData.bpDiastolic) missing.push('Diastolic BP');
    if (!formData.fastingGlucose) missing.push('Fasting Glucose');
    if (!formData.hba1c) missing.push('HbA1c');
    return missing;
  };

  const missingFields = getMissingFields();
  const totalFields = 12;
  const completedCount = totalFields - missingFields.length;
  const completionPercentage = Math.round((completedCount / totalFields) * 100);

  // Time remaining estimate
  const estTimeRemainingMins = Math.max(1, Math.ceil((7 - step) * 0.6));

  const stepsList = [
    { num: 1, name: 'Patient Information', icon: User },
    { num: 2, name: 'Lifestyle', icon: Flame },
    { num: 3, name: 'Symptoms', icon: Stethoscope },
    { num: 4, name: 'Vitals', icon: Activity },
    { num: 5, name: 'Medical History', icon: Heart },
    { num: 6, name: 'Laboratory Results', icon: FileText },
    { num: 7, name: 'Review', icon: CheckCircle2 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top EHR Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-full font-bold text-[10px] uppercase tracking-wider">
              EHR Clinical Workflow
            </span>
            <span className="text-xs text-slate-400">Hospital Intake Module</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mt-1">
            New Patient Assessment
          </h1>
          <p className="text-xs text-slate-500">
            Multi-step structured clinical entry & point-of-care disease risk intake wizard
          </p>
        </div>

        {/* Auto-Save & Target Patient Indicator */}
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-800 dark:text-emerald-300 font-semibold text-[11px]">
              Draft Auto-Saved ({lastAutoSaveTime})
            </span>
          </div>

          <button
            onClick={() => {
              setFormData({
                ...formData,
                patientId: `PAT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
              });
            }}
            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-xl transition"
            title="Generate New Patient ID"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modern Horizontal Progress Stepper Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
          <span>
            Step {step} of 7: <strong className="text-blue-600 dark:text-blue-400">{stepsList[step - 1].name}</strong>
          </span>
          <span className="text-slate-500">{completionPercentage}% Intake Complete</span>
        </div>

        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 h-full transition-all duration-300"
            style={{ width: `${(step / 7) * 100}%` }}
          />
        </div>

        {/* Step Tabs Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 pt-1">
          {stepsList.map((s) => {
            const Icon = s.icon;
            const isCurrent = step === s.num;
            const isDone = step > s.num;

            return (
              <button
                key={s.num}
                onClick={() => setStep(s.num as any)}
                className={`px-2 py-1.5 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 transition ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                    : isDone
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                )}
                <span className="truncate">{s.num}. {s.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Form Steps (3 cols) + Desktop Sticky Sidebar (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* LEFT FORM STEP CONTAINER (3 COLUMNS) */}
        <div className="lg:col-span-3 space-y-6">
          {/* STEP 1: PATIENT INFORMATION */}
          {step === 1 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Step 1: Patient Demographics & Identification
                  </h2>
                  <p className="text-xs text-slate-500">
                    Primary patient intake information & biometric baselines
                  </p>
                </div>
                <span className="text-xs text-slate-400 font-mono">ID: {formData.patientId}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Patient Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    placeholder="e.g. Eleanor Vance"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Age (Years) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Biological Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={formData.heightCm}
                    onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={formData.weightKg}
                    onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Live Auto-Calculated BMI Box */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Calculated BMI (Auto-Computed While Typing)
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {calculatedBmi} <span className="text-xs font-normal text-slate-400">kg/m²</span>
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getBmiCategory(calculatedBmi).color}`}>
                      {getBmiCategory(calculatedBmi).label}
                    </span>
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  Formula: weight (kg) / height (m)²
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Occupation
                  </label>
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Blood Group
                  </label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Marital Status
                  </label>
                  <select
                    value={formData.maritalStatus}
                    onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500"
                  >
                    {['Single', 'Married', 'Divorced', 'Widowed'].map((ms) => (
                      <option key={ms} value={ms}>
                        {ms}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 transition"
                >
                  <span>Proceed to Step 2: Lifestyle</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: LIFESTYLE */}
          {step === 2 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-500" />
                  Step 2: Behavioral & Lifestyle Risk Assessment
                </h2>
                <p className="text-xs text-slate-500">
                  Select key physical, dietary, and habit indicators
                </p>
              </div>

              <div className="space-y-5 text-xs">
                {/* Smoking */}
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-2">
                    Smoking Habits
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Never', 'Former', 'Current'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setFormData({ ...formData, smoking: opt as any })}
                        className={`p-3 rounded-2xl border text-center font-bold transition ${
                          formData.smoking === opt
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Alcohol */}
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-2">
                    Alcohol Consumption
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Never', 'Occasionally', 'Regularly'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setFormData({ ...formData, alcohol: opt as any })}
                        className={`p-3 rounded-2xl border text-center font-bold transition ${
                          formData.alcohol === opt
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Exercise */}
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-2">
                    Physical Exercise Frequency
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['None', '1–2 Days', '3–5 Days', 'Daily'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setFormData({ ...formData, exercise: opt as any })}
                        className={`p-3 rounded-2xl border text-center font-bold transition ${
                          formData.exercise === opt
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Diet */}
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-2">
                    Primary Dietary Pattern
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['Vegetarian', 'Mixed', 'High Sugar', 'High Fat'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setFormData({ ...formData, diet: opt as any })}
                        className={`p-3 rounded-2xl border text-center font-bold transition ${
                          formData.diet === opt
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sleep & Stress */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Average Sleep (Hours / Night)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.sleepHours}
                      onChange={(e) => setFormData({ ...formData, sleepHours: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Self-Reported Stress Level
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Low', 'Medium', 'High'].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setFormData({ ...formData, stressLevel: st as any })}
                          className={`py-2.5 rounded-xl border text-center font-bold transition ${
                            formData.stressLevel === st
                              ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl hover:bg-slate-200 transition flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 transition"
                >
                  <span>Proceed to Step 3: Symptoms</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SYMPTOMS */}
          {step === 3 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-emerald-600" />
                  Step 3: Selectable Clinical Symptoms & Severity
                </h2>
                <p className="text-xs text-slate-500">
                  Select active presenting symptoms and specify severity & duration
                </p>
              </div>

              {/* Symptom Selectable Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
                {AVAILABLE_SYMPTOMS.map((symName) => {
                  const isSelected = formData.selectedSymptoms.some((s) => s.name === symName);

                  return (
                    <button
                      key={symName}
                      type="button"
                      onClick={() => toggleSymptom(symName)}
                      className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition ${
                        isSelected
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-md shadow-emerald-500/10'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bold">{symName}</span>
                        {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-2">
                        {isSelected ? 'Selected' : 'Click to add'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Expanded Selected Symptoms Severity/Duration Controls */}
              {formData.selectedSymptoms.length > 0 && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Symptom Severity & Duration Fine-Tuning ({formData.selectedSymptoms.length} Selected)
                  </h3>

                  <div className="space-y-3">
                    {formData.selectedSymptoms.map((sym) => (
                      <div
                        key={sym.name}
                        className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>{sym.name}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          {/* Severity */}
                          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                            {['Mild', 'Moderate', 'Severe'].map((sev) => (
                              <button
                                key={sev}
                                type="button"
                                onClick={() => updateSymptomDetail(sym.name, 'severity', sev)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                                  sym.severity === sev
                                    ? sev === 'Severe'
                                      ? 'bg-red-600 text-white'
                                      : sev === 'Moderate'
                                      ? 'bg-amber-500 text-white'
                                      : 'bg-emerald-600 text-white'
                                    : 'text-slate-500 hover:text-slate-900'
                                }`}
                              >
                                {sev}
                              </button>
                            ))}
                          </div>

                          {/* Duration Value & Unit */}
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              value={sym.durationValue}
                              onChange={(e) =>
                                updateSymptomDetail(sym.name, 'durationValue', Number(e.target.value))
                              }
                              className="w-12 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center font-bold"
                            />
                            <select
                              value={sym.durationUnit}
                              onChange={(e) =>
                                updateSymptomDetail(sym.name, 'durationUnit', e.target.value)
                              }
                              className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                            >
                              <option value="Days">Days</option>
                              <option value="Weeks">Weeks</option>
                              <option value="Months">Months</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Other Symptoms Text Field */}
              <div>
                <label className="block font-semibold text-xs text-slate-700 dark:text-slate-300 mb-1">
                  Other Unlisted Symptoms / Clinical Observations
                </label>
                <textarea
                  rows={2}
                  placeholder="Type any additional reported symptoms or patient complaints..."
                  value={formData.otherSymptomsText}
                  onChange={(e) => setFormData({ ...formData, otherSymptomsText: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl hover:bg-slate-200 transition flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 transition"
                >
                  <span>Proceed to Step 4: Vitals</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: VITALS */}
          {step === 4 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Step 4: Clinical Vitals & Glycemic Parameters
                </h2>
                <p className="text-xs text-slate-500">
                  Point-of-care vital signs with real-time threshold warnings
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                {/* Systolic BP */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Systolic Blood Pressure (mmHg) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.bpSystolic}
                    onChange={(e) => setFormData({ ...formData, bpSystolic: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                  {formData.bpSystolic >= 140 && (
                    <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 mt-1 block">
                      ⚠️ Stage 2 Hypertension Alert (≥ 140 mmHg)
                    </span>
                  )}
                </div>

                {/* Diastolic BP */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Diastolic Blood Pressure (mmHg) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.bpDiastolic}
                    onChange={(e) => setFormData({ ...formData, bpDiastolic: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Heart Rate */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Heart Rate (BPM)
                  </label>
                  <input
                    type="number"
                    value={formData.heartRate}
                    onChange={(e) => setFormData({ ...formData, heartRate: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                  {formData.heartRate > 100 && (
                    <span className="text-[11px] font-bold text-amber-600 mt-1 block">
                      ⚠️ Tachycardia Range (&gt; 100 bpm)
                    </span>
                  )}
                </div>

                {/* Respiratory Rate */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Respiratory Rate (Breaths/min)
                  </label>
                  <input
                    type="number"
                    value={formData.respiratoryRate}
                    onChange={(e) => setFormData({ ...formData, respiratoryRate: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Temperature */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Temperature (°F)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                  {formData.temperature >= 100.4 && (
                    <span className="text-[11px] font-bold text-red-600 mt-1 block">
                      ⚠️ Pyrexia / Fever Flag (≥ 100.4°F)
                    </span>
                  )}
                </div>

                {/* SpO2 */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Oxygen Saturation SpO₂ (%)
                  </label>
                  <input
                    type="number"
                    value={formData.spo2}
                    onChange={(e) => setFormData({ ...formData, spo2: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                  {formData.spo2 < 95 && (
                    <span className="text-[11px] font-bold text-red-600 mt-1 block">
                      ⚠️ Low Oxygen Saturation (&lt; 95%)
                    </span>
                  )}
                </div>

                {/* Waist Circumference */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Waist Circumference (cm)
                  </label>
                  <input
                    type="number"
                    value={formData.waistCircumference}
                    onChange={(e) => setFormData({ ...formData, waistCircumference: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Fasting Glucose */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Fasting Blood Sugar (mg/dL) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.fastingGlucose}
                    onChange={(e) => setFormData({ ...formData, fastingGlucose: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                  {formData.fastingGlucose >= 126 && (
                    <span className="text-[11px] font-bold text-amber-600 mt-1 block">
                      ⚠️ Diabetic Glycemic Threshold (≥ 126 mg/dL)
                    </span>
                  )}
                </div>

                {/* Random Glucose */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Random Blood Sugar (mg/dL)
                  </label>
                  <input
                    type="number"
                    value={formData.randomGlucose}
                    onChange={(e) => setFormData({ ...formData, randomGlucose: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl hover:bg-slate-200 transition flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  onClick={() => setStep(5)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 transition"
                >
                  <span>Proceed to Step 5: Medical History</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: MEDICAL HISTORY */}
          {step === 5 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Heart className="w-5 h-5 text-indigo-600" />
                  Step 5: Existing Medical History & Family Risk
                </h2>
                <p className="text-xs text-slate-500">
                  Toggle preexisting chronic conditions, drug allergies & medications
                </p>
              </div>

              <div className="space-y-5 text-xs">
                {/* Preexisting Conditions Chips */}
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-2">
                    Preexisting Chronic Conditions
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CONDITIONS_LIST.map((cond) => {
                      const isSelected = formData.existingConditions.includes(cond);
                      return (
                        <button
                          key={cond}
                          type="button"
                          onClick={() => toggleCondition(cond)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                          <span>{cond}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Family History Chips */}
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-2">
                    Family Disease History
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {FAMILY_HISTORY_LIST.map((fh) => {
                      const isSelected = formData.familyHistory.includes(fh);
                      return (
                        <button
                          key={fh}
                          type="button"
                          onClick={() => toggleFamilyHistory(fh)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                          <span>{fh}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Current Medications */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Current Prescribed Medications
                  </label>
                  <input
                    type="text"
                    value={formData.currentMedications}
                    onChange={(e) => setFormData({ ...formData, currentMedications: e.target.value })}
                    placeholder="e.g. Metformin 500mg BD, Atorvastatin 20mg OD"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Drug Allergies */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Known Drug Allergies
                  </label>
                  <input
                    type="text"
                    value={formData.drugAllergies}
                    onChange={(e) => setFormData({ ...formData, drugAllergies: e.target.value })}
                    placeholder="e.g. Penicillin, Sulfa drugs, NKDA (No Known Drug Allergies)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Previous Surgeries */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Previous Surgeries & Hospitalizations
                  </label>
                  <input
                    type="text"
                    value={formData.previousSurgeries}
                    onChange={(e) => setFormData({ ...formData, previousSurgeries: e.target.value })}
                    placeholder="e.g. Cholecystectomy (2022), Stent Placement"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setStep(4)}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl hover:bg-slate-200 transition flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  onClick={() => setStep(6)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 transition"
                >
                  <span>Proceed to Step 6: Lab Results</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: LABORATORY RESULTS */}
          {step === 6 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    Step 6: Laboratory Results & ECG Parameters
                  </h2>
                  <p className="text-xs text-slate-500">
                    Manual entry or instant AI extraction from uploaded lab report PDFs/images
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full">
                  AI OCR Enabled
                </span>
              </div>

              {/* Upload Dropzone Area */}
              <div className="space-y-3">
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center bg-slate-50/50 dark:bg-slate-800/40 relative hover:border-emerald-500 transition">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />

                  {isUploading ? (
                    <div className="space-y-2 py-4">
                      <Sparkles className="w-8 h-8 text-emerald-500 mx-auto animate-spin" />
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        AI Optical Character Recognition (OCR) Extracting Biomarkers...
                      </p>
                    </div>
                  ) : formData.uploadedFile ? (
                    <div className="flex items-center justify-center gap-3 py-2 text-emerald-700 dark:text-emerald-300">
                      <FileCheck className="w-6 h-6 text-emerald-500" />
                      <div className="text-left">
                        <p className="text-xs font-bold">{formData.uploadedFile.name} ({formData.uploadedFile.size})</p>
                        <p className="text-[10px] text-emerald-600 font-semibold">
                          ✨ AI auto-extracted HbA1c, Creatinine, eGFR & Fasting Glucose into fields below
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Drag & Drop Lab Report or <span className="text-emerald-600 underline">Browse Files</span>
                        </p>
                        <p className="text-[10px] text-slate-400">Supports PDF, PNG, JPEG. AI will extract values automatically.</p>
                      </div>
                    </div>
                  )}
                </div>

                {onOpenLabAnalyzer && (
                  <button
                    type="button"
                    onClick={onOpenLabAnalyzer}
                    className="w-full py-2.5 px-4 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Open Interactive Split-Screen OCR Pathology Workspace</span>
                  </button>
                )}
              </div>

              {/* Lab Parameters Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    HbA1c (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.hba1c}
                    onChange={(e) => setFormData({ ...formData, hba1c: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                  {formData.hba1c >= 6.5 && (
                    <span className="text-[10px] font-bold text-amber-600 mt-1 block">
                      ⚠️ Diabetes Glycemic Flag (&ge; 6.5%)
                    </span>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Serum Creatinine (mg/dL)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.creatinine}
                    onChange={(e) => setFormData({ ...formData, creatinine: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    eGFR (mL/min/1.73m²)
                  </label>
                  <input
                    type="number"
                    value={formData.egfr}
                    onChange={(e) => setFormData({ ...formData, egfr: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                  {formData.egfr < 60 && (
                    <span className="text-[10px] font-bold text-red-600 mt-1 block">
                      ⚠️ Reduced Kidney Filtration (&lt; 60 eGFR)
                    </span>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Urine Albumin (mg/L)
                  </label>
                  <input
                    type="number"
                    value={formData.urineAlbumin}
                    onChange={(e) => setFormData({ ...formData, urineAlbumin: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Hemoglobin (g/dL)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.hemoglobin}
                    onChange={(e) => setFormData({ ...formData, hemoglobin: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ECG Finding Status
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['Normal', 'Abnormal', 'Not Available'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setFormData({ ...formData, ecgStatus: st as any })}
                        className={`py-2.5 rounded-xl border text-[10px] font-bold transition ${
                          formData.ecgStatus === st
                            ? st === 'Abnormal'
                              ? 'bg-red-600 text-white border-red-600'
                              : 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Lipid Profile Subsection */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Lipid Profile Panel (mg/dL)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Total Cholesterol</label>
                    <input
                      type="number"
                      value={formData.totalCholesterol}
                      onChange={(e) => setFormData({ ...formData, totalCholesterol: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">HDL Cholesterol</label>
                    <input
                      type="number"
                      value={formData.hdl}
                      onChange={(e) => setFormData({ ...formData, hdl: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">LDL Cholesterol</label>
                    <input
                      type="number"
                      value={formData.ldl}
                      onChange={(e) => setFormData({ ...formData, ldl: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Triglycerides</label>
                    <input
                      type="number"
                      value={formData.triglycerides}
                      onChange={(e) => setFormData({ ...formData, triglycerides: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setStep(5)}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl hover:bg-slate-200 transition flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  onClick={() => setStep(7)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 transition"
                >
                  <span>Proceed to Step 7: Review</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 7: REVIEW */}
          {step === 7 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    Step 7: Final EHR Assessment Review
                  </h2>
                  <p className="text-xs text-slate-500">
                    Verify all collected patient data prior to triggering HealthSense AI Intelligence Analysis
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-full">
                  All 7 Steps Validated
                </span>
              </div>

              {/* Review Sections */}
              <div className="space-y-4 text-xs">
                {/* 1. Patient Overview */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2">1. Patient Overview</h3>
                    <p className="text-slate-700 dark:text-slate-300">
                      <strong>Name:</strong> {formData.patientName} • <strong>Age:</strong> {formData.age} yrs • <strong>Gender:</strong> {formData.gender}
                    </p>
                    <p className="text-slate-700 dark:text-slate-300">
                      <strong>Phone:</strong> {formData.phone} • <strong>ID:</strong> {formData.patientId} • <strong>BMI:</strong> {calculatedBmi} kg/m² ({getBmiCategory(calculatedBmi).label})
                    </p>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-xl transition flex items-center gap-1 font-bold"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>

                {/* 2. Lifestyle Summary */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2">2. Lifestyle Summary</h3>
                    <p className="text-slate-700 dark:text-slate-300">
                      <strong>Smoking:</strong> {formData.smoking} • <strong>Alcohol:</strong> {formData.alcohol} • <strong>Exercise:</strong> {formData.exercise}
                    </p>
                    <p className="text-slate-700 dark:text-slate-300">
                      <strong>Diet:</strong> {formData.diet} • <strong>Sleep:</strong> {formData.sleepHours} hrs/night • <strong>Stress:</strong> {formData.stressLevel}
                    </p>
                  </div>
                  <button
                    onClick={() => setStep(2)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-xl transition flex items-center gap-1 font-bold"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>

                {/* 3. Symptoms */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2">3. Presenting Symptoms</h3>
                    {formData.selectedSymptoms.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {formData.selectedSymptoms.map((s) => (
                          <span key={s.name} className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-lg text-[11px] font-bold">
                            {s.name} ({s.severity}, {s.durationValue} {s.durationUnit})
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500">No active symptoms selected.</p>
                    )}
                  </div>
                  <button
                    onClick={() => setStep(3)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-xl transition flex items-center gap-1 font-bold"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>

                {/* 4. Vitals */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2">4. Vitals & Point-of-Care</h3>
                    <p className="text-slate-700 dark:text-slate-300">
                      <strong>BP:</strong> {formData.bpSystolic}/{formData.bpDiastolic} mmHg • <strong>HR:</strong> {formData.heartRate} bpm • <strong>SpO₂:</strong> {formData.spo2}%
                    </p>
                    <p className="text-slate-700 dark:text-slate-300">
                      <strong>Fasting Glucose:</strong> {formData.fastingGlucose} mg/dL • <strong>Random Glucose:</strong> {formData.randomGlucose} mg/dL
                    </p>
                  </div>
                  <button
                    onClick={() => setStep(4)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-xl transition flex items-center gap-1 font-bold"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>

                {/* 5. Medical History */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2">5. Preexisting History & Meds</h3>
                    <p className="text-slate-700 dark:text-slate-300">
                      <strong>Conditions:</strong> {formData.existingConditions.join(', ') || 'None'}
                    </p>
                    <p className="text-slate-700 dark:text-slate-300">
                      <strong>Meds:</strong> {formData.currentMedications || 'None'} • <strong>Allergies:</strong> {formData.drugAllergies || 'None'}
                    </p>
                  </div>
                  <button
                    onClick={() => setStep(5)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-xl transition flex items-center gap-1 font-bold"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>

                {/* 6. Laboratory Results */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2">6. Laboratory Results</h3>
                    <p className="text-slate-700 dark:text-slate-300">
                      <strong>HbA1c:</strong> {formData.hba1c}% • <strong>Creatinine:</strong> {formData.creatinine} mg/dL • <strong>eGFR:</strong> {formData.egfr} mL/min
                    </p>
                    <p className="text-slate-700 dark:text-slate-300">
                      <strong>Lipids (LDL/HDL/TC):</strong> {formData.ldl} / {formData.hdl} / {formData.totalCholesterol} mg/dL • <strong>ECG:</strong> {formData.ecgStatus}
                    </p>
                  </div>
                  <button
                    onClick={() => setStep(6)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-xl transition flex items-center gap-1 font-bold"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>
              </div>

              {/* FINAL ACTION BUTTON */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  onClick={() => setStep(6)}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl hover:bg-slate-200 transition flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Lab Results</span>
                </button>

                <button
                  onClick={() => {
                    // Update patient vitals if handler passed
                    if (onSaveAssessment) {
                      onSaveAssessment(
                        {
                          ...activePatient.vitals,
                          bpSystolic: formData.bpSystolic,
                          bpDiastolic: formData.bpDiastolic,
                          glucose: formData.fastingGlucose,
                          hba1c: formData.hba1c,
                          bmi: calculatedBmi,
                          ldl: formData.ldl,
                          weightKg: formData.weightKg,
                        },
                        `Assessment finalized for ${formData.patientName}.`
                      );
                    }
                    // Navigate to Clinical Intelligence Analysis placeholder
                    onNavigateToAnalysis();
                  }}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-blue-600/30 flex items-center justify-center gap-3 transition transform hover:scale-[1.02]"
                >
                  <BrainCircuit className="w-5 h-5 text-emerald-300 animate-pulse" />
                  <span>Analyze with HealthSense AI</span>
                  <ArrowRight className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT DESKTOP STICKY SIDEBAR (1 COLUMN) */}
        <div className="lg:col-span-1 space-y-4 sticky top-6">
          {/* Card 1: Intake Progress & Time Remaining */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                EHR Form Status
              </span>
              <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-full">
                Step {step} of 7
              </span>
            </div>

            {/* Circular Progress Display */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl">
              <div className="w-12 h-12 rounded-full border-4 border-blue-600 flex items-center justify-center font-extrabold text-xs text-blue-600 dark:text-blue-400 shrink-0">
                {completionPercentage}%
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Completion Rate</p>
                <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3 text-emerald-500" />
                  ~{estTimeRemainingMins} min remaining
                </p>
              </div>
            </div>

            {/* Missing Required Fields Section */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Required Field Checklist
              </span>
              {missingFields.length > 0 ? (
                <div className="space-y-1.5">
                  {missingFields.map((field) => (
                    <div
                      key={field}
                      className="p-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 font-semibold flex items-center gap-1.5"
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Missing: {field}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>All Required Fields Validated!</span>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Quick Step Jump Navigation */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Assessment Steps
            </span>

            <div className="space-y-1 text-xs">
              {stepsList.map((s) => {
                const Icon = s.icon;
                const isCurrent = step === s.num;
                const isDone = step > s.num;

                return (
                  <button
                    key={s.num}
                    onClick={() => setStep(s.num as any)}
                    className={`w-full p-2.5 rounded-xl font-semibold flex items-center justify-between text-left transition ${
                      isCurrent
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold'
                        : isDone
                        ? 'text-emerald-700 dark:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{s.num}. {s.name}</span>
                    </div>
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : isCurrent ? (
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
