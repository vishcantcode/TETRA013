import React, { useState } from 'react';
import {
  Activity,
  UserCheck,
  Stethoscope,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  ShieldAlert,
  Home,
  Check,
  Globe,
  Heart,
  UserPlus,
} from 'lucide-react';
import { Mode, Patient } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface HeaderProps {
  mode: Mode;
  setMode: (mode: Mode) => void;
  activePatient: Patient;
  setActivePatient: (patient: Patient) => void;
  allPatients: Patient[];
  isHighContrast: boolean;
  setIsHighContrast: (val: boolean) => void;
  onOpenNewAssessment?: () => void;
  onOpenPatientRegistration?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  setMode,
  activePatient,
  setActivePatient,
  allPatients,
  isHighContrast,
  setIsHighContrast,
  onOpenPatientRegistration,
}) => {
  const [showPatientMenu, setShowPatientMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { language, setLanguage, t, supportedLanguages } = useLanguage();

  const currentLangOption = supportedLanguages.find((l) => l.code === language) || supportedLanguages[0];

  const filteredPatients = allPatients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.mrn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <header className={`sticky top-0 z-40 border-b transition-colors shadow-sm ${
      isHighContrast
        ? 'bg-[#0B223A] border-[#1A3E60] text-white'
        : 'bg-white dark:bg-[#0B223A] border-[#E5EEF8] dark:border-[#1A3E60] text-[#1B263B] dark:text-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setMode('landing')}
            className="flex items-center gap-2.5 group text-left focus:outline-none cursor-pointer"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition shadow-md ${
              isHighContrast
                ? 'bg-yellow-400 text-black'
                : 'bg-blue-600 text-white shadow-blue-600/30 group-hover:bg-blue-700'
            }`}>
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight">HealthSense</span>
                <span className={`text-xs px-1.5 py-0.5 font-extrabold rounded tracking-wider ${
                  isHighContrast ? 'bg-yellow-300 text-black' : 'bg-emerald-500 text-white'
                }`}>
                  {t('cdssTag', 'AI CDSS')}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                {t('cdssFull', 'Clinical Decision Support System')}
              </p>
            </div>
          </button>
        </div>

        {/* Global Patient Search (Visible in Doctor or Patient Mode) */}
        {mode !== 'landing' && (
          <div className="hidden md:flex items-center relative flex-1 max-w-xs">
            <Search className="w-4 h-4 absolute left-3 text-slate-400" />
            <input
              type="text"
              placeholder={t('searchPlaceholder', 'Search patient, MRN, condition...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border transition focus:outline-none focus:ring-2 ${
                isHighContrast
                  ? 'bg-black border-yellow-400 text-yellow-300 focus:ring-yellow-400'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:ring-blue-500'
              }`}
            />
          </div>
        )}

        {/* Mode Switcher & Controls */}
        <div className="flex items-center gap-2">
          <div className={`p-1 rounded-xl flex items-center border ${
            isHighContrast
              ? 'bg-black border-yellow-400'
              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
          }`}>
            <button
              onClick={() => setMode('landing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                mode === 'landing'
                  ? isHighContrast
                    ? 'bg-yellow-400 text-black'
                    : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('landingMode', 'Home')}</span>
            </button>

            <button
              onClick={() => setMode('doctor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                mode === 'doctor'
                  ? isHighContrast
                    ? 'bg-yellow-400 text-black'
                    : 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>{t('doctorMode', 'Doctor Mode')}</span>
            </button>

            <button
              onClick={() => setMode('patient')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                mode === 'patient'
                  ? isHighContrast
                    ? 'bg-yellow-400 text-black'
                    : 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{t('patientMode', 'Patient Mode')}</span>
            </button>

            <button
              onClick={() => setMode('caregiver')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                mode === 'caregiver'
                  ? isHighContrast
                    ? 'bg-yellow-400 text-black'
                    : 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Heart className="w-3.5 h-3.5 fill-current text-purple-400" />
              <span>{t('caregiverMode', 'Caregiver Mode')}</span>
            </button>
          </div>

          {/* Active Patient Selector */}
          {mode !== 'landing' && (
            <div className="relative">
              <button
                onClick={() => {
                  setShowPatientMenu(!showPatientMenu);
                  setShowLangMenu(false);
                  setShowNotifications(false);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
                  isHighContrast
                    ? 'border-yellow-400 bg-black text-yellow-300'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750'
                }`}
              >
                <img
                  src={activePatient.avatar}
                  alt={activePatient.name}
                  className="w-6 h-6 rounded-full object-cover ring-1 ring-blue-500"
                />
                <div className="text-left hidden lg:block">
                  <p className="font-semibold text-slate-800 dark:text-slate-100 leading-none">
                    {activePatient.name}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{activePatient.mrn}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Patient Dropdown */}
              {showPatientMenu && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl shadow-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {t('switchPatient', 'Switch Active Patient')}
                    </p>
                  </div>

                  <div className="max-h-60 overflow-y-auto py-1">
                    {filteredPatients.map((pt) => (
                      <button
                        key={pt.id}
                        onClick={() => {
                          setActivePatient(pt);
                          setShowPatientMenu(false);
                        }}
                        className={`w-full px-3 py-2 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition cursor-pointer ${
                          activePatient.id === pt.id ? 'bg-blue-50 dark:bg-slate-700/80 font-medium' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={pt.avatar}
                            alt={pt.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{pt.name}</p>
                            <p className="text-[10px] text-slate-500">MRN: {pt.mrn} • Risk: {pt.riskLevel}</p>
                          </div>
                        </div>
                        {activePatient.id === pt.id && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                      </button>
                    ))}
                  </div>

                  <div className="p-2 border-t border-slate-100 dark:border-slate-700">
                    <button
                      onClick={() => {
                        setShowPatientMenu(false);
                        if (onOpenPatientRegistration) onOpenPatientRegistration();
                      }}
                      className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" />
                      ➕ Register New Patient / Input My Data
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MULTILINGUAL LANGUAGE SWITCHER DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => {
                setShowLangMenu(!showLangMenu);
                setShowPatientMenu(false);
                setShowNotifications(false);
              }}
              title={t('selectLanguage', 'Select Language')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border font-bold text-xs transition cursor-pointer ${
                isHighContrast
                  ? 'bg-black text-yellow-300 border-yellow-400'
                  : 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-900 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100'
              }`}
            >
              <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{currentLangOption.flag}</span>
              <span className="hidden sm:inline font-extrabold">{currentLangOption.nativeLabel}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl shadow-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    {t('selectLanguage', 'Select Language')}
                  </span>
                  <Globe className="w-3.5 h-3.5 text-indigo-500" />
                </div>

                <div className="p-1 space-y-0.5">
                  {supportedLanguages.map((lang) => {
                    const isActive = language === lang.code;
                    return (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setShowLangMenu(false);
                        }}
                        className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-left text-xs font-bold transition cursor-pointer ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{lang.flag}</span>
                          <div>
                            <p className="leading-tight">{lang.nativeLabel}</p>
                            <p className={`text-[9px] font-normal ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>
                              {lang.label}
                            </p>
                          </div>
                        </div>
                        {isActive && <Check className="w-4 h-4 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* High Contrast / Dark Mode Toggle */}
          <button
            onClick={() => setIsHighContrast(!isHighContrast)}
            title="Toggle High Contrast Mode"
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isHighContrast
                ? 'bg-yellow-400 text-black border-yellow-400'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {isHighContrast ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications Bell */}
          {mode !== 'landing' && (
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowLangMenu(false);
                  setShowPatientMenu(false);
                }}
                className={`p-2 rounded-xl border relative transition cursor-pointer ${
                  isHighContrast
                    ? 'bg-black text-yellow-300 border-yellow-400'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl shadow-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 z-50">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-700 pb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
                      <ShieldAlert className="w-4 h-4 text-red-500" />
                      <span>{t('alertStream', 'Clinical Alert Stream')}</span>
                    </div>
                    <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">
                      2 {t('unread', 'Unread')}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-100 dark:border-red-900/40">
                      <p className="font-semibold text-red-800 dark:text-red-300">{t('highHba1cAlert', 'High HbA1c Alert: Eleanor Vance')}</p>
                      <p className="text-[11px] text-red-600 dark:text-red-400">
                        Biomarker HbA1c reached 8.6%. CDSS recommends immediate regimen review.
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">10 mins ago</p>
                    </div>

                    <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-100 dark:border-amber-900/40">
                      <p className="font-semibold text-amber-800 dark:text-amber-300">{t('bpLogReminder', 'ECG Trace Pending Doctor Signoff')}</p>
                      <p className="text-[11px] text-amber-700 dark:text-amber-400">
                        David Miller's 12-lead ECG uploaded for AI interpretation.
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">1 hour ago</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

