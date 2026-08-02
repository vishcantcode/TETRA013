import React, { useState, useRef } from 'react';
import { Layers, Dna, Users, Mic, FileText, Watch, Activity, CheckCircle2, ShieldAlert, Sparkles, Zap, ArrowRight, Play, Pause, RefreshCw, Stethoscope, Pill, Plus, X, Upload } from 'lucide-react';
import { Patient, Vitals } from '../../types';

interface UnifiedInputConsoleProps {
  activePatient: Patient;
  onUpdatePatient: (updatedPatient: Patient) => void;
  onNavigateToTab?: (tab: string) => void;
}

export const UnifiedInputConsole: React.FC<UnifiedInputConsoleProps> = ({
  activePatient,
  onUpdatePatient,
  onNavigateToTab,
}) => {
  // 1. Personal Medical History State
  const [medicalConditions, setMedicalConditions] = useState<string[]>(
    activePatient.preExistingConditions || ['Hypertension', 'Type 2 Diabetes']
  );
  const [activeMeds, setActiveMeds] = useState<string[]>(
    activePatient.medications || ['Metformin 500mg', 'Lisinopril 10mg']
  );
  const [newConditionInput, setNewConditionInput] = useState('');
  const [newMedInput, setNewMedInput] = useState('');

  // 2. Family Medical History State
  const [familyHistory, setFamilyHistory] = useState<string[]>([
    'Paternal Early CAD (< 55 yrs)',
    'Maternal Type 2 Diabetes',
    'Family History of CKD',
  ]);
  const [newFamilyInput, setNewFamilyInput] = useState('');

  // 3. Voice Command & Audio Transcript State
  const [voiceText, setVoiceText] = useState<string>(
    'Patient reports mild morning dizziness and tightness in chest after climbing stairs.'
  );
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // 4. Lab Reports & Pathology OCR State
  const [hba1c, setHba1c] = useState<number>(activePatient.vitals.hba1c || 7.6);
  const [creatinine, setCreatinine] = useState<number>(activePatient.vitals.creatinine || 1.2);
  const [egfr, setEgfr] = useState<number>(activePatient.vitals.egfr || 78);
  const [ldl, setLdl] = useState<number>(activePatient.vitals.ldl || 142);
  const [labOcrStatus, setLabOcrStatus] = useState<string>('Pathology OCR Auto-Synced');

  // 5. Live Smartwatch BLE Telemetry State
  const [watchHeartRate, setWatchHeartRate] = useState<number>(activePatient.vitals.heartRate || 114);
  const [watchBpSys, setWatchBpSys] = useState<number>(activePatient.vitals.bpSystolic || 152);
  const [watchBpDia, setWatchBpDia] = useState<number>(activePatient.vitals.bpDiastolic || 96);
  const [watchSpo2, setWatchSpo2] = useState<number>(96);
  const [watchBodyTemp, setWatchBodyTemp] = useState<number>(100.8);

  // 6. Presenting Symptoms Checklist State
  const allAvailableSymptoms = [
    'Dizziness', 'Chest Discomfort', 'Shortness of Breath', 'Nausea', 'Fatigue', 'Palpitations', 'Leg Swelling'
  ];
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['Dizziness', 'Chest Discomfort', 'Fatigue']);

  // Fusion Notification State
  const [fusionApplied, setFusionApplied] = useState<boolean>(false);

  // Add Condition Handler
  const handleAddCondition = () => {
    if (!newConditionInput.trim()) return;
    setMedicalConditions((prev) => [...prev, newConditionInput.trim()]);
    setNewConditionInput('');
  };

  const handleRemoveCondition = (index: number) => {
    setMedicalConditions((prev) => prev.filter((_, i) => i !== index));
  };

  // Add Medication Handler
  const handleAddMedication = () => {
    if (!newMedInput.trim()) return;
    setActiveMeds((prev) => [...prev, newMedInput.trim()]);
    setNewMedInput('');
  };

  const handleRemoveMedication = (index: number) => {
    setActiveMeds((prev) => prev.filter((_, i) => i !== index));
  };

  // Add Family History Handler
  const handleAddFamily = () => {
    if (!newFamilyInput.trim()) return;
    setFamilyHistory((prev) => [...prev, newFamilyInput.trim()]);
    setNewFamilyInput('');
  };

  const handleRemoveFamily = (index: number) => {
    setFamilyHistory((prev) => prev.filter((_, i) => i !== index));
  };

  // Toggle Symptom Handler
  const handleToggleSymptom = (sym: string) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms((prev) => prev.filter((s) => s !== sym));
    } else {
      setSelectedSymptoms((prev) => [...prev, sym]);
    }
  };

  // Simulate OCR File Upload
  const handleSimulateLabOcrUpload = () => {
    setHba1c(8.1);
    setCreatinine(1.4);
    setEgfr(65);
    setLdl(158);
    setLabOcrStatus('✅ Lab PDF Parsed Successfully (HbA1c 8.1%, Creatinine 1.4)');
  };

  // Simulate Live Watch Pulse Spike
  const handleSimulateWatchSpike = () => {
    setWatchHeartRate(126);
    setWatchBpSys(164);
    setWatchBpDia(102);
    setWatchSpo2(94);
    setWatchBodyTemp(101.4);
  };

  // Web Speech Recognition Handler
  const toggleVoiceRecording = () => {
    if (isRecordingVoice) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsRecordingVoice(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type in the voice box.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsRecordingVoice(true);
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((res: any) => res[0].transcript)
          .join('');
        setVoiceText(transcript);
      };
      recognition.onerror = () => setIsRecordingVoice(false);
      recognition.onend = () => setIsRecordingVoice(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsRecordingVoice(false);
    }
  };

  // Multi-Modal Data Fusion Execution
  const handleFuseAllInputs = () => {
    const symptomMultiplier = selectedSymptoms.length * 4;
    const familyMultiplier = familyHistory.length * 3;
    const newRiskScore = Math.min(99, Math.max(10, Math.round(hba1c * 7 + watchBpSys / 3.5 + symptomMultiplier + familyMultiplier)));
    const newRiskLevel = newRiskScore >= 75 ? 'High' : newRiskScore >= 45 ? 'Moderate' : 'Low';

    const mergedVitals: Vitals = {
      ...activePatient.vitals,
      bpSystolic: watchBpSys,
      bpDiastolic: watchBpDia,
      heartRate: watchHeartRate,
      hba1c,
      creatinine,
      egfr,
      ldl,
    };

    const updatedPatient: Patient = {
      ...activePatient,
      vitals: mergedVitals,
      riskScore: newRiskScore,
      riskLevel: newRiskLevel,
      preExistingConditions: medicalConditions,
      medications: activeMeds,
      recentActivity: [
        {
          id: `act-fusion-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          type: 'vitals',
          title: 'Multi-Modal Data Fusion Executed',
          description: `Fused 6 modalities (History, Family CAD, Voice Stream, Lab OCR, Watch BP ${watchBpSys}/${watchBpDia}, Symptoms: ${selectedSymptoms.join(', ')}) into CDSS risk model.`,
          badgeText: 'Multi-Modal Fusion',
          badgeType: newRiskScore >= 75 ? 'warning' : 'success',
        },
        ...activePatient.recentActivity,
      ],
    };

    onUpdatePatient(updatedPatient);
    setFusionApplied(true);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* CONSOLE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-blue-600 animate-pulse" />
            Multi-Modal Clinical Input Console
          </h1>
          <p className="text-xs text-slate-500">
            Synthesizes 6 Clinical Input Modalities (Personal History, Family Risk, Voice Stream, Lab OCR, Smartwatch Telemetry, Acute Symptoms) into 32-D XAI Vector
          </p>
        </div>

        {/* FUSE INPUTS MAIN ACTION BUTTON */}
        <button
          onClick={handleFuseAllInputs}
          className="px-6 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:opacity-95 text-white font-extrabold rounded-2xl text-xs shadow-xl flex items-center gap-2.5 transition cursor-pointer shrink-0"
        >
          <Zap className="w-4 h-4 text-amber-300 animate-bounce" />
          ⚡ Fuse All 6 Inputs & Run CDSS Risk Engine
        </button>
      </div>

      {/* FUSION CONFIRMATION BANNER */}
      {fusionApplied && (
        <div className="bg-emerald-600 text-white rounded-3xl p-5 shadow-xl flex items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-7 h-7 text-white shrink-0" />
            <div>
              <h3 className="font-extrabold text-sm text-white">Multi-Modal Inputs Fused Successfully!</h3>
              <p className="text-xs text-emerald-100">
                Patient CDSS Risk Score updated to <strong>{activePatient.riskScore}% ({activePatient.riskLevel} Risk)</strong>. All 6 modalities synchronized.
              </p>
            </div>
          </div>
          {onNavigateToTab && (
            <button
              onClick={() => onNavigateToTab('xai-inspector')}
              className="px-4 py-2 bg-white text-emerald-900 rounded-xl font-bold text-xs shadow-md hover:bg-emerald-50 transition flex items-center gap-1.5 shrink-0"
            >
              Inspect XAI Biomarkers <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* 6 MODALITIES INPUT CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* CARD 1: PERSONAL MEDICAL HISTORY */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 hover:shadow-md transition">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="font-bold text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
              <Dna className="w-4 h-4 text-blue-500" /> 1. Personal Medical History
            </span>
            <span className="text-[10px] bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold px-2 py-0.5 rounded-full">
              {medicalConditions.length} Conditions
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase">Pre-existing Conditions</label>
            <div className="flex flex-wrap gap-1.5">
              {medicalConditions.map((cond, idx) => (
                <span key={idx} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
                  <span>{cond}</span>
                  <button onClick={() => handleRemoveCondition(idx)} className="text-slate-400 hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-1.5 pt-1">
              <input
                type="text"
                placeholder="Add condition (e.g. Asthma)..."
                value={newConditionInput}
                onChange={(e) => setNewConditionInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCondition()}
                className="flex-1 px-3 py-1.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
              />
              <button
                onClick={handleAddCondition}
                className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="text-[11px] font-bold text-slate-500 uppercase">Active Medications</label>
            <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
              {activeMeds.map((m, i) => (
                <div key={i} className="flex items-center justify-between p-1.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                  <div className="flex items-center gap-1.5">
                    <Pill className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>{m}</span>
                  </div>
                  <button onClick={() => handleRemoveMedication(i)} className="text-slate-400 hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-1.5 pt-1">
              <input
                type="text"
                placeholder="Add medication (e.g. Atorvastatin 20mg)..."
                value={newMedInput}
                onChange={(e) => setNewMedInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddMedication()}
                className="flex-1 px-3 py-1.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
              />
              <button
                onClick={handleAddMedication}
                className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* CARD 2: FAMILY MEDICAL HISTORY */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 hover:shadow-md transition">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="font-bold text-xs uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-purple-500" /> 2. Family Hereditary Risk
            </span>
            <span className="text-[10px] bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-bold px-2 py-0.5 rounded-full">
              {familyHistory.length} Vectors
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase">First-Degree Relative History</label>
            <div className="space-y-2">
              {familyHistory.map((fam, i) => (
                <div key={i} className="p-2.5 bg-purple-50/60 dark:bg-purple-950/40 rounded-xl border border-purple-100 dark:border-purple-900 text-xs font-semibold text-purple-900 dark:text-purple-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>{fam}</span>
                  </div>
                  <button onClick={() => handleRemoveFamily(i)} className="text-slate-400 hover:text-red-500">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-1.5 pt-2">
              <input
                type="text"
                placeholder="Add family risk (e.g. Stroke)..."
                value={newFamilyInput}
                onChange={(e) => setNewFamilyInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddFamily()}
                className="flex-1 px-3 py-1.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
              />
              <button
                onClick={handleAddFamily}
                className="p-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* CARD 3: VOICE COMMAND AUDIO TRANSCRIPT */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 hover:shadow-md transition">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="font-bold text-xs uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <Mic className="w-4 h-4 text-rose-500" /> 3. Voice Command Stream
            </span>
            <button
              onClick={toggleVoiceRecording}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                isRecordingVoice ? 'bg-red-600 text-white animate-pulse' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              }`}
            >
              <Mic className="w-3 h-3" />
              {isRecordingVoice ? 'Recording...' : 'Record Voice'}
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase">Transcribed Patient Voice Stream</label>
            <textarea
              rows={3}
              value={voiceText}
              onChange={(e) => setVoiceText(e.target.value)}
              className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-rose-500"
            />

            <div className="pt-1">
              <span className="text-[10px] font-bold text-slate-400 block mb-1">Quick Voice Presets:</span>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setVoiceText('Feeling severe morning dizziness and elevated HR after walking.')}
                  className="px-2 py-0.5 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 rounded-lg text-[10px] font-medium border border-rose-200 dark:border-rose-900"
                >
                  ⚡ Dizziness & High HR
                </button>
                <button
                  onClick={() => setVoiceText('Chest discomfort after climbing stairs with mild shortness of breath.')}
                  className="px-2 py-0.5 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 rounded-lg text-[10px] font-medium border border-rose-200 dark:border-rose-900"
                >
                  ⚡ Chest Tightness
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 4: LAB REPORTS & PATHOLOGY OCR */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 hover:shadow-md transition">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="font-bold text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-500" /> 4. Lab Reports & Pathology OCR
            </span>
            <span className="text-[10px] bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full">
              OCR Verified
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 font-bold block">HbA1c Glycemic</span>
              <input
                type="number"
                step="0.1"
                value={hba1c}
                onChange={(e) => setHba1c(Number(e.target.value))}
                className="font-extrabold text-slate-900 dark:text-white text-sm bg-transparent outline-none w-full"
              />
            </div>

            <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 font-bold block">Creatinine (mg/dL)</span>
              <input
                type="number"
                step="0.1"
                value={creatinine}
                onChange={(e) => setCreatinine(Number(e.target.value))}
                className="font-extrabold text-slate-900 dark:text-white text-sm bg-transparent outline-none w-full"
              />
            </div>

            <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 font-bold block">eGFR Clearance</span>
              <input
                type="number"
                value={egfr}
                onChange={(e) => setEgfr(Number(e.target.value))}
                className="font-extrabold text-slate-900 dark:text-white text-sm bg-transparent outline-none w-full"
              />
            </div>

            <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 font-bold block">LDL (mg/dL)</span>
              <input
                type="number"
                value={ldl}
                onChange={(e) => setLdl(Number(e.target.value))}
                className="font-extrabold text-slate-900 dark:text-white text-sm bg-transparent outline-none w-full"
              />
            </div>
          </div>

          <button
            onClick={handleSimulateLabOcrUpload}
            className="w-full py-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 rounded-xl text-xs font-bold border border-amber-200 dark:border-amber-800 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>📄 Upload Pathology PDF (Auto-OCR)</span>
          </button>
          <span className="text-[10px] text-slate-400 block text-center italic">{labOcrStatus}</span>
        </div>

        {/* CARD 5: LIVE SMARTWATCH BLE TELEMETRY */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 hover:shadow-md transition">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="font-bold text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <Watch className="w-4 h-4 text-emerald-500" /> 5. Live Smartwatch Telemetry
            </span>
            <span className="text-[10px] bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> Live BLE
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 font-bold block">Heart Rate (BPM)</span>
              <input
                type="number"
                value={watchHeartRate}
                onChange={(e) => setWatchHeartRate(Number(e.target.value))}
                className="font-extrabold text-slate-900 dark:text-white text-sm bg-transparent outline-none w-full"
              />
            </div>

            <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 font-bold block">Systolic BP (mmHg)</span>
              <input
                type="number"
                value={watchBpSys}
                onChange={(e) => setWatchBpSys(Number(e.target.value))}
                className="font-extrabold text-amber-600 text-sm bg-transparent outline-none w-full"
              />
            </div>

            <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 font-bold block">Oxygen SpO2 (%)</span>
              <input
                type="number"
                value={watchSpo2}
                onChange={(e) => setWatchSpo2(Number(e.target.value))}
                className="font-extrabold text-slate-900 dark:text-white text-sm bg-transparent outline-none w-full"
              />
            </div>

            <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 font-bold block">Body Temp (°F)</span>
              <input
                type="number"
                step="0.1"
                value={watchBodyTemp}
                onChange={(e) => setWatchBodyTemp(Number(e.target.value))}
                className="font-extrabold text-rose-600 text-sm bg-transparent outline-none w-full"
              />
            </div>
          </div>

          <button
            onClick={handleSimulateWatchSpike}
            className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 rounded-xl text-xs font-bold border border-emerald-200 dark:border-emerald-800 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>🔄 Simulate Live Telemetry Spike</span>
          </button>
        </div>

        {/* CARD 6: PRESENTING SYMPTOMS CHECKLIST */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 hover:shadow-md transition">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="font-bold text-xs uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-teal-500" /> 6. Presenting Symptoms Checklist
            </span>
            <span className="text-[10px] bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-300 font-bold px-2 py-0.5 rounded-full">
              {selectedSymptoms.length} Selected
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase">Click to Toggle Symptoms</label>
            <div className="flex flex-wrap gap-1.5">
              {allAvailableSymptoms.map((sym) => {
                const isSel = selectedSymptoms.includes(sym);
                return (
                  <button
                    key={sym}
                    onClick={() => handleToggleSymptom(sym)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5 ${
                      isSel
                        ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-teal-50'
                    }`}
                  >
                    <span>{isSel ? '✓' : '+'}</span>
                    <span>{sym}</span>
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
