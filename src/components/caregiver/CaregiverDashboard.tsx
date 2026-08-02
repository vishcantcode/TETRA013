import React, { useState } from 'react';
import {
  Heart,
  ShieldAlert,
  Pill,
  Calendar,
  FileText,
  PhoneCall,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  UserCheck,
  Bell,
  Lock,
  Shield,
  Info,
  X,
  ChevronRight,
  UserPlus,
  Building2,
  Sparkles,
  Check,
  Activity,
  ArrowUpRight,
  Stethoscope,
  Send,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  Award,
  CircleAlert,
} from 'lucide-react';
import {
  Patient,
  CaregiverTab,
  EmergencyContact,
  CaregiverReminder,
  CaregiverAlert,
  PendingTest,
  UpcomingReferral,
  UpcomingAppointment,
} from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface CaregiverDashboardProps {
  activePatient: Patient;
  caregiverTab: CaregiverTab;
  setCaregiverTab: (tab: CaregiverTab) => void;
  isHighContrast?: boolean;
  onUpdatePatient?: (updatedPatient: Patient) => void;
}

export const CaregiverDashboard: React.FC<CaregiverDashboardProps> = ({
  activePatient,
  caregiverTab,
  setCaregiverTab,
  isHighContrast = false,
  onUpdatePatient,
}) => {
  const { t } = useLanguage();

  // Local state for interactive features
  const [reminders, setReminders] = useState<CaregiverReminder[]>(
    activePatient.caregiverReminders || [
      {
        id: 'cr-1',
        time: '08:00 AM',
        title: "Check Fasting Blood Glucose",
        description: 'Ensure glucose meter reading is recorded in app before breakfast.',
        category: 'Vitals',
        completed: true,
        frequency: 'Daily',
      },
      {
        id: 'cr-2',
        time: '08:30 AM',
        title: "Confirm Morning Medication Intake",
        description: 'Metformin XR (1000mg) and Empagliflozin (10mg) after breakfast.',
        category: 'Medication',
        completed: true,
        frequency: 'Daily',
      },
      {
        id: 'cr-3',
        time: '02:00 PM',
        title: "Order Pharmacy Refill for Empagliflozin",
        description: 'Contact Walgreens Pharmacy (Rx #8841029) for home delivery.',
        category: 'Refill',
        completed: false,
        frequency: 'Once',
      },
      {
        id: 'cr-4',
        time: '08:00 PM',
        title: "Assist with Evening BP Measurement",
        description: 'Record sitting blood pressure after 5 minutes of rest.',
        category: 'Vitals',
        completed: false,
        frequency: 'Daily',
      },
    ]
  );

  const [contacts, setContacts] = useState<EmergencyContact[]>(
    activePatient.emergencyContacts || [
      {
        id: 'ec-1',
        name: 'Mark Vance',
        relation: 'Son (Primary Caregiver)',
        phone: '+1 (555) 234-5678',
        email: 'mark.vance@example.com',
        isPrimary: true,
        notes: 'Lives 10 minutes away. Holds medical power of attorney & key.',
      },
      {
        id: 'ec-2',
        name: 'Sarah Vance-Miller',
        relation: 'Daughter',
        phone: '+1 (555) 876-5432',
        email: 'sarah.vance@example.com',
        isPrimary: false,
        notes: 'Secondary emergency contact. Available weekends and evenings.',
      },
      {
        id: 'ec-3',
        name: 'Dr. Arthur Pendelton',
        relation: 'Primary Care Physician',
        phone: '+1 (555) 990-1122',
        email: 'dr.pendelton@cityhealth.org',
        isPrimary: false,
        notes: 'St. Jude Health Center - Suite 304. Direct nurse desk: ext 402.',
      },
      {
        id: 'ec-4',
        name: 'City General Emergency Room',
        relation: 'Local Hospital ER',
        phone: '911 / +1 (555) 911-0000',
        isPrimary: false,
        notes: 'Nearest ER distance: 2.5 miles. Ambulance dispatch station #4.',
      },
    ]
  );

  const [alerts, setAlerts] = useState<CaregiverAlert[]>(
    activePatient.caregiverAlerts || [
      {
        id: 'ca-1',
        date: '2026-07-30',
        severity: 'Warning',
        title: 'Missed Evening Medication Log',
        message: 'Night dose of Metformin XR was not confirmed by 09:30 PM.',
        resolved: true,
        resolvedAt: '2026-07-31 08:30 AM',
        category: 'Adherence',
      },
      {
        id: 'ca-2',
        date: '2026-07-28',
        severity: 'Critical',
        title: 'Elevated Morning BP Reading (150/96 mmHg)',
        message: 'Systolic blood pressure exceeded 145 mmHg threshold. EHR clinical note generated.',
        resolved: false,
        category: 'Vitals',
      },
      {
        id: 'ca-3',
        date: '2026-07-25',
        severity: 'Warning',
        title: 'Refill Alert: Empagliflozin (9 Days Remaining)',
        message: 'Stock running low. Order refill soon to prevent dose interruption.',
        resolved: false,
        category: 'Adherence',
      },
    ]
  );

  // New Reminder Modal
  const [showAddReminderModal, setShowAddReminderModal] = useState(false);
  const [newReminderTitle, setNewReminderTitle] = useState('');
  const [newReminderTime, setNewReminderTime] = useState('09:00 AM');
  const [newReminderCategory, setNewReminderCategory] = useState<'Medication' | 'Vitals' | 'Appointment' | 'Refill' | 'Daily Task'>('Medication');
  const [newReminderDesc, setNewReminderDesc] = useState('');

  // New Emergency Contact Modal
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactNotes, setNewContactNotes] = useState('');
  const [newContactPrimary, setNewContactPrimary] = useState(false);

  // Encouragement SMS notification toast state
  const [encouragementSent, setEncouragementSent] = useState(false);
  const [customEncouragement, setCustomEncouragement] = useState('');

  // Read-only clinical notice toggle modal
  const [showClinicalNoticeModal, setShowClinicalNoticeModal] = useState(false);

  // Toggle Reminder
  const toggleReminder = (id: string) => {
    const updated = reminders.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r));
    setReminders(updated);
    if (onUpdatePatient) {
      onUpdatePatient({ ...activePatient, caregiverReminders: updated });
    }
  };

  // Add Reminder
  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminderTitle.trim()) return;
    const newRem: CaregiverReminder = {
      id: `cr-${Date.now()}`,
      title: newReminderTitle,
      time: newReminderTime,
      category: newReminderCategory,
      description: newReminderDesc || 'Custom family caregiver reminder',
      completed: false,
      frequency: 'Daily',
    };
    const updated = [newRem, ...reminders];
    setReminders(updated);
    setShowAddReminderModal(false);
    setNewReminderTitle('');
    setNewReminderDesc('');
    if (onUpdatePatient) {
      onUpdatePatient({ ...activePatient, caregiverReminders: updated });
    }
  };

  // Add Emergency Contact
  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) return;
    const newCt: EmergencyContact = {
      id: `ec-${Date.now()}`,
      name: newContactName,
      relation: newContactRelation || 'Family Relative',
      phone: newContactPhone,
      email: newContactEmail,
      notes: newContactNotes,
      isPrimary: newContactPrimary,
    };
    const updated = newContactPrimary
      ? [newCt, ...contacts.map((c) => ({ ...c, isPrimary: false }))]
      : [...contacts, newCt];
    setContacts(updated);
    setShowAddContactModal(false);
    setNewContactName('');
    setNewContactRelation('');
    setNewContactPhone('');
    setNewContactEmail('');
    setNewContactNotes('');
    setNewContactPrimary(false);
    if (onUpdatePatient) {
      onUpdatePatient({ ...activePatient, emergencyContacts: updated });
    }
  };

  // Resolve Alert
  const resolveAlert = (id: string) => {
    const updated = alerts.map((a) =>
      a.id === id
        ? { ...a, resolved: true, resolvedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        : a
    );
    setAlerts(updated);
    if (onUpdatePatient) {
      onUpdatePatient({ ...activePatient, caregiverAlerts: updated });
    }
  };

  // Send Encouragement message
  const handleSendEncouragement = () => {
    setEncouragementSent(true);
    setTimeout(() => {
      setEncouragementSent(false);
      setCustomEncouragement('');
    }, 4000);
  };

  // Derived calculations
  const totalMeds = activePatient.medications.length;
  const takenMedsToday = activePatient.medications.filter((m) => m.takenToday).length;
  const adherencePercent = Math.round((takenMedsToday / (totalMeds || 1)) * 100);

  const pendingTestsCount = activePatient.pendingTests?.length || 3;
  const unresolvedAlerts = alerts.filter((a) => !a.resolved).length;
  const upcomingApptsCount = activePatient.upcomingAppointments?.length || 2;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Caregiver Portal Hero / Header Banner */}
      <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl relative overflow-hidden transition-all ${
        isHighContrast
          ? 'bg-black border-yellow-400 text-yellow-300'
          : 'bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white border-purple-500/30'
      }`}>
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 top-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <img
                src={activePatient.avatar}
                alt={activePatient.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-purple-400/30 shadow-2xl"
              />
              <span className="absolute -bottom-1 -right-1 p-1 bg-purple-500 text-white rounded-full ring-2 ring-slate-900" title="Caregiver Managed">
                <Heart className="w-3.5 h-3.5 fill-current" />
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  {t('familyCaregiverMode', 'Family Caregiver Portal')}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-400" />
                  {t('readOnlyClinicalNotice', 'Read-Only Clinical Safeguard')}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {t('monitoring', 'Monitoring')}: <span className="text-purple-300">{activePatient.name}</span>
              </h1>

              <p className="text-xs text-slate-300 flex items-center gap-2 flex-wrap">
                <span>{activePatient.age} {t('yrs', 'yrs')} • {activePatient.gender}</span>
                <span>•</span>
                <span>MRN: <strong className="text-white">{activePatient.mrn}</strong></span>
                <span>•</span>
                <span className="text-purple-200 font-semibold">{t('primaryDoctor', 'Doctor')}: {activePatient.primaryDoctor}</span>
              </p>
            </div>
          </div>

          {/* Quick Action Badges / Trigger Emergency Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => setShowClinicalNoticeModal(true)}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Info className="w-4 h-4 text-purple-400" />
              <span>{t('clinicalRecordInfo', 'Clinical Permissions Info')}</span>
            </button>

            <button
              onClick={() => {
                setCaregiverTab('contacts');
                alert(`🚨 SOS Emergency Protocol Activated for ${activePatient.name}. Contacting Primary Caregiver & Emergency Services.`);
              }}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-900/40 hover:scale-105 transition cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4 animate-bounce" />
              <span>{t('emergencySosBtn', 'Emergency SOS Alert')}</span>
            </button>
          </div>
        </div>

        {/* Clinical Protection Banner */}
        <div className="mt-6 pt-4 border-t border-purple-500/20 flex items-center justify-between gap-4 text-xs text-purple-200/90 flex-wrap">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Caregiver Role:</strong> Real-time monitoring, reminders, adherence logs, & emergency assistance. Clinical prescriptions and medical records are maintained strictly by licensed physicians.
            </span>
          </div>
          <button
            onClick={() => setShowClinicalNoticeModal(true)}
            className="text-[11px] font-bold text-purple-300 hover:underline shrink-0"
          >
            Learn about safety controls &rarr;
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'overview', label: t('cgTabOverview', 'Care Overview'), icon: Activity },
          { id: 'adherence', label: t('cgTabAdherence', 'Medicine Adherence'), icon: Pill, badge: `${adherencePercent}%` },
          { id: 'appointments', label: t('cgTabAppointments', 'Appointments'), icon: Calendar, badge: `${upcomingApptsCount}` },
          { id: 'tests-referrals', label: t('cgTabTestsReferrals', 'Pending Tests & Referrals'), icon: FileText, badge: `${pendingTestsCount}` },
          { id: 'alerts', label: t('cgTabAlerts', 'Emergency Alerts'), icon: ShieldAlert, badge: unresolvedAlerts > 0 ? `${unresolvedAlerts}` : undefined, badgeDanger: unresolvedAlerts > 0 },
          { id: 'tasks', label: t('cgTabTasks', 'Daily Tasks & Reminders'), icon: Clock },
          { id: 'contacts', label: t('cgTabContacts', 'Emergency Contacts'), icon: PhoneCall, badge: `${contacts.length}` },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = caregiverTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCaregiverTab(tab.id as CaregiverTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`px-2 py-0.5 text-[10px] rounded-full font-black ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : tab.badgeDanger
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW / DASHBOARD */}
      {/* ========================================================================= */}
      {caregiverTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metric Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Medicine Adherence Rate */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t('medAdherence', 'Medicine Adherence')}
                </span>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-600 flex items-center justify-center">
                  <Pill className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {adherencePercent}%
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                  {takenMedsToday} / {totalMeds} {t('dosesTaken', 'taken today')}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${adherencePercent}%` }} />
              </div>
            </div>

            {/* Card 2: Next Doctor Appointment */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t('nextAppointment', 'Next Appointment')}
                </span>
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  {activePatient.upcomingAppointments?.[0]?.doctorName || 'Dr. Arthur Pendelton'}
                </p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  {activePatient.upcomingAppointments?.[0]?.date || 'Aug 10, 2026'} at {activePatient.upcomingAppointments?.[0]?.time || '10:30 AM'}
                </p>
              </div>
              <button
                onClick={() => setCaregiverTab('appointments')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>{t('viewPrepDetails', 'View prep instructions')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card 3: Pending Tests & Referrals */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t('pendingLabReferrals', 'Pending Lab & Referrals')}
                </span>
                <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800 text-purple-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {pendingTestsCount}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {t('testsAnd', 'tests &')} {activePatient.upcomingReferrals?.length || 2} {t('referrals', 'referrals')}
                </span>
              </div>
              <button
                onClick={() => setCaregiverTab('tests-referrals')}
                className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
              >
                <span>{t('checkTestSchedule', 'Check test schedule')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card 4: Active Health Alerts */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t('activeAlerts', 'Active Alerts')}
                </span>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  unresolvedAlerts > 0
                    ? 'bg-red-50 dark:bg-red-950/80 border border-red-200 text-red-600 animate-pulse'
                    : 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600'
                }`}>
                  <ShieldAlert className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-extrabold ${unresolvedAlerts > 0 ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>
                  {unresolvedAlerts}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {unresolvedAlerts === 1 ? t('unresolvedAlert', 'requires attention') : t('unresolvedAlerts', 'require attention')}
                </span>
              </div>
              <button
                onClick={() => setCaregiverTab('alerts')}
                className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
              >
                <span>{t('reviewAlertLog', 'Review alert log')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Vitals Trajectory Chart & Quick Reminders Section */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Loved One Vitals Progress Chart (2 Cols) */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    <span>{t('vitalsTrendTitle', '7-Day Blood Pressure & Glucose Trend')}</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('vitalsTrendSub', "Longitudinal readings recorded by patient or home health device")}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{t('stableTrend', 'BP Stabilizing')}</span>
                </span>
              </div>

              {/* Recharts Area Chart */}
              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activePatient.weeklyVitalsHistory}>
                    <defs>
                      <linearGradient id="colorBpCg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorGlucCg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} domain={[60, 200]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="bpSystolic"
                      name="Systolic BP (mmHg)"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorBpCg)"
                    />
                    <Area
                      type="monotone"
                      dataKey="glucose"
                      name="Glucose (mg/dL)"
                      stroke="#10b981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorGlucCg)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Caregiver AI Insights Box */}
              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs text-purple-950 dark:text-purple-200">
                  <p className="font-extrabold">{t('cgAiObservation', 'Caregiver AI Observation:')}</p>
                  <p className="leading-relaxed">
                    {activePatient.name}'s Systolic BP dropped from 152 mmHg to 142 mmHg following medication timing adjustments. Glucose levels remain moderately elevated (average 175 mg/dL). Ensure pre-meal Empagliflozin is taken consistently.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Caregiver Reminders Sidebar (1 Col) */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <span>{t('todayReminders', "Today's Caregiver Checklist")}</span>
                  </h3>
                  <button
                    onClick={() => setShowAddReminderModal(true)}
                    className="p-1.5 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 hover:bg-purple-200 transition cursor-pointer"
                    title="Add Reminder"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  {reminders.slice(0, 4).map((rem) => (
                    <div
                      key={rem.id}
                      onClick={() => toggleReminder(rem.id)}
                      className={`p-3 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                        rem.completed
                          ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 opacity-60'
                          : 'bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800/60 hover:bg-purple-50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${
                        rem.completed
                          ? 'bg-purple-600 border-purple-600 text-white'
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                      }`}>
                        {rem.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-xs font-bold leading-tight truncate ${rem.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>
                            {rem.title}
                          </p>
                          <span className="text-[10px] font-bold text-slate-400 shrink-0">{rem.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          {rem.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Encouragement SMS / Message to Patient */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
                  <span>{t('sendEncouragement', 'Send Love & Encouragement')}</span>
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g., Proud of you taking your meds today, Mom!"
                    value={customEncouragement}
                    onChange={(e) => setCustomEncouragement(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={handleSendEncouragement}
                    className="p-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition cursor-pointer shrink-0"
                    title="Send SMS"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
                {encouragementSent && (
                  <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                    ✓ Encouragement message sent to {activePatient.name}'s phone!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MEDICINE ADHERENCE */}
      {/* ========================================================================= */}
      {caregiverTab === 'adherence' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Pill className="w-6 h-6 text-purple-600" />
                <span>{t('medAdherenceTracker', 'Medication Adherence & Refill Status')}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {t('medAdherenceSub', "Track daily dose completion, historical logs, and pharmacy refill schedules")}
              </p>
            </div>

            <span className="px-3 py-1.5 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-black border border-purple-200 dark:border-purple-800 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              <span>{adherencePercent}% Weekly Adherence Rate</span>
            </span>
          </div>

          {/* Today's Medication Dose Matrix */}
          <div className="grid md:grid-cols-2 gap-4">
            {activePatient.medications.map((med) => (
              <div
                key={med.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{med.name}</h3>
                      <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-bold">
                        {med.strength}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {med.frequency} • <strong className="text-purple-600 dark:text-purple-400">{med.timing}</strong>
                    </p>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-black shrink-0 ${
                    med.takenToday
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200'
                  }`}>
                    {med.takenToday ? 'Dose Taken Today' : 'Pending Intake'}
                  </span>
                </div>

                {/* Dose slots breakdown */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                  <div className={`p-2.5 rounded-2xl border text-xs ${
                    med.schedule.morning
                      ? med.takenTimesToday?.morning
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 text-emerald-800 dark:text-emerald-200'
                        : 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 text-amber-800'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-40 text-slate-400'
                  }`}>
                    <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Morning</p>
                    <p className="font-black mt-0.5">
                      {med.schedule.morning ? (med.takenTimesToday?.morning ? '✓ Taken' : 'Pending') : 'N/A'}
                    </p>
                  </div>

                  <div className={`p-2.5 rounded-2xl border text-xs ${
                    med.schedule.afternoon
                      ? med.takenTimesToday?.afternoon
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 text-emerald-800 dark:text-emerald-200'
                        : 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 text-amber-800'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-40 text-slate-400'
                  }`}>
                    <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Afternoon</p>
                    <p className="font-black mt-0.5">
                      {med.schedule.afternoon ? (med.takenTimesToday?.afternoon ? '✓ Taken' : 'Pending') : 'N/A'}
                    </p>
                  </div>

                  <div className={`p-2.5 rounded-2xl border text-xs ${
                    med.schedule.night
                      ? med.takenTimesToday?.night
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 text-emerald-800 dark:text-emerald-200'
                        : 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 text-amber-800'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-40 text-slate-400'
                  }`}>
                    <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Night</p>
                    <p className="font-black mt-0.5">
                      {med.schedule.night ? (med.takenTimesToday?.night ? '✓ Taken' : 'Pending') : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Refill status & Pharmacy alert */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs gap-3">
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-700 dark:text-slate-200">
                      Refill Remaining: <strong className="text-purple-600">{med.refillPillsRemaining ?? 14} pills</strong>
                    </p>
                    <p className="text-[10px] text-slate-400">Refill due: {med.refillDate || 'Aug 15, 2026'}</p>
                  </div>

                  <button
                    onClick={() => alert(`📦 Pharmacy refill request triggered for ${med.name} (${med.strength}) to Walgreens Pharmacy.`)}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] shadow-sm transition cursor-pointer shrink-0"
                  >
                    Request Refill
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Historical Logs List */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600" />
              <span>{t('recentAdherenceLogs', 'Recent Dose Logs & Timestamps')}</span>
            </h3>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {[
                { date: '2026-08-01', time: '08:15 AM', med: 'Metformin XR 1000mg', slot: 'Morning', status: 'taken', caregiverChecked: true },
                { date: '2026-08-01', time: '07:50 AM', med: 'Empagliflozin 10mg', slot: 'Morning', status: 'taken', caregiverChecked: true },
                { date: '2026-07-31', time: '09:40 PM', med: 'Atorvastatin 40mg', slot: 'Night', status: 'taken', caregiverChecked: false },
                { date: '2026-07-30', time: '08:10 PM', med: 'Metformin XR 1000mg', slot: 'Night', status: 'missed', caregiverChecked: false },
              ].map((log, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      log.status === 'taken'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950'
                        : 'bg-red-100 text-red-700 dark:bg-red-950'
                    }`}>
                      {log.status === 'taken' ? <Check className="w-4 h-4 stroke-[3]" /> : <AlertTriangle className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100">{log.med}</p>
                      <p className="text-[11px] text-slate-400">{log.date} at {log.time} ({log.slot} slot)</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full font-black text-[10px] ${
                    log.status === 'taken'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {log.status === 'taken' ? '✓ Taken' : '⚠️ Dose Missed'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: APPOINTMENTS */}
      {/* ========================================================================= */}
      {caregiverTab === 'appointments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-6 h-6 text-purple-600" />
                <span>{t('upcomingAppointmentsTitle', 'Doctor Appointments & Visits')}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {t('appointmentsSub', "Upcoming consultations, clinic directions, and preparation checklists")}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {(activePatient.upcomingAppointments || [
              {
                id: 'apt-1',
                doctorName: 'Dr. Arthur Pendelton',
                specialty: 'Primary Care Physician',
                date: '2026-08-10',
                time: '10:30 AM',
                location: 'City Health Center - Suite 304',
                purpose: 'Bi-Monthly Diabetes & BP Regimen Follow-up',
                status: 'Confirmed',
                prepInstructions: 'Bring morning blood glucose log book and home BP cuff readings from past 14 days.',
                clinicPhone: '+1 (555) 990-1122',
              },
              {
                id: 'apt-2',
                doctorName: 'Dr. Meera Sharma',
                specialty: 'Endocrinology Specialist',
                date: '2026-08-22',
                time: '02:00 PM',
                location: 'Endocrine Specialty Institute - Building B',
                purpose: 'Specialist Consultation for Glycemic Control',
                status: 'Confirmed',
                prepInstructions: 'Bring recent HbA1c lab report and complete list of current medications.',
                clinicPhone: '+1 (555) 432-1000',
              },
            ]).map((apt) => (
              <div
                key={apt.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      {apt.specialty}
                    </span>
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">{apt.doctorName}</h3>
                    <p className="text-xs text-slate-500">{apt.purpose}</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 text-center shrink-0 border border-purple-200">
                    <p className="text-[10px] font-black uppercase tracking-wider">Date</p>
                    <p className="text-sm font-extrabold">{apt.date}</p>
                    <p className="text-[10px] font-bold text-slate-500">{apt.time}</p>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <MapPin className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>{apt.location}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Clinic Direct Phone: <strong className="text-slate-900 dark:text-white">{apt.clinicPhone}</strong></span>
                  </div>

                  {apt.prepInstructions && (
                    <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 space-y-1">
                      <p className="font-bold flex items-center gap-1 text-[11px]">
                        <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Caregiver Prep Instructions:</span>
                      </p>
                      <p className="text-[11px] leading-relaxed">{apt.prepInstructions}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => alert(`📱 Added appointment with ${apt.doctorName} on ${apt.date} to your phone calendar.`)}
                    className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Add to Calendar</span>
                  </button>

                  <a
                    href={`tel:${apt.clinicPhone}`}
                    className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Call Clinic</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PENDING TESTS & REFERRALS */}
      {/* ========================================================================= */}
      {caregiverTab === 'tests-referrals' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-purple-600" />
              <span>{t('pendingTestsAndReferrals', 'Pending Tests & Specialist Referrals')}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t('testsReferralsSub', "Monitor ordered lab tests, diagnostic imaging, and active specialist referral status")}
            </p>
          </div>

          {/* Pending Tests Section */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-purple-500" />
              <span>Ordered Diagnostic & Lab Tests</span>
            </h3>

            <div className="grid md:grid-cols-3 gap-4">
              {(activePatient.pendingTests || [
                {
                  id: 'pt-1',
                  testName: 'HbA1c & Fasting Lipid Profile',
                  category: 'Lab Test',
                  orderedBy: 'Dr. Arthur Pendelton',
                  dueDate: '2026-08-05',
                  status: 'Scheduled',
                  instructions: 'Fasting required for 10-12 hours prior to lab blood draw. Drink water normally.',
                  facilityLocation: 'Quest Diagnostics - Main Street Branch',
                },
                {
                  id: 'pt-2',
                  testName: 'Urine Albumin-to-Creatinine Ratio (uACR)',
                  category: 'Lab Test',
                  orderedBy: 'Dr. Arthur Pendelton',
                  dueDate: '2026-08-08',
                  status: 'Pending Sample',
                  instructions: 'First morning urine sample container provided.',
                  facilityLocation: 'City Health Lab',
                },
                {
                  id: 'pt-3',
                  testName: 'Dilated Retinal Eye Screening',
                  category: 'Specialist Screening',
                  orderedBy: 'Dr. Arthur Pendelton',
                  dueDate: '2026-08-15',
                  status: 'Scheduled',
                  instructions: 'Dilating drops will blur vision for 2-3 hours. Caregiver escort required to drive home.',
                  facilityLocation: 'VisionCare Specialists Clinic',
                },
              ]).map((test) => (
                <div key={test.id} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                      {test.category}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      Due: {test.dueDate}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white leading-snug">
                    {test.testName}
                  </h4>

                  <p className="text-xs text-slate-500">
                    Ordered by: <strong>{test.orderedBy}</strong>
                  </p>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                    <p className="font-bold text-[11px] text-purple-600">Instructions for Patient:</p>
                    <p className="text-[11px] leading-relaxed">{test.instructions}</p>
                    {test.facilityLocation && (
                      <p className="text-[10px] font-semibold text-slate-400 mt-1">
                        Location: {test.facilityLocation}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Specialist Referrals Section */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-500" />
              <span>Upcoming Specialist Referrals</span>
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              {(activePatient.upcomingReferrals || [
                {
                  id: 'ref-101',
                  specialty: 'Endocrinology & Diabetes Care',
                  specialistName: 'Dr. Meera Sharma, MD',
                  reason: 'Uncontrolled Type 2 Diabetes (HbA1c 8.6%) & Insulin Sensitivity Optimization',
                  status: 'Authorized',
                  appointmentDate: '2026-08-22',
                  clinicPhone: '+1 (555) 432-1000',
                  urgency: 'Urgent',
                  referralId: 'REF-2026-8819',
                },
                {
                  id: 'ref-102',
                  specialty: 'Cardiology (Hypertension Specialist)',
                  specialistName: 'Dr. Robert Lawson, MD',
                  reason: 'Stage 2 Hypertension (148/94 mmHg average) & Cardiorenal Risk Assessment',
                  status: 'Action Needed',
                  clinicPhone: '+1 (555) 321-9988',
                  urgency: 'Routine',
                  referralId: 'REF-2026-9041',
                },
              ]).map((ref) => (
                <div key={ref.id} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-400">Referral ID: {ref.referralId}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                      ref.status === 'Authorized'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      Status: {ref.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-lg text-slate-900 dark:text-white">
                      {ref.specialty}
                    </h4>
                    {ref.specialistName && (
                      <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mt-0.5">
                        {ref.specialistName}
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <strong>Clinical Reason:</strong> {ref.reason}
                  </p>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="font-bold text-slate-500">
                      Clinic Contact: {ref.clinicPhone}
                    </span>
                    <a
                      href={`tel:${ref.clinicPhone}`}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition"
                    >
                      Call Specialist
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: EMERGENCY ALERTS */}
      {/* ========================================================================= */}
      {caregiverTab === 'alerts' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-red-500" />
                <span>{t('emergencyAlertsLog', 'Emergency Alerts & Critical Health Events')}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {t('emergencyAlertsSub', "Historical and active health alerts generated by CDSS monitors or vitals thresholds")}
              </p>
            </div>

            <button
              onClick={() => {
                setCaregiverTab('contacts');
                alert(`🚨 SOS Emergency Call triggered for ${activePatient.name}`);
              }}
              className="px-4 py-2 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-900/30 transition cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 animate-pulse" />
              <span>Contact Emergency Contacts</span>
            </button>
          </div>

          <div className="space-y-3">
            {alerts.map((alertItem) => (
              <div
                key={alertItem.id}
                className={`p-5 rounded-3xl border transition shadow-sm space-y-3 ${
                  alertItem.resolved
                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-80'
                    : alertItem.severity === 'Critical'
                    ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/60'
                    : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      alertItem.severity === 'Critical'
                        ? 'bg-red-500 text-white'
                        : 'bg-amber-500 text-white'
                    }`}>
                      <AlertTriangle className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          alertItem.severity === 'Critical' ? 'bg-red-200 text-red-900' : 'bg-amber-200 text-amber-900'
                        }`}>
                          {alertItem.severity}
                        </span>
                        <span className="text-xs font-bold text-slate-400">{alertItem.date}</span>
                      </div>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-0.5">
                        {alertItem.title}
                      </h3>
                    </div>
                  </div>

                  {!alertItem.resolved ? (
                    <button
                      onClick={() => resolveAlert(alertItem.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition cursor-pointer shrink-0"
                    >
                      Mark Resolved
                    </button>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Resolved ({alertItem.resolvedAt || 'Acknowledged'})
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pl-13">
                  {alertItem.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: DAILY TASKS & REMINDERS MANAGER */}
      {/* ========================================================================= */}
      {caregiverTab === 'tasks' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-6 h-6 text-purple-600" />
                <span>{t('caregiverRemindersTitle', 'Daily Tasks & Caregiver Reminders')}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {t('caregiverRemindersSub', "Create and manage custom family reminders for medications, vitals logs, and clinic prep")}
              </p>
            </div>

            <button
              onClick={() => setShowAddReminderModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t('addCaregiverReminder', 'Add Custom Reminder')}</span>
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {reminders.map((rem) => (
              <div
                key={rem.id}
                className={`p-5 rounded-3xl border transition shadow-sm space-y-3 ${
                  rem.completed
                    ? 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60'
                    : 'bg-white dark:bg-slate-900 border-purple-200 dark:border-purple-800/80 hover:border-purple-400'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleReminder(rem.id)}
                      className={`w-6 h-6 rounded-xl border flex items-center justify-center transition cursor-pointer ${
                        rem.completed
                          ? 'bg-purple-600 border-purple-600 text-white'
                          : 'border-slate-300 bg-white dark:bg-slate-800 hover:border-purple-400'
                      }`}
                    >
                      {rem.completed && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                        {rem.category}
                      </span>
                      <h3 className={`font-extrabold text-base mt-1 ${rem.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                        {rem.title}
                      </h3>
                    </div>
                  </div>

                  <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-2.5 py-1 rounded-xl">
                    {rem.time}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-9">
                  {rem.description}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 pl-9">
                  <span>Frequency: <strong>{rem.frequency}</strong></span>
                  <span>Set by: Family Caregiver</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: EMERGENCY CONTACTS */}
      {/* ========================================================================= */}
      {caregiverTab === 'contacts' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <PhoneCall className="w-6 h-6 text-purple-600" />
                <span>{t('emergencyContactsTitle', 'Family & Emergency Contacts Network')}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {t('emergencyContactsSub', "Authorized family members, primary doctor, and local hospital emergency services")}
              </p>
            </div>

            <button
              onClick={() => setShowAddContactModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{t('addEmergencyContact', 'Add Emergency Contact')}</span>
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {contacts.map((ct) => (
              <div
                key={ct.id}
                className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border shadow-sm space-y-4 relative ${
                  ct.isPrimary
                    ? 'border-purple-500 dark:border-purple-500 ring-2 ring-purple-500/20'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {ct.isPrimary && (
                  <span className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-500 text-white tracking-wider">
                    Primary Caregiver
                  </span>
                )}

                <div className="space-y-1">
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">{ct.name}</h3>
                  <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">{ct.relation}</p>
                </div>

                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{ct.phone}</span>
                  </div>

                  {ct.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                      <span>{ct.email}</span>
                    </div>
                  )}

                  {ct.notes && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl mt-1">
                      {ct.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <a
                    href={`tel:${ct.phone.replace(/[^0-9+]/g, '')}`}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call Now</span>
                  </a>

                  <a
                    href={`https://wa.me/${ct.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD CAREGIVER REMINDER */}
      {/* ========================================================================= */}
      {showAddReminderModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-600" />
                <span>New Family Caregiver Reminder</span>
              </h3>
              <button
                onClick={() => setShowAddReminderModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddReminder} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Reminder Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Remind Mom to check glucose level"
                  value={newReminderTitle}
                  onChange={(e) => setNewReminderTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Scheduled Time
                  </label>
                  <input
                    type="text"
                    value={newReminderTime}
                    onChange={(e) => setNewReminderTime(e.target.value)}
                    placeholder="e.g., 08:30 AM"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newReminderCategory}
                    onChange={(e) => setNewReminderCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Medication">Medication</option>
                    <option value="Vitals">Vitals</option>
                    <option value="Appointment">Appointment</option>
                    <option value="Refill">Refill</option>
                    <option value="Daily Task">Daily Task</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional instructions for loved one..."
                  value={newReminderDesc}
                  onChange={(e) => setNewReminderDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddReminderModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold shadow-md transition"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD EMERGENCY CONTACT */}
      {/* ========================================================================= */}
      {showAddContactModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-600" />
                <span>Add Emergency Contact</span>
              </h3>
              <button
                onClick={() => setShowAddContactModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddContact} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Sarah Vance-Miller"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Relationship *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Daughter, Neighbor, Doctor"
                    value={newContactRelation}
                    onChange={(e) => setNewContactRelation(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="sarah@example.com"
                  value={newContactEmail}
                  onChange={(e) => setNewContactEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Notes / Address / Access
                </label>
                <input
                  type="text"
                  placeholder="e.g. Has door key, available evenings"
                  value={newContactNotes}
                  onChange={(e) => setNewContactNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="primaryCb"
                  checked={newContactPrimary}
                  onChange={(e) => setNewContactPrimary(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="primaryCb" className="font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Set as Primary Emergency Contact
                </label>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddContactModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold shadow-md transition"
                >
                  Add Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CLINICAL PERMISSIONS INFO MODAL */}
      {/* ========================================================================= */}
      {showClinicalNoticeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  Clinical Governance & Read-Only Policy
                </h3>
              </div>
              <button
                onClick={() => setShowClinicalNoticeModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                <strong>Family Caregiver Mode</strong> is designed to support loved ones with non-intrusive monitoring, dosage adherence tracking, calendar sync, and emergency contact tools.
              </p>

              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1">
                <p className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Allowed Caregiver Actions:</span>
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-emerald-900 dark:text-emerald-200 pl-1">
                  <li>Monitor daily dose intake & mark caregiver checklist items</li>
                  <li>Set family reminders & send SMS encouragement</li>
                  <li>View doctor appointments, prep requirements, and pending labs</li>
                  <li>Manage emergency contacts & trigger SOS emergency protocols</li>
                  <li>Request pharmacy refills for low-supply prescriptions</li>
                </ul>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-1">
                <p className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-amber-600" />
                  <span>Restricted Clinical Actions (Read-Only):</span>
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-amber-900 dark:text-amber-200 pl-1">
                  <li>Modifying prescribed medication dosages or schedules</li>
                  <li>Editing primary doctor clinical diagnostic notes</li>
                  <li>Altering CDSS disease risk calculation algorithms</li>
                  <li>Signing off or changing specialist referrals</li>
                </ul>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowClinicalNoticeModal(false)}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md transition"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
