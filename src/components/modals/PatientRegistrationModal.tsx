import React, { useState } from 'react';
import { X, UserPlus, UserCheck, Stethoscope, Heart, Activity, FileText, Globe, CheckCircle2, Sparkles, Upload, ShieldCheck, Pill } from 'lucide-react';
import { Patient, Vitals } from '../../types';

interface PatientRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  activePatient: Patient;
  onSelectPatient: (patient: Patient) => void;
  onRegisterPatient: (newPatient: Patient) => void;
}

export const PatientRegistrationModal: React.FC<PatientRegistrationModalProps> = ({
  isOpen,
  onClose,
  patients,
  activePatient,
  onSelectPatient,
  onRegisterPatient,
}) => {
  const [activeTab, setActiveTab] = useState<'switch' | 'register'>('register');

  // Form State for New Patient Registration
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(45);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [preferredLanguage, setPreferredLanguage] = useState<'English' | 'Gujarati' | 'Hindi' | 'Marathi'>('English');
  const [region, setRegion] = useState('Gujarat (West India)');
  const [occupation, setOccupation] = useState('Office Worker');
  const [foodPreference, setFoodPreference] = useState<'Vegetarian' | 'Non-Vegetarian' | 'Eggetarian' | 'Jain'>('Vegetarian');

  // Vitals State
  const [bpSystolic, setBpSystolic] = useState<number>(135);
  const [bpDiastolic, setBpDiastolic] = useState<number>(88);
  const [heartRate, setHeartRate] = useState<number>(76);
  const [spo2, setSpo2] = useState<number>(98);
  const [weight, setWeight] = useState<number>(72);
  const [height, setHeight] = useState<number>(170);

  // Labs State
  const [hba1c, setHba1c] = useState<number>(7.4);
  const [glucose, setGlucose] = useState<number>(142);
  const [creatinine, setCreatinine] = useState<number>(1.1);
  const [egfr, setEgfr] = useState<number>(85);
  const [ldl, setLdl] = useState<number>(138);

  // Conditions & Meds
  const [conditionsInput, setConditionsInput] = useState('Hypertension, Early Type 2 Diabetes');
  const [medicationsInput, setMedicationsInput] = useState('Metformin 500mg, Lisinopril 10mg');

  if (!isOpen) return null;

  const handleSubmitNewPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter patient name.');
      return;
    }

    const calculatedBmi = Number((weight / Math.pow(height / 100, 2)).toFixed(1));
    const calculatedRiskScore = Math.min(99, Math.max(10, Math.round(hba1c * 8 + bpSystolic / 3)));
    const calculatedRiskLevel = calculatedRiskScore >= 75 ? 'High' : calculatedRiskScore >= 45 ? 'Moderate' : 'Low';

    const parsedConditions = conditionsInput.split(',').map(s => s.trim()).filter(Boolean);
    const parsedMeds = medicationsInput.split(',').map(s => s.trim()).filter(Boolean);

    const newPatientObj: Patient = {
      id: `p-custom-${Date.now()}`,
      mrn: `MRN-${Math.floor(100000 + Math.random() * 900000)}`,
      name: name.trim(),
      age,
      gender,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      conditions: parsedConditions,
      lastAssessmentDate: new Date().toISOString().split('T')[0],
      pendingReferral: calculatedRiskLevel === 'High',
      weeklyVitalsHistory: [
        { day: 'Mon', bpSystolic: bpSystolic - 4, glucose: glucose - 10, steps: 6400 },
        { day: 'Tue', bpSystolic: bpSystolic - 2, glucose: glucose - 5, steps: 7200 },
        { day: 'Wed', bpSystolic: bpSystolic, glucose, steps: 8100 },
      ],
      preferredLanguage,
      region,
      foodPreference,
      occupation,
      incomeCategory: 'Middle',
      riskScore: calculatedRiskScore,
      riskLevel: calculatedRiskLevel,
      lastVisit: new Date().toISOString().split('T')[0],
      primaryDoctor: 'Dr. Arthur Pendelton',
      vitals: {
        bpSystolic,
        bpDiastolic,
        heartRate,
        hba1c,
        glucose,
        bmi: calculatedBmi,
        weightKg: weight,
        creatinine,
        egfr,
        ldl,
        hdl: 45,
      },
      vitalsHistory: [
        {
          date: new Date().toISOString().split('T')[0],
          weightKg: weight,
          bmi: calculatedBmi,
          glucose,
          hba1c,
          bpSystolic,
          bpDiastolic,
          ldl,
          creatinine,
          egfr,
        }
      ],
      preExistingConditions: parsedConditions,
      medications: parsedMeds.map((m, i) => ({
        id: `med-custom-${i}`,
        name: m,
        dosage: 'As prescribed',
        frequency: 'Daily',
        timeOfDay: ['Morning'],
        purpose: 'Chronic disease management',
        sideEffects: [],
        foodInstructions: 'With meals',
        isAdherent: true,
      })),
      recentActivity: [
        {
          id: `act-reg-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          type: 'vital',
          title: 'New Patient Account Created',
          description: 'Custom patient dataset registered into CDSS 10-stage risk engine.',
          badgeText: 'Registered',
          badgeType: 'success',
        }
      ]
    };

    onRegisterPatient(newPatientObj);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Patient Authentication & Custom Dataset Portal
              </h2>
              <p className="text-xs text-slate-500">
                Log in as existing demo patient or register a new custom patient dataset
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
              activeTab === 'register' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            ➕ Register New Patient / Input My Dataset
          </button>

          <button
            onClick={() => setActiveTab('switch')}
            className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
              activeTab === 'switch' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            👤 Login / Switch Demo Patient
          </button>
        </div>

        {/* TAB 1: SWITCH EXISTING DEMO PATIENTS */}
        {activeTab === 'switch' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 font-medium">
              Select an existing patient profile to simulate their CDSS risk profile:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {patients.map((p) => {
                const isSelected = p.id === activePatient.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      onSelectPatient(p);
                      onClose();
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">{p.name}</span>
                        {isSelected && (
                          <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        {p.age} yrs • {p.gender} • BP {p.vitals.bpSystolic}/{p.vitals.bpDiastolic} • HbA1c {p.vitals.hba1c}%
                      </p>
                    </div>

                    <span className={`text-xs font-black px-2.5 py-1 rounded-xl ${
                      p.riskLevel === 'High' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {p.riskScore}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: REGISTER NEW CUSTOM PATIENT FORM */}
        {activeTab === 'register' && (
          <form onSubmit={handleSubmitNewPatient} className="space-y-5">
            {/* SECTION 1: DEMOGRAPHICS */}
            <div className="space-y-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4" /> 1. Patient Demographics & Profile
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patel"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Age (Years)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={120}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Preferred Language</label>
                  <select
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  >
                    <option value="English">English</option>
                    <option value="Gujarati">ગુજરાતી (Gujarati)</option>
                    <option value="Hindi">हिंदी (Hindi)</option>
                    <option value="Marathi">मરાઠી (Marathi)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Diet Preference</label>
                  <select
                    value={foodPreference}
                    onChange={(e) => setFoodPreference(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  >
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                    <option value="Eggetarian">Eggetarian</option>
                    <option value="Jain">Jain Pure Veg</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Region / State</label>
                  <input
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: VITALS & LAB BIOMARKERS */}
            <div className="space-y-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <Heart className="w-4 h-4" /> 2. Baseline Vitals & Laboratory Biomarkers
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Systolic BP (mmHg)</label>
                  <input
                    type="number"
                    value={bpSystolic}
                    onChange={(e) => setBpSystolic(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Diastolic BP (mmHg)</label>
                  <input
                    type="number"
                    value={bpDiastolic}
                    onChange={(e) => setBpDiastolic(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">HbA1c (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={hba1c}
                    onChange={(e) => setHba1c(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Serum Creatinine</label>
                  <input
                    type="number"
                    step="0.1"
                    value={creatinine}
                    onChange={(e) => setCreatinine(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: CONDITIONS & MEDS */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                <Pill className="w-4 h-4" /> 3. Existing Conditions & Active Medications
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Pre-existing Conditions (comma separated)</label>
                  <input
                    type="text"
                    value={conditionsInput}
                    onChange={(e) => setConditionsInput(e.target.value)}
                    placeholder="e.g. Hypertension, Diabetes"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Current Medications (comma separated)</label>
                  <input
                    type="text"
                    value={medicationsInput}
                    onChange={(e) => setMedicationsInput(e.target.value)}
                    placeholder="e.g. Metformin 500mg, Lisinopril 10mg"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* SAVE BUTTON */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-2xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-xs shadow-lg flex items-center gap-2 transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Save & Run CDSS Engine for My Data
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
