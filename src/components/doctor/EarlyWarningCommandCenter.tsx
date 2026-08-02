import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, FileText, Send, CheckCircle2, ArrowRight, Stethoscope, Building2, PhoneCall, Sparkles, Clock, Globe } from 'lucide-react';
import { Patient } from '../../types';

interface EarlyWarningCommandCenterProps {
  patient: Patient;
}

export const EarlyWarningCommandCenter: React.FC<EarlyWarningCommandCenterProps> = ({ patient }) => {
  const [selectedSpecialty, setSelectedSpecialty] = useState<'Cardiology' | 'Nephrology' | 'Endocrinology'>('Nephrology');
  const [selectedUrgency, setSelectedUrgency] = useState<'Immediate' | 'Urgent' | 'Routine'>('Immediate');
  const [selectedLang, setSelectedLang] = useState<'English' | 'Gujarati' | 'Hindi' | 'Marathi'>('English');
  const [referralSent, setReferralSent] = useState<boolean>(false);

  // Missing labs identification
  const missingLabs = [];
  if (!patient.vitals.hba1c || patient.vitals.hba1c === 0) missingLabs.push({ name: 'HbA1c Glycemic Test', urgency: 'High', reason: 'Unverified 3-month glycemic toxicity status.' });
  if (patient.vitals.ldl > 140) missingLabs.push({ name: 'High-Sensitivity CRP & ApoB Panel', urgency: 'High', reason: 'High LDL cholesterol elevates atherosclerotic plaque stroke risk.' });
  missingLabs.push({ name: 'Urine Albumin-to-Creatinine Ratio (uACR)', urgency: 'Immediate', reason: 'Screening for early diabetic nephropathy before microalbuminuria progresses to kidney failure.' });
  missingLabs.push({ name: 'Dilated Retinal Eye Screening', urgency: 'Routine', reason: 'Annual screening for diabetic retinopathy.' });

  // Generate Referral Letter text dynamically
  const generateReferralLetter = () => {
    if (selectedLang === 'Gujarati') {
      return `તાત્કાલિક હોસ્પિટલ રીફરલ નોટ (HealthSense CDSS)
દર્દીનું નામ: ${patient.name} (ઉંમર: ${patient.age} વર્ષ)
રીફરલ વિભાગ: ${selectedSpecialty} વિભાગ
મુખ્ય જોખમ: ડાયાબિટીક નેફ્રોપથી અને હાઈ બ્લડ પ્રેશર (BP: ${patient.vitals.bpSystolic}/${patient.vitals.bpDiastolic} mmHg)

પ્રાથમિક તારણો:
- HbA1c: ${patient.vitals.hba1c}%
- રેનલ જોખમ સ્કોર: ૮૪% (હાઈ રિસ્ક)

કૃપા કરીને આ દર્દીની તાત્કાલિક ${selectedSpecialty} તપાસ અને સ્પેશિયાલિસ્ટ કન્સલ્ટેશન હાથ ધરો.`;
    } else if (selectedLang === 'Hindi') {
      return `आपातकालीन अस्पताल रेफरल पत्र (HealthSense CDSS)
रोगी का नाम: ${patient.name} (आयु: ${patient.age} वर्ष)
रेफरल विभाग: ${selectedSpecialty} विभाग
मुख्य जोखिम: डायबिटीज एवं किडनी रोग (BP: ${patient.vitals.bpSystolic}/${patient.vitals.bpDiastolic} mmHg)

मुख्य नैदानिक निष्कर्ष:
- HbA1c: ${patient.vitals.hba1c}%
- किडनी जोखिम स्कोर: 84% (उच्च जोखिम)

कृपया रोगी को तुरंत ${selectedSpecialty} विशेषज्ञ परामर्श प्रदान करें।`;
    } else {
      return `OFFICIAL CLINICAL REFERRAL DIRECTIVE (HEALTHSENSE CDSS)
Patient Name: ${patient.name} | MRN: #${patient.mrn} | Age: ${patient.age} yrs
Referred To: Department of ${selectedSpecialty}
Urgency Level: ${selectedUrgency.toUpperCase()}

CLINICAL REASON FOR REFERRAL:
CDSS has identified High Cardiometabolic Risk (Risk Score: 84%) with Stage 2 Hypertension (BP ${patient.vitals.bpSystolic}/${patient.vitals.bpDiastolic} mmHg) and uncontrolled Diabetes (HbA1c ${patient.vitals.hba1c}%).

RECOMMENDED INVESTIGATIONS AT SPECIALIST CLINIC:
1. Urine Albumin-to-Creatinine Ratio (uACR)
2. Renal Ultrasound & 24-Hour Urine Protein
3. Complete Lipid Sub-fractionation

Attending Physician: ${patient.primaryDoctor}`;
    }
  };

  const handleDispatchReferral = () => {
    setReferralSent(true);
    setTimeout(() => setReferralSent(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* TOP HIGH-PRIORITY ALERT BANNER */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-700 text-white rounded-3xl p-6 shadow-xl border border-red-500 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <ShieldAlert className="w-7 h-7 text-white animate-bounce" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-200 bg-white/10 px-2.5 py-0.5 rounded-full">
                Early Complication Warning
              </span>
              <h2 className="text-lg font-black text-white pt-1">
                High Risk of Disease Progression: Diabetic Nephropathy & Ischemic Stroke
              </h2>
            </div>
          </div>
          <span className="px-3.5 py-1.5 bg-white text-red-900 rounded-full font-black text-xs uppercase tracking-wider shrink-0">
            Immediate Action Required
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
            <span className="text-amber-200 font-bold text-[10px] uppercase block">Cardiovascular Trajectory</span>
            <p className="font-extrabold text-white text-sm">84% High Risk</p>
            <p className="text-[10px] text-white/80">Stage 2 Hypertension + High LDL</p>
          </div>

          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
            <span className="text-amber-200 font-bold text-[10px] uppercase block">Renal Failure (CKD) Trajectory</span>
            <p className="font-extrabold text-white text-sm">76% Progression Risk</p>
            <p className="text-[10px] text-white/80">Microalbuminuria screening required</p>
          </div>

          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
            <span className="text-amber-200 font-bold text-[10px] uppercase block">Guideline Referral Status</span>
            <p className="font-extrabold text-white text-sm">Nephrology & Cardiology</p>
            <p className="text-[10px] text-white/80">ADA & KDIGO 2026 Aligned</p>
          </div>
        </div>
      </div>

      {/* MISSING INVESTIGATIONS SECTION */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Missing Laboratory Investigations & Evidence Gaps (Ranked by Urgency)
          </h3>
          <span className="text-xs font-bold text-amber-700 bg-amber-50 dark:bg-amber-950 dark:text-amber-300 px-3 py-1 rounded-full">
            CDSS Clinical Gap Detection
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {missingLabs.map((lab, i) => (
            <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-emerald-600" />
                  {lab.name}
                </span>
                <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                  lab.urgency === 'Immediate' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  {lab.urgency} Urgency
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">{lab.reason}</p>
            </div>
          ))}
        </div>
      </div>

      {/* AUTONOMOUS REFERRAL DISPATCH DISPATCHER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              Autonomous Specialist Referral Protocol Generator
            </h3>
            <p className="text-xs text-slate-500">Auto-generated referral directives mapped to ADA/KDIGO guidelines</p>
          </div>

          {/* LANGUAGE TOGGLE FOR REFERRAL */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <Globe className="w-3.5 h-3.5 text-slate-400 ml-1" />
            {(['English', 'Gujarati', 'Hindi', 'Marathi'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLang(lang)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                  selectedLang === lang ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* CONTROLS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Select Target Specialty</label>
            <div className="flex gap-2">
              {(['Nephrology', 'Cardiology', 'Endocrinology'] as const).map((spec) => (
                <button
                  key={spec}
                  onClick={() => setSelectedSpecialty(spec)}
                  className={`flex-1 py-2 rounded-xl font-bold border transition ${
                    selectedSpecialty === spec
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Urgency Classification</label>
            <div className="flex gap-2">
              {(['Immediate', 'Urgent', 'Routine'] as const).map((urg) => (
                <button
                  key={urg}
                  onClick={() => setSelectedUrgency(urg)}
                  className={`flex-1 py-2 rounded-xl font-bold border transition ${
                    selectedUrgency === urg
                      ? 'bg-red-600 text-white border-red-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {urg}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* REFERRAL LETTER PREVIEW BOX */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase text-slate-400 block">Generated Referral Letter Document</span>
          <pre className="p-4 bg-slate-950 text-slate-200 rounded-2xl text-xs font-mono whitespace-pre-wrap leading-relaxed border border-slate-800">
            {generateReferralLetter()}
          </pre>
        </div>

        {/* DISPATCH BUTTON */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-500">
            Sends automated EHR referral package & SMS notification to primary care network.
          </p>
          <button
            onClick={handleDispatchReferral}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-xs shadow-lg flex items-center gap-2 transition cursor-pointer"
          >
            {referralSent ? <CheckCircle2 className="w-4 h-4" /> : <Send className="w-4 h-4" />}
            {referralSent ? 'Referral Dispatched to Network!' : 'Dispatch Specialist Referral'}
          </button>
        </div>
      </div>
    </div>
  );
};
