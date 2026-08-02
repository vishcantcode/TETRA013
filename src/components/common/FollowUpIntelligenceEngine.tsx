import React, { useState } from 'react';
import {
  CalendarClock,
  Calendar,
  FileText,
  Pill,
  Stethoscope,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  Plus,
  Sparkles,
  Search,
  Filter,
  Check,
  Bell,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  ArrowRight,
  Info,
  RefreshCw,
  Printer,
  X,
  UserCheck,
} from 'lucide-react';
import {
  Patient,
  FollowUpItem,
  FollowUpCategory,
  FollowUpStatus,
  RiskLevel,
} from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface FollowUpIntelligenceEngineProps {
  activePatient: Patient;
  onUpdatePatient: (updatedPatient: Patient) => void;
  isDoctorMode?: boolean;
  isHighContrast?: boolean;
}

export const generateDefaultFollowUps = (patient: Patient): FollowUpItem[] => {
  const today = new Date();
  
  const formatDate = (offsetDays: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  const diseaseStr = patient.conditions && patient.conditions.length > 0
    ? patient.conditions.join(', ')
    : 'Type 2 Diabetes Mellitus & Essential Hypertension';

  const doctorDecisionStr = patient.pendingReferral
    ? `Re-evaluate clinical status & Specialist Referral (${patient.referralSpecialist || 'Endocrinology'}).`
    : 'Titrate glycemic & anti-hypertensive medication. Review home vitals log.';

  const prevReportStr = `HbA1c ${patient.vitals.hba1c || 8.2}%, BP ${patient.vitals.bpSystolic}/${patient.vitals.bpDiastolic} mmHg, Fasting Glucose ${patient.vitals.glucose} mg/dL`;

  return [
    {
      id: 'fu-101',
      category: 'Next Appointment',
      title: 'Endocrinology & Comprehensive Diabetes Review',
      dueDate: formatDate(14),
      time: '10:30 AM',
      status: 'Upcoming',
      priority: patient.riskLevel === 'High' ? 'High' : 'Medium',
      basedOnDisease: diseaseStr,
      basedOnRisk: patient.riskLevel,
      basedOnDoctorDecision: doctorDecisionStr,
      basedOnPreviousReport: prevReportStr,
      actionInstructions: 'Bring morning fingerstick glucose readings and home BP readings log book for the past 14 days.',
      doctorNotes: 'Assess target HbA1c < 7.0% progression and check for peripheral neuropathy symptoms.',
      reminderSent: true,
      reminderSentAt: 'Today at 09:00 AM',
    },
    {
      id: 'fu-102',
      category: 'Repeat Investigations',
      title: 'Fasting HbA1c, Lipid Panel & Renal Function (eGFR/Cr)',
      dueDate: formatDate(7),
      time: '08:00 AM',
      status: 'Upcoming',
      priority: 'High',
      basedOnDisease: diseaseStr,
      basedOnRisk: patient.riskLevel,
      basedOnDoctorDecision: 'Monitor renal creatinine and electrolyte safety profile following ACE inhibitor dose adjustment.',
      basedOnPreviousReport: `Previous HbA1c elevated at ${patient.vitals.hba1c || 8.6}%, LDL ${patient.vitals.ldl || 155} mg/dL.`,
      actionInstructions: 'Fast for 10-12 hours prior to lab draw. Water consumption permitted.',
      doctorNotes: 'Critical for evaluating drug efficacy and microvascular risk mitigation.',
      reminderSent: false,
    },
    {
      id: 'fu-103',
      category: 'Doctor Follow-up',
      title: 'Telehealth Blood Pressure Check-In & Symptom Tracking',
      dueDate: formatDate(-3), // Past due date -> Missed!
      time: '11:00 AM',
      status: 'Missed',
      priority: 'High',
      basedOnDisease: 'Stage 2 Hypertension & Cardiovascular Risk',
      basedOnRisk: patient.riskLevel,
      basedOnDoctorDecision: 'Confirm Systolic BP is stabilized below 140 mmHg post medication titration.',
      basedOnPreviousReport: `Baseline BP ${patient.vitals.bpSystolic}/${patient.vitals.bpDiastolic} mmHg (Elevated Stage 2).`,
      actionInstructions: 'Log 3 consecutive morning BP readings in the app before the call.',
      doctorNotes: 'Patient missed scheduled tele-consultation. Immediate reach-out recommended.',
      reminderSent: true,
      reminderSentAt: '3 days ago',
      missedAlertGenerated: true,
    },
    {
      id: 'fu-104',
      category: 'Medicine Review',
      title: 'Antidiabetic & Antihypertensive Dose & Side Effect Evaluation',
      dueDate: formatDate(21),
      time: '04:30 PM',
      status: 'Scheduled',
      priority: 'Medium',
      basedOnDisease: diseaseStr,
      basedOnRisk: patient.riskLevel,
      basedOnDoctorDecision: 'Review patient tolerance to Metformin XR and check for dry cough or dizziness from Lisinopril.',
      basedOnPreviousReport: 'Adherence rate 92%. 1 evening dose missed in last 14 days.',
      actionInstructions: 'Note any gastrointestinal symptoms, dizziness, or unusual muscle aches in the symptom logger.',
      reminderSent: false,
    },
    {
      id: 'fu-105',
      category: 'Risk Reassessment',
      title: 'CDSS Cardiovascular & Diabetes Complication Score Recalculation',
      dueDate: formatDate(28),
      time: '02:00 PM',
      status: 'Scheduled',
      priority: 'High',
      basedOnDisease: diseaseStr,
      basedOnRisk: patient.riskLevel,
      basedOnDoctorDecision: 'Automated AI Risk Engine re-scoring upon receipt of repeat lab findings.',
      basedOnPreviousReport: `Initial CDSS Assessment Risk Score: ${patient.riskScore || 84}/100 (${patient.riskLevel} Risk)`,
      actionInstructions: 'Engine will auto-compute risk trajectory once lab results are uploaded by diagnostic center.',
      reminderSent: false,
    },
    {
      id: 'fu-106',
      category: 'Doctor Follow-up',
      title: 'Initial Clinical Assessment & CDSS Baseline Screening',
      dueDate: formatDate(-10),
      time: '09:30 AM',
      status: 'Completed',
      priority: 'Medium',
      basedOnDisease: diseaseStr,
      basedOnRisk: patient.riskLevel,
      basedOnDoctorDecision: 'Establish baseline metabolic profile and start combination therapy.',
      basedOnPreviousReport: 'Initial screening completed in clinic.',
      actionInstructions: 'Completed in office. Patient informed of risk factors and care plan.',
      completedAt: formatDate(-10) + ' 10:15 AM',
      completionNotes: 'Patient attended appointment with spouse. Medication regimen established.',
      reminderSent: true,
    }
  ];
};

export const FollowUpIntelligenceEngine: React.FC<FollowUpIntelligenceEngineProps> = ({
  activePatient,
  onUpdatePatient,
  isDoctorMode = true,
  isHighContrast = false,
}) => {
  const { t } = useLanguage();

  // Initialize patient's follow-up list if not present
  const items: FollowUpItem[] = activePatient.followUpItems && activePatient.followUpItems.length > 0
    ? activePatient.followUpItems
    : generateDefaultFollowUps(activePatient);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(items[0]?.id || null);

  // Modal States
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [generationSuccessMessage, setGenerationSuccessMessage] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [reminderModalItem, setReminderModalItem] = useState<FollowUpItem | null>(null);
  const [reminderMethod, setReminderMethod] = useState<'whatsapp' | 'sms' | 'email' | 'app'>('whatsapp');
  const [reminderSuccessText, setReminderSuccessText] = useState<string | null>(null);
  
  const [completeModalItem, setCompleteModalItem] = useState<FollowUpItem | null>(null);
  const [completionNotesInput, setCompletionNotesInput] = useState<string>('');

  // Form state for adding new item
  const [newItem, setNewItem] = useState<{
    category: FollowUpCategory;
    title: string;
    dueDate: string;
    time: string;
    priority: 'High' | 'Medium' | 'Low';
    basedOnDisease: string;
    basedOnRisk: RiskLevel;
    basedOnDoctorDecision: string;
    basedOnPreviousReport: string;
    actionInstructions: string;
    doctorNotes: string;
  }>({
    category: 'Next Appointment',
    title: '',
    dueDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    time: '10:00 AM',
    priority: 'Medium',
    basedOnDisease: activePatient.conditions.join(', ') || 'Metabolic Condition',
    basedOnRisk: activePatient.riskLevel,
    basedOnDoctorDecision: 'Follow clinical guidelines and re-evaluate symptoms.',
    basedOnPreviousReport: `HbA1c ${activePatient.vitals.hba1c}%, BP ${activePatient.vitals.bpSystolic}/${activePatient.vitals.bpDiastolic}`,
    actionInstructions: 'Follow physician instructions prior to visit.',
    doctorNotes: '',
  });

  const updateFollowUpItems = (newItems: FollowUpItem[]) => {
    const updatedPatient: Patient = {
      ...activePatient,
      followUpItems: newItems,
    };
    onUpdatePatient(updatedPatient);
  };

  // Automated AI Regeneration
  const handleRegenerateSchedule = () => {
    setIsAiGenerating(true);
    setGenerationSuccessMessage(null);

    setTimeout(() => {
      const regenerated = generateDefaultFollowUps(activePatient);
      updateFollowUpItems(regenerated);
      setIsAiGenerating(false);
      setGenerationSuccessMessage('AI Follow-up Engine recalculated optimal follow-up schedules based on latest Disease, Risk Level, Doctor Decision & Previous Reports!');
      setTimeout(() => setGenerationSuccessMessage(null), 6000);
    }, 1200);
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesStatus =
      selectedStatus === 'All' ||
      (selectedStatus === 'Upcoming' && (item.status === 'Upcoming' || item.status === 'Scheduled')) ||
      (selectedStatus === 'Missed' && item.status === 'Missed') ||
      (selectedStatus === 'Completed' && item.status === 'Completed');

    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.basedOnDisease.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.basedOnDoctorDecision.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesStatus && matchesSearch;
  });

  // Category counts
  const missedCount = items.filter((i) => i.status === 'Missed').length;
  const upcomingCount = items.filter((i) => i.status === 'Upcoming' || i.status === 'Scheduled').length;
  const completedCount = items.filter((i) => i.status === 'Completed').length;

  const handleMarkComplete = (item: FollowUpItem) => {
    setCompleteModalItem(item);
    setCompletionNotesInput('');
  };

  const submitMarkComplete = () => {
    if (!completeModalItem) return;
    const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updated = items.map((i) => {
      if (i.id === completeModalItem.id) {
        return {
          ...i,
          status: 'Completed' as FollowUpStatus,
          completedAt: nowStr,
          completionNotes: completionNotesInput || 'Marked completed by clinical team.',
          missedAlertGenerated: false,
        };
      }
      return i;
    });

    updateFollowUpItems(updated);
    setCompleteModalItem(null);
  };

  const handleSendReminder = (item: FollowUpItem) => {
    setReminderModalItem(item);
    setReminderSuccessText(null);
  };

  const confirmSendReminder = () => {
    if (!reminderModalItem) return;
    const nowStr = 'Today at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updated = items.map((i) => {
      if (i.id === reminderModalItem.id) {
        return {
          ...i,
          reminderSent: true,
          reminderSentAt: nowStr,
        };
      }
      return i;
    });

    updateFollowUpItems(updated);
    setReminderSuccessText(`Reminder successfully sent via ${reminderMethod.toUpperCase()} to ${activePatient.name} & Caregiver!`);
    setTimeout(() => {
      setReminderSuccessText(null);
      setReminderModalItem(null);
    }, 2500);
  };

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.title) return;

    const created: FollowUpItem = {
      id: 'fu-' + Date.now(),
      category: newItem.category,
      title: newItem.title,
      dueDate: newItem.dueDate,
      time: newItem.time || '09:00 AM',
      status: 'Upcoming',
      priority: newItem.priority,
      basedOnDisease: newItem.basedOnDisease,
      basedOnRisk: newItem.basedOnRisk,
      basedOnDoctorDecision: newItem.basedOnDoctorDecision,
      basedOnPreviousReport: newItem.basedOnPreviousReport,
      actionInstructions: newItem.actionInstructions,
      doctorNotes: newItem.doctorNotes,
      reminderSent: false,
    };

    updateFollowUpItems([created, ...items]);
    setShowAddModal(false);
  };

  const getCategoryIcon = (cat: FollowUpCategory) => {
    switch (cat) {
      case 'Next Appointment':
        return <Calendar className="w-5 h-5 text-indigo-500" />;
      case 'Repeat Investigations':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'Medicine Review':
        return <Pill className="w-5 h-5 text-emerald-500" />;
      case 'Doctor Follow-up':
        return <Stethoscope className="w-5 h-5 text-purple-500" />;
      case 'Risk Reassessment':
        return <Activity className="w-5 h-5 text-amber-500" />;
      default:
        return <CalendarClock className="w-5 h-5 text-teal-500" />;
    }
  };

  const getStatusBadge = (status: FollowUpStatus) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </span>
        );
      case 'Missed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" />
            Missed Follow-up
          </span>
        );
      case 'Upcoming':
      case 'Scheduled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            <Clock className="w-3.5 h-3.5" />
            Upcoming
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER & AI INTELLIGENCE SUMMARY BANNER */}
      <div className={`rounded-3xl p-6 sm:p-8 border shadow-lg relative overflow-hidden transition-all ${
        isHighContrast
          ? 'bg-black border-yellow-400 text-yellow-300'
          : 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-slate-800'
      }`}>
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                AI Clinical Follow-up Intelligence
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                activePatient.riskLevel === 'High'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : activePatient.riskLevel === 'Moderate'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                {activePatient.riskLevel} Risk Patient ({activePatient.riskScore || 84}/100)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <CalendarClock className="w-8 h-8 text-indigo-400 shrink-0" />
              Follow-up Intelligence Engine
            </h1>

            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Automated clinical follow-up generator dynamically synthesizing patient's <strong className="text-white font-semibold">Disease Vector</strong>, <strong className="text-white font-semibold">CDSS Risk Profile</strong>, <strong className="text-white font-semibold">Doctor Decisions</strong>, and <strong className="text-white font-semibold">Previous Diagnostic Reports</strong>.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700">
                <UserCheck className="w-4 h-4 text-indigo-400" />
                Patient: <strong className="text-white ml-1">{activePatient.name} ({activePatient.age}y, {activePatient.gender})</strong>
              </span>
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700">
                <Stethoscope className="w-4 h-4 text-emerald-400" />
                Physician: <strong className="text-white ml-1">{activePatient.primaryDoctor}</strong>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={handleRegenerateSchedule}
              disabled={isAiGenerating}
              className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isAiGenerating ? 'animate-spin' : ''}`} />
              <span>{isAiGenerating ? 'Recalculating AI Schedule...' : 'Auto-Generate AI Schedule'}</span>
            </button>

            {isDoctorMode && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 backdrop-blur-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-indigo-300" />
                <span>Add Custom Follow-up</span>
              </button>
            )}
          </div>
        </div>

        {/* AI Regeneration Notification banner */}
        {generationSuccessMessage && (
          <div className="mt-6 p-4 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-200 text-xs font-medium flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>{generationSuccessMessage}</span>
            </div>
            <button
              onClick={() => setGenerationSuccessMessage(null)}
              className="text-indigo-300 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* CRITICAL ALERT BANNER FOR MISSED FOLLOW-UPS */}
      {missedCount > 0 && (
        <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-300 dark:border-rose-800 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-rose-900 dark:text-rose-200">
                  Critical Alert: {missedCount} Missed Follow-up Detected!
                </h3>
                <span className="px-2 py-0.5 text-[10px] uppercase font-extrabold bg-rose-600 text-white rounded-md">
                  Action Required
                </span>
              </div>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-1 leading-relaxed">
                Missed tele-consultation or repeat investigations increase acute complication risks for {activePatient.name}. Please send an immediate reminder or contact caregiver ({activePatient.caregiverName || 'Primary Caregiver'}).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
            <button
              onClick={() => {
                const missed = items.find((i) => i.status === 'Missed');
                if (missed) handleSendReminder(missed);
              }}
              className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span>Send Emergency Reminder</span>
            </button>
          </div>
        </div>
      )}

      {/* STATS OVERVIEW CARDS (5 CATEGORIES) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
        {/* Next Appointment */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Next Appointment</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {items.filter((i) => i.category === 'Next Appointment').length}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Doctor Consultations</span>
          </div>
        </div>

        {/* Repeat Investigations */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Repeat Investigations</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {items.filter((i) => i.category === 'Repeat Investigations').length}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Lab & Diagnostic Re-checks</span>
          </div>
        </div>

        {/* Medicine Review */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Medicine Review</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
              <Pill className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {items.filter((i) => i.category === 'Medicine Review').length}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Rx Adherence & Dose Adjust</span>
          </div>
        </div>

        {/* Doctor Follow-up */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Doctor Follow-up</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {items.filter((i) => i.category === 'Doctor Follow-up').length}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Tele-health & Clinic Check-ins</span>
          </div>
        </div>

        {/* Risk Reassessment */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Risk Reassessment</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {items.filter((i) => i.category === 'Risk Reassessment').length}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">CDSS Recalculations</span>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by title, disease, or doctor decision..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0 overflow-x-auto">
            {['All', 'Upcoming', 'Missed', 'Completed'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  selectedStatus === st
                    ? st === 'Missed'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {st === 'All' ? `All (${items.length})` : st === 'Upcoming' ? `Upcoming (${upcomingCount})` : st === 'Missed' ? `Missed (${missedCount})` : `Completed (${completedCount})`}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          {[
            'All',
            'Next Appointment',
            'Repeat Investigations',
            'Medicine Review',
            'Doctor Follow-up',
            'Risk Reassessment',
          ].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* CHRONOLOGICAL FOLLOW-UP TIMELINE */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-indigo-500" />
              Follow-up Action Timeline
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Chronological schedule built from Disease, CDSS Risk, Doctor Decisions, and Diagnostic Reports.
            </p>
          </div>

          <div className="text-xs font-semibold text-slate-500">
            Showing {filteredItems.length} of {items.length} Follow-ups
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No matching follow-ups found</h3>
            <p className="text-xs text-slate-500">Try clearing your search or category filters.</p>
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 space-y-8 before:content-[''] before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {filteredItems.map((item) => {
              const isExpanded = expandedItemId === item.id;
              const isMissed = item.status === 'Missed';
              const isCompleted = item.status === 'Completed';

              return (
                <div key={item.id} className="relative group">
                  {/* Timeline Dot Node */}
                  <div className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center text-white text-[10px] font-bold z-10 transition-transform group-hover:scale-110 ${
                    isMissed
                      ? 'bg-rose-600 border-rose-300 dark:border-rose-950 shadow-md shadow-rose-600/30 animate-pulse'
                      : isCompleted
                      ? 'bg-emerald-600 border-emerald-300 dark:border-emerald-950 shadow-md'
                      : 'bg-indigo-600 border-indigo-300 dark:border-indigo-950 shadow-md'
                  }`}>
                    {isCompleted ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : isMissed ? (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    ) : (
                      <Clock className="w-3.5 h-3.5" />
                    )}
                  </div>

                  {/* Main Follow-up Item Card */}
                  <div className={`rounded-2xl border transition-all ${
                    isMissed
                      ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60 shadow-sm'
                      : isCompleted
                      ? 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-90'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-800'
                  }`}>
                    {/* Card Header */}
                    <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                            {getCategoryIcon(item.category)}
                            {item.category}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                            item.priority === 'High'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {item.priority} Priority
                          </span>
                          {getStatusBadge(item.status)}
                        </div>

                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          {item.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                            <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Due: {item.dueDate}
                          </span>
                          {item.time && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" /> {item.time}
                            </span>
                          )}
                          {item.reminderSent && (
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                              <Bell className="w-3.5 h-3.5" /> Reminder Sent ({item.reminderSentAt || 'Yes'})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Header Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {!isCompleted && (
                          <button
                            onClick={() => handleSendReminder(item)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Send Reminder</span>
                          </button>
                        )}

                        {!isCompleted && (
                          <button
                            onClick={() => handleMarkComplete(item)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Mark Complete</span>
                          </button>
                        )}

                        <button
                          onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                          className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition cursor-pointer"
                        >
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* EXPANDABLE AI RATIONALE & DETAILS SECTION */}
                    {isExpanded && (
                      <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800/80 mt-2 space-y-4">
                        {/* 4 INPUT VECTORS REASONING BOX */}
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
                          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5" />
                            AI Generation Vector Drivers
                          </div>

                          <div className="grid sm:grid-cols-2 gap-3 text-xs">
                            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-1">
                              <span className="font-bold text-slate-700 dark:text-slate-300 block">Disease Condition:</span>
                              <p className="text-slate-600 dark:text-slate-400 leading-snug">{item.basedOnDisease}</p>
                            </div>

                            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-1">
                              <span className="font-bold text-slate-700 dark:text-slate-300 block">CDSS Risk Vector:</span>
                              <p className="text-slate-600 dark:text-slate-400 leading-snug">{item.basedOnRisk} Risk Rating</p>
                            </div>

                            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-1">
                              <span className="font-bold text-slate-700 dark:text-slate-300 block">Doctor Decision / Order:</span>
                              <p className="text-slate-600 dark:text-slate-400 leading-snug">{item.basedOnDoctorDecision}</p>
                            </div>

                            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-1">
                              <span className="font-bold text-slate-700 dark:text-slate-300 block">Previous Diagnostic Report:</span>
                              <p className="text-slate-600 dark:text-slate-400 leading-snug">{item.basedOnPreviousReport}</p>
                            </div>
                          </div>
                        </div>

                        {/* Action Instructions */}
                        {item.actionInstructions && (
                          <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                            <span className="font-bold flex items-center gap-1.5">
                              <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                              Actionable Patient Guidelines:
                            </span>
                            <p className="pl-5 leading-relaxed">{item.actionInstructions}</p>
                          </div>
                        )}

                        {/* Doctor Notes */}
                        {item.doctorNotes && (
                          <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                            <span className="font-bold text-slate-700 dark:text-slate-300">Clinical Notes:</span>
                            <p className="leading-relaxed bg-slate-100 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700">
                              {item.doctorNotes}
                            </p>
                          </div>
                        )}

                        {/* Completion Details if completed */}
                        {item.status === 'Completed' && (
                          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                            <span className="font-bold flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              Completed on {item.completedAt}
                            </span>
                            <p className="pl-5 leading-relaxed">{item.completionNotes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: SEND REMINDER */}
      {reminderModalItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Send Follow-up Reminder</h3>
                  <p className="text-xs text-slate-500">Dispatch instant notification to patient & family caregiver</p>
                </div>
              </div>
              <button
                onClick={() => setReminderModalItem(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">Follow-up Topic:</span>
              <p className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm">{reminderModalItem.title}</p>
              <div className="flex items-center gap-4 text-slate-500 pt-1">
                <span>Due Date: {reminderModalItem.dueDate}</span>
                <span>Category: {reminderModalItem.category}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Select Communication Channel:
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'whatsapp', label: 'WhatsApp Alert', icon: '💬' },
                  { id: 'sms', label: 'SMS Text Message', icon: '📱' },
                  { id: 'email', label: 'Email Notification', icon: '✉️' },
                  { id: 'app', label: 'In-App Push Banner', icon: '🔔' },
                ].map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setReminderMethod(ch.id as any)}
                    className={`p-3 rounded-xl border font-bold flex items-center gap-2 transition cursor-pointer ${
                      reminderMethod === ch.id
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <span>{ch.icon}</span>
                    <span>{ch.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {reminderSuccessText ? (
              <div className="p-3.5 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold text-center animate-fade-in">
                {reminderSuccessText}
              </div>
            ) : (
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setReminderModalItem(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSendReminder}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Reminder Now</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: MARK COMPLETE */}
      {completeModalItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Complete Follow-up Item</h3>
                  <p className="text-xs text-slate-500">Record completion outcome & clinical notes</p>
                </div>
              </div>
              <button
                onClick={() => setCompleteModalItem(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <span className="font-bold text-slate-800 dark:text-slate-200">{completeModalItem.title}</span>
              <p className="text-slate-500">Category: {completeModalItem.category}</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Completion Summary / Lab Outcome Notes:
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Patient attended consultation. HbA1c re-check came back 7.4% (Improved). BP 128/82 mmHg."
                value={completionNotesInput}
                onChange={(e) => setCompletionNotesInput(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setCompleteModalItem(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={submitMarkComplete}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Completed Status</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD CUSTOM FOLLOW-UP */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Create New Clinical Follow-up</h3>
                  <p className="text-xs text-slate-500">Add custom follow-up anchored to Disease, Risk, & Decisions</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewItem} className="space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">Category</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value as FollowUpCategory })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Next Appointment">Next Appointment</option>
                    <option value="Repeat Investigations">Repeat Investigations</option>
                    <option value="Medicine Review">Medicine Review</option>
                    <option value="Doctor Follow-up">Doctor Follow-up</option>
                    <option value="Risk Reassessment">Risk Reassessment</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">Priority Level</label>
                  <select
                    value={newItem.priority}
                    onChange={(e) => setNewItem({ ...newItem, priority: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">Follow-up Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Repeat HbA1c & Fasting Glucose Test"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newItem.dueDate}
                    onChange={(e) => setNewItem({ ...newItem, dueDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">Time (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 10:00 AM"
                    value={newItem.time}
                    onChange={(e) => setNewItem({ ...newItem, time: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* 4 INPUT VECTORS */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 block uppercase tracking-wider">
                  Anchor Vectors (Triggers)
                </span>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">Associated Disease</label>
                    <input
                      type="text"
                      value={newItem.basedOnDisease}
                      onChange={(e) => setNewItem({ ...newItem, basedOnDisease: e.target.value })}
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">Previous Report Vector</label>
                    <input
                      type="text"
                      value={newItem.basedOnPreviousReport}
                      onChange={(e) => setNewItem({ ...newItem, basedOnPreviousReport: e.target.value })}
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">Doctor Decision / Order</label>
                  <input
                    type="text"
                    value={newItem.basedOnDoctorDecision}
                    onChange={(e) => setNewItem({ ...newItem, basedOnDoctorDecision: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">Action Instructions for Patient</label>
                <textarea
                  rows={2}
                  value={newItem.actionInstructions}
                  onChange={(e) => setNewItem({ ...newItem, actionInstructions: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Follow-up</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
