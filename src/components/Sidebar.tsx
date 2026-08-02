import React from 'react';
import {
  LayoutDashboard,
  Users,
  ClipboardPlus,
  FileBarChart,
  Bot,
  Settings,
  HeartPulse,
  Lightbulb,
  History,
  User,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Presentation,
  Play,
  Pill,
  CalendarCheck,
  Utensils,
  Camera,
  Heart,
  Calendar,
  FileText,
  ShieldAlert,
  Clock,
  PhoneCall,
  Activity,
  CalendarClock,
  BarChart3,
  BrainCircuit,
  Watch,
  Brain,
  UserPlus,
  Layers,
} from 'lucide-react';
import { CaregiverTab, DoctorTab, Mode, Patient, PatientTab } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface SidebarProps {
  mode: Mode;
  doctorTab: DoctorTab;
  setDoctorTab: (tab: DoctorTab) => void;
  patientTab: PatientTab;
  setPatientTab: (tab: PatientTab) => void;
  caregiverTab?: CaregiverTab;
  setCaregiverTab?: (tab: CaregiverTab) => void;
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
  activePatient: Patient;
  isHighContrast: boolean;
  onOpenPatientRegistration?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ForwardRefExoticComponent<any>;
  badge?: string;
  isAi?: boolean;
  highlight?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  mode,
  doctorTab,
  setDoctorTab,
  patientTab,
  setPatientTab,
  caregiverTab = 'overview',
  setCaregiverTab,
  isCollapsed,
  setIsCollapsed,
  activePatient,
  isHighContrast,
  onOpenPatientRegistration,
}) => {
  const { t } = useLanguage();

  if (mode === 'landing') return null;

  const doctorNavItems: NavItem[] = [
    { id: 'demo', label: t('tabDemo', 'Demo Mode'), icon: Presentation, isAi: true, highlight: true, badge: 'DEMO' },
    { id: 'input-console', label: 'Multi-Modal Input Console', icon: Layers, isAi: true, highlight: true, badge: '6-Channels' },
    { id: 'early-warning', label: 'Early Warning Referral', icon: ShieldAlert, isAi: true, highlight: true, badge: 'Crisis' },
    { id: 'bluetooth-vitals', label: 'Live Smartwatch BLE', icon: Watch, isAi: true, highlight: true, badge: 'Live' },
    { id: 'xai-inspector', label: 'XAI Biomarker Inspector', icon: Brain, isAi: true, badge: 'SHAP' },
    { id: 'dashboard', label: t('tabDashboard', 'Dashboard'), icon: LayoutDashboard },
    { id: 'digital-health-twin', label: 'Digital Health Twin', icon: BrainCircuit, isAi: true, badge: 'Twin' },
    { id: 'population-analytics', label: 'Population Analytics', icon: BarChart3, isAi: true, badge: 'Public Health' },
    { id: 'patients', label: t('tabPatients', 'Patients'), icon: Users, badge: '5' },
    { id: 'drug-interaction-engine', label: 'Drug Interaction Engine', icon: ShieldAlert, isAi: true, badge: 'Rx Risk' },
    { id: 'follow-up-engine', label: t('tabFollowUp', 'Follow-up Engine'), icon: CalendarClock, isAi: true, badge: 'AI' },
    { id: 'food-scanner', label: t('tabFoodScanner', 'AI Food Scanner'), icon: Camera, isAi: true, badge: 'Scan' },
    { id: 'diet-planner', label: t('tabDietPlanner', 'Diet Plans'), icon: Utensils, isAi: true, badge: 'Diet' },
    { id: 'health-planner', label: t('tabHealthPlanner', 'Daily Tasks'), icon: CalendarCheck, isAi: true, badge: 'Daily' },
    { id: 'medications', label: t('tabMedications', 'Medicine Information'), icon: Pill, badge: 'Rx' },
    { id: 'guidelines', label: t('tabGuidelines', 'Clinical Guidelines'), icon: BookOpen, isAi: true, badge: '2026' },
    { id: 'new-assessment', label: 'New Assessment', icon: ClipboardPlus },
    { id: 'reports', label: t('tabReports', 'Reports'), icon: FileBarChart, badge: '3' },
    { id: 'ai-assistant', label: t('tabAiAssistant', 'AI Assistant'), icon: Bot, isAi: true },
    { id: 'settings', label: t('tabSettings', 'Settings'), icon: Settings },
  ];

  const patientNavItems: NavItem[] = [
    { id: 'smart-intake', label: 'Smart Intake', icon: Bot, isAi: true, highlight: true, badge: 'New' },
    { id: 'input-console', label: 'Multi-Modal Input Console', icon: Layers, isAi: true, highlight: true, badge: '6-Channels' },
    { id: 'bluetooth-vitals', label: 'Live Smartwatch BLE', icon: Watch, isAi: true, highlight: true, badge: 'Live' },
    { id: 'early-warning', label: 'Early Warning Alert', icon: ShieldAlert, isAi: true, badge: 'Crisis' },
    { id: 'xai-inspector', label: 'XAI Biomarker Inspector', icon: Brain, isAi: true, badge: 'SHAP' },
    { id: 'dashboard', label: t('tabDashboard', 'Dashboard'), icon: LayoutDashboard },
    { id: 'digital-health-twin', label: 'Digital Health Twin', icon: BrainCircuit, isAi: true, badge: 'Twin' },
    { id: 'population-analytics', label: 'Population Analytics', icon: BarChart3, isAi: true, badge: 'Public Health' },
    { id: 'drug-interaction-engine', label: 'Drug Interaction Engine', icon: ShieldAlert, isAi: true, badge: 'Rx Risk' },
    { id: 'follow-up-engine', label: t('tabFollowUp', 'Follow-up Engine'), icon: CalendarClock, isAi: true, badge: 'AI' },
    { id: 'food-scanner', label: t('tabFoodScanner', 'AI Food Scanner'), icon: Camera, isAi: true, badge: 'Scan' },
    { id: 'diet-planner', label: t('tabDietPlanner', 'Diet Plans'), icon: Utensils, isAi: true, badge: 'Diet' },
    { id: 'health-planner', label: t('tabHealthPlanner', 'Daily Tasks'), icon: CalendarCheck, isAi: true, badge: 'Daily' },
    { id: 'ai-companion', label: t('tabAiCompanion', 'AI Health Companion'), icon: Bot, isAi: true, badge: 'New' },
    { id: 'medications', label: t('tabMedications', 'Medicine Information'), icon: Pill, badge: 'Rx' },
    { id: 'my-health', label: t('tabMyHealth', 'My Health'), icon: HeartPulse },
    { id: 'reports', label: t('tabReports', 'Reports'), icon: FileBarChart },
    { id: 'recommendations', label: t('tabRecommendations', 'AI Recommendations'), icon: Lightbulb, isAi: true },
    { id: 'history', label: 'History', icon: History },
    { id: 'education', label: t('tabEducation', 'Patient Education'), icon: BookOpen },
    { id: 'profile', label: t('tabProfile', 'Profile'), icon: User },
  ];

  const caregiverNavItems: NavItem[] = [
    { id: 'overview', label: t('cgTabOverview', 'Care Overview'), icon: Activity },
    { id: 'adherence', label: t('cgTabAdherence', 'Medicine Adherence'), icon: Pill, badge: '92%' },
    { id: 'appointments', label: t('cgTabAppointments', 'Appointments'), icon: Calendar, badge: '2' },
    { id: 'tests-referrals', label: t('cgTabTestsReferrals', 'Pending Tests & Referrals'), icon: FileText, badge: '3' },
    { id: 'alerts', label: t('cgTabAlerts', 'Emergency Alerts'), icon: ShieldAlert, badge: 'Alert' },
    { id: 'tasks', label: t('cgTabTasks', 'Daily Tasks & Reminders'), icon: Clock },
    { id: 'contacts', label: t('cgTabContacts', 'Emergency Contacts'), icon: PhoneCall, badge: 'SOS' },
  ];

  const navItems = mode === 'doctor' ? doctorNavItems : mode === 'patient' ? patientNavItems : caregiverNavItems;
  const activeTab = mode === 'doctor' ? doctorTab : mode === 'patient' ? patientTab : caregiverTab;

  const handleTabClick = (id: string) => {
    if (mode === 'doctor') {
      setDoctorTab(id as DoctorTab);
    } else if (mode === 'patient') {
      setPatientTab(id as PatientTab);
    } else if (setCaregiverTab) {
      setCaregiverTab(id as CaregiverTab);
    }
  };

  return (
    <aside
      className={`relative flex flex-col h-[calc(100vh-4rem)] border-r transition-all duration-300 z-30 shrink-0 ${
        isCollapsed ? 'w-20' : 'w-64'
      } ${
        isHighContrast
          ? 'bg-[#071523] border-[#1A3E60] text-white'
          : 'bg-white dark:bg-[#071523] border-[#E5EEF8] dark:border-[#1A3E60]'
      }`}
    >
      {/* Collapse/Expand Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`absolute -right-3.5 top-6 z-40 w-7 h-7 rounded-full border flex items-center justify-center shadow-md transition ${
          isHighContrast
            ? 'bg-yellow-400 text-black border-yellow-400'
            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
        }`}
        title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Mode Header Indicator */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-white shadow-sm ${
              mode === 'doctor' ? 'bg-blue-600 shadow-blue-600/30' : 'bg-emerald-600 shadow-emerald-600/30'
            }`}
          >
            {mode === 'doctor' ? 'MD' : 'PT'}
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active Console
              </p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                {mode === 'doctor' ? 'Doctor Portal' : 'Patient Portal'}
              </p>
            </div>
          )}
        </div>

        {!isCollapsed && onOpenPatientRegistration && (
          <button
            onClick={onOpenPatientRegistration}
            className="w-full py-2 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>➕ Register / Input My Data</span>
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center px-0' : 'gap-3 px-3.5'
              } py-2.5 rounded-xl font-medium text-sm transition group relative ${
                isActive
                  ? isHighContrast
                    ? 'bg-yellow-400 text-black font-bold'
                    : mode === 'doctor'
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-semibold'
                  : isHighContrast
                  ? 'text-yellow-300 hover:bg-yellow-400/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-105 ${
                  isActive
                    ? isHighContrast
                      ? 'text-black'
                      : mode === 'doctor'
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                }`}
              />

              {!isCollapsed && <span className="truncate flex-1 text-left">{item.label}</span>}

              {!isCollapsed && item.badge && (
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {!isCollapsed && item.isAi && (
                <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-gradient-to-r from-blue-600 to-emerald-500 text-white rounded-full">
                  AI
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Pinned Active Patient Card at bottom */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                Active Record Context
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  activePatient.riskLevel === 'High'
                    ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                    : activePatient.riskLevel === 'Moderate'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                }`}
              >
                {activePatient.riskLevel}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <img
                src={activePatient.avatar}
                alt={activePatient.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/20"
              />
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                  {activePatient.name}
                </p>
                <p className="text-[10px] text-slate-500">
                  {activePatient.age} yrs • HbA1c {activePatient.vitals.hba1c}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
