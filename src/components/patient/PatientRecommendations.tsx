import React, { useState } from 'react';
import { Sparkles, Stethoscope, Utensils, Activity, Moon, Droplets, Brain, Calendar, Globe, Volume2, Share2, Check, Copy, AlertTriangle, ShieldCheck, Flame, Sun, Heart } from 'lucide-react';
import { INITIAL_PATIENTS } from '../../mockData';
import { indiaPreventiveAssistant } from '../../services/IndiaPreventiveAssistantService';
import { Patient } from '../../types';

export const PatientRecommendations: React.FC = () => {
  // Use first mock patient as active patient for demonstration
  const [patient, setPatient] = useState<Patient>(INITIAL_PATIENTS[0]);
  const [selectedLang, setSelectedLang] = useState<'Gujarati' | 'Hindi' | 'Marathi' | 'English'>(
    (patient.preferredLanguage as any) || 'Gujarati'
  );
  const [activeFestival, setActiveFestival] = useState<string>('Navratri');
  const [activeVersionTab, setActiveVersionTab] = useState<'patient' | 'doctor' | 'voice' | 'whatsapp'>('patient');
  const [copiedWhatsApp, setCopiedWhatsApp] = useState<boolean>(false);

  // Generate dynamic cultural report
  const report = indiaPreventiveAssistant.generateCulturalReport(patient, activeFestival, selectedLang);

  const categoryIconMap: Record<string, any> = {
    Diet: Utensils,
    Exercise: Activity,
    Medication: Stethoscope,
    Hydration: Droplets,
    'Mental Wellness': Brain,
    Sleep: Moon,
    'Seasonal Advice': Sun,
  };

  const handleCopyWhatsApp = () => {
    navigator.clipboard.writeText(report.versions.whatsappFriendlyVersion);
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-emerald-600" />
            India-First Preventive Healthcare Assistant
          </h1>
          <p className="text-xs text-slate-500">
            Culturally personalized, festival-adapted guidance mapped across Gujarati, Hindi, Marathi & English
          </p>
        </div>

        {/* LANGUAGE SELECTOR */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
          <Globe className="w-4 h-4 text-emerald-600 ml-1.5 shrink-0" />
          {(['English', 'Gujarati', 'Hindi', 'Marathi'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLang(lang)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedLang === lang
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'
              }`}
            >
              {lang === 'Gujarati' ? 'ગુજરાતી' : lang === 'Hindi' ? 'हिंदी' : lang === 'Marathi' ? 'मराठी' : 'English'}
            </button>
          ))}
        </div>
      </div>

      {/* CULTURAL PROFILE BAR */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center font-bold text-emerald-300 text-lg border border-white/20">
            🇮🇳
          </div>
          <div>
            <h2 className="font-bold text-sm text-white flex items-center gap-2">
              {patient.name}
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 rounded-full">
                {patient.region || 'Gujarat'} Region Profile
              </span>
            </h2>
            <p className="text-xs text-emerald-200/80">
              Diet: <strong className="text-white">{patient.foodPreference || 'Vegetarian'}</strong> • Religion:{' '}
              <strong className="text-white">{patient.religion || 'Hindu'}</strong> • Occ: <strong className="text-white">{patient.occupation || 'Business'}</strong>
            </p>
          </div>
        </div>

        {/* ACTIVE FESTIVAL SELECTOR */}
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 text-xs">
          <Calendar className="w-4 h-4 text-amber-300 shrink-0" />
          <span className="font-bold text-amber-200">Active Festival:</span>
          <select
            value={activeFestival}
            onChange={(e) => setActiveFestival(e.target.value)}
            className="bg-slate-900/90 text-white font-bold text-xs rounded-xl px-2.5 py-1 border border-amber-400/40 focus:outline-none cursor-pointer"
          >
            <option value="Navratri">Navratri (ગરબા / Fasting)</option>
            <option value="Diwali">Diwali (Mithai / Air Care)</option>
            <option value="Ramadan">Ramadan (Suhoor / Iftar)</option>
          </select>
        </div>
      </div>

      {/* VERSION SELECTOR TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveVersionTab('patient')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
            activeVersionTab === 'patient'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
          }`}
        >
          <Heart className="w-4 h-4" />
          Patient Version ({selectedLang})
        </button>

        <button
          onClick={() => setActiveVersionTab('doctor')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
            activeVersionTab === 'doctor'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          Doctor Version (Clinical)
        </button>

        <button
          onClick={() => setActiveVersionTab('voice')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
            activeVersionTab === 'voice'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          Voice Friendly Script
        </button>

        <button
          onClick={() => setActiveVersionTab('whatsapp')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
            activeVersionTab === 'whatsapp'
              ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
          }`}
        >
          <Share2 className="w-4 h-4" />
          WhatsApp Share Format
        </button>
      </div>

      {/* VERSION DISPLAY BOX (IF DOCTOR / VOICE / WHATSAPP SELECTED) */}
      {activeVersionTab !== 'patient' && (
        <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 shadow-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              {activeVersionTab === 'doctor' && <Stethoscope className="w-4 h-4" />}
              {activeVersionTab === 'voice' && <Volume2 className="w-4 h-4 text-purple-400" />}
              {activeVersionTab === 'whatsapp' && <Share2 className="w-4 h-4 text-emerald-400" />}
              {activeVersionTab.toUpperCase()} FORMAT GENERATION
            </span>

            {activeVersionTab === 'whatsapp' && (
              <button
                onClick={handleCopyWhatsApp}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                {copiedWhatsApp ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedWhatsApp ? 'Copied!' : 'Copy WhatsApp Message'}
              </button>
            )}
          </div>

          <pre className="font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
            {activeVersionTab === 'doctor' && report.versions.doctorVersion}
            {activeVersionTab === 'voice' && report.versions.voiceFriendlyVersion}
            {activeVersionTab === 'whatsapp' && report.versions.whatsappFriendlyVersion}
          </pre>
        </div>
      )}

      {/* FESTIVAL GUIDANCE CARD */}
      {report.festivalGuidance && (
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 dark:from-amber-950/40 dark:to-red-950/40 border border-amber-300 dark:border-amber-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-amber-200 dark:border-amber-800/80 pb-3">
            <h2 className="font-bold text-base text-amber-900 dark:text-amber-200 flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              Special Festival Protocol: {report.festivalGuidance.festivalName}
            </h2>
            <span className="text-[10px] font-black text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-3 py-1 rounded-full uppercase">
              Cultural Festival Care
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-amber-200 dark:border-amber-900/40 space-y-2">
              <span className="font-extrabold text-amber-800 dark:text-amber-300 block text-[11px] uppercase">
                • Festival Lifestyle Advice
              </span>
              <ul className="space-y-1 text-slate-700 dark:text-slate-300 font-medium">
                {report.festivalGuidance.specialAdvice.map((sa, i) => (
                  <li key={i}>- {sa}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-amber-200 dark:border-amber-900/40 space-y-2">
              <span className="font-extrabold text-emerald-800 dark:text-emerald-300 block text-[11px] uppercase">
                • Food & Sweets Adjustments
              </span>
              <ul className="space-y-1 text-slate-700 dark:text-slate-300 font-medium">
                {report.festivalGuidance.dietaryAdjustments.map((da, i) => (
                  <li key={i}>- {da}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-amber-200 dark:border-amber-900/40 space-y-2">
              <span className="font-extrabold text-blue-800 dark:text-blue-300 block text-[11px] uppercase">
                • Fasting & Med Safety
              </span>
              <p className="text-slate-700 dark:text-slate-300 font-semibold">
                {report.festivalGuidance.medicationTimingNote}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 7 DYNAMIC CATEGORY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {report.categories.map((cat) => {
          const IconComp = categoryIconMap[cat.category] || Sparkles;
          return (
            <div
              key={cat.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {cat.category} Category
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {cat.suggestedFrequency}
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {cat.title}
                    </h3>
                  </div>
                </div>

                {/* RECOMMENDED OPTIONS */}
                <div className="space-y-2 pt-1 text-xs">
                  <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40 space-y-1">
                    <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase block">
                      ✅ Recommended Culturally Aligned Items
                    </span>
                    <ul className="space-y-1 font-semibold text-emerald-950 dark:text-emerald-200">
                      {cat.recommendedOptions.map((opt, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          {opt}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* ITEMS TO AVOID IF PRESENT */}
                  {cat.itemsToAvoid && cat.itemsToAvoid.length > 0 && (
                    <div className="p-3 bg-rose-50/70 dark:bg-rose-950/30 rounded-2xl border border-rose-200/60 dark:border-rose-900/40 space-y-1">
                      <span className="text-[10px] font-bold text-rose-800 dark:text-rose-300 uppercase block">
                        ⚠️ High Risk / Items to Avoid
                      </span>
                      <ul className="space-y-1 font-semibold text-rose-950 dark:text-rose-200">
                        {cat.itemsToAvoid.map((av, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                            {av}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* CLINICAL REASON & BENEFIT */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700/60 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Clinical Rationale</span>
                    <p className="text-slate-700 dark:text-slate-300 font-medium">{cat.reason}</p>
                    <p className="text-emerald-700 dark:text-emerald-300 font-bold text-[11px] pt-1">
                      Expected Benefit: {cat.expectedBenefit}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Physician Directive</span>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-start gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{cat.doctorAlignedTip}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
