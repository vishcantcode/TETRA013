import React, { useState } from 'react';
import {
  Pill,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Bell,
  Plus,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  ChevronRight,
  Filter,
  Check,
  X,
  FileText,
  User,
  Activity,
  Award,
  Sun,
  Sunset,
  Moon,
  Utensils,
  AlertCircle,
  TrendingUp,
  Edit2,
  Trash2,
  BellOff,
  History,
} from 'lucide-react';
import { Patient, FullMedication, Mode, DoseSchedule, MedicationHistoryLog } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface MedicineManagementProps {
  mode: Mode; // 'doctor' or 'patient'
  activePatient: Patient;
  onUpdatePatientMedications: (updatedMeds: FullMedication[]) => void;
}

export const MedicineManagement: React.FC<MedicineManagementProps> = ({
  mode,
  activePatient,
  onUpdatePatientMedications,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'checklist' | 'cards' | 'history'>('checklist');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [filterSlot, setFilterSlot] = useState<'all' | 'Morning' | 'Afternoon' | 'Night'>('all');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'taken' | 'missed'>('all');

  // Form State for Doctor's Add Medicine Modal
  const [newMedName, setNewMedName] = useState('');
  const [newMedStrength, setNewMedStrength] = useState('');
  const [newSchedule, setNewSchedule] = useState<DoseSchedule>({
    morning: true,
    afternoon: false,
    night: true,
  });
  const [newTiming, setNewTiming] = useState<'Before Food' | 'After Food' | 'With Food'>('After Food');
  const [newDuration, setNewDuration] = useState('90 Days');
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEndDate, setNewEndDate] = useState(
    new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [newPurpose, setNewPurpose] = useState('');
  const [newSideEffects, setNewSideEffects] = useState('');
  const [newRefillReminder, setNewRefillReminder] = useState(true);
  const [newRefillPills, setNewRefillPills] = useState('30');
  const [newMissedReminder, setNewMissedReminder] = useState(true);
  const [newReminderTime, setNewReminderTime] = useState('08:00 AM');

  const medications = activePatient.medications || [];

  // 1. Calculate Adherence Statistics
  let totalPrescribedSlotDosesToday = 0;
  let totalTakenSlotDosesToday = 0;

  medications.forEach((med) => {
    if (med.schedule.morning) {
      totalPrescribedSlotDosesToday++;
      if (med.takenTimesToday?.morning) totalTakenSlotDosesToday++;
    }
    if (med.schedule.afternoon) {
      totalPrescribedSlotDosesToday++;
      if (med.takenTimesToday?.afternoon) totalTakenSlotDosesToday++;
    }
    if (med.schedule.night) {
      totalPrescribedSlotDosesToday++;
      if (med.takenTimesToday?.night) totalTakenSlotDosesToday++;
    }
  });

  const todayAdherencePct =
    totalPrescribedSlotDosesToday > 0
      ? Math.round((totalTakenSlotDosesToday / totalPrescribedSlotDosesToday) * 100)
      : 100;

  // Pills running low count
  const lowRefillCount = medications.filter(
    (m) => m.refillPillsRemaining !== undefined && m.refillPillsRemaining <= 10
  ).length;

  // Toggle dose taken in Patient Mode or Doctor Test Mode
  const handleToggleDoseSlot = (medId: string, slot: 'morning' | 'afternoon' | 'night') => {
    const updatedMeds = medications.map((med) => {
      if (med.id !== medId) return med;

      const currentSlotTaken = !!med.takenTimesToday?.[slot];
      const newSlotTaken = !currentSlotTaken;

      const updatedTakenTimesToday = {
        ...med.takenTimesToday,
        [slot]: newSlotTaken,
      };

      // Overall takenToday if all prescribed slots are complete
      const isMorningComplete = !med.schedule.morning || !!updatedTakenTimesToday.morning;
      const isAfternoonComplete = !med.schedule.afternoon || !!updatedTakenTimesToday.afternoon;
      const isNightComplete = !med.schedule.night || !!updatedTakenTimesToday.night;
      const overallTakenToday = isMorningComplete && isAfternoonComplete && isNightComplete;

      // Create or update history log entry
      const slotNameMap = { morning: 'Morning', afternoon: 'Afternoon', night: 'Night' } as const;
      const slotLabel = slotNameMap[slot];
      const todayStr = new Date().toISOString().split('T')[0];
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      let existingHistory = med.historyLogs || [];
      if (newSlotTaken) {
        const newLog: MedicationHistoryLog = {
          id: `log-${Date.now()}`,
          date: todayStr,
          time: timeStr,
          doseSlot: slotLabel,
          status: 'taken',
        };
        existingHistory = [newLog, ...existingHistory];
      }

      return {
        ...med,
        takenToday: overallTakenToday,
        takenTimesToday: updatedTakenTimesToday,
        historyLogs: existingHistory,
      };
    });

    onUpdatePatientMedications(updatedMeds);
  };

  // Toggle Refill or Missed Dose Reminders
  const handleToggleReminder = (medId: string, type: 'refill' | 'missed') => {
    const updatedMeds = medications.map((m) => {
      if (m.id !== medId) return m;
      return {
        ...m,
        refillReminder: type === 'refill' ? !m.refillReminder : m.refillReminder,
        missedDoseReminder: type === 'missed' ? !m.missedDoseReminder : m.missedDoseReminder,
      };
    });
    onUpdatePatientMedications(updatedMeds);
  };

  // Doctor Discontinue Prescription
  const handleDiscontinueMedication = (medId: string) => {
    if (window.confirm('Are you sure you want to discontinue this prescription?')) {
      const updatedMeds = medications.filter((m) => m.id !== medId);
      onUpdatePatientMedications(updatedMeds);
    }
  };

  // Doctor Prescribe New Medicine Submit
  const handleAddMedicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim() || !newMedStrength.trim()) return;

    const sideEffectsList = newSideEffects
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const newMed: FullMedication = {
      id: `med-${Date.now()}`,
      name: newMedName.trim(),
      strength: newMedStrength.trim(),
      schedule: newSchedule,
      timing: newTiming,
      startDate: newStartDate,
      endDate: newEndDate,
      duration: newDuration,
      purpose: newPurpose.trim() || 'General Clinical Management',
      sideEffects: sideEffectsList.length > 0 ? sideEffectsList : ['None reported'],
      refillReminder: newRefillReminder,
      refillDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      refillPillsRemaining: parseInt(newRefillPills, 10) || 30,
      missedDoseReminder: newMissedReminder,
      reminderTimes: [newReminderTime],
      takenToday: false,
      takenTimesToday: {},
      historyLogs: [
        {
          id: `log-init-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          doseSlot: newSchedule.morning ? 'Morning' : newSchedule.afternoon ? 'Afternoon' : 'Night',
          status: 'taken',
          notes: 'Prescription initiated by attending physician.',
        },
      ],
    };

    onUpdatePatientMedications([...medications, newMed]);

    // Reset Form
    setNewMedName('');
    setNewMedStrength('');
    setNewPurpose('');
    setNewSideEffects('');
    setIsAddModalOpen(false);
  };

  // Quick Preset Helper for Doctor
  const applyPreset = (name: string, strength: string, purpose: string, timing: 'Before Food' | 'After Food' | 'With Food') => {
    setNewMedName(name);
    setNewMedStrength(strength);
    setNewPurpose(purpose);
    setNewTiming(timing);
  };

  // Collect All History Logs Across All Meds
  const allHistoryLogs: (MedicationHistoryLog & { medName: string; medStrength: string })[] = [];
  medications.forEach((med) => {
    if (med.historyLogs) {
      med.historyLogs.forEach((log) => {
        allHistoryLogs.push({
          ...log,
          medName: med.name,
          medStrength: med.strength,
        } as any);
      });
    }
  });

  allHistoryLogs.sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime());

  const filteredHistoryLogs = allHistoryLogs.filter((log: any) => {
    if (historyFilter === 'all') return true;
    return log.status === historyFilter;
  });

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* MODULE HEADER BANNER */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10 max-w-2xl">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-md">
              <Pill className="w-6 h-6 animate-pulse" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest bg-white/20 text-white px-2.5 py-1 rounded-lg border border-white/30">
              {mode === 'doctor' ? 'Clinical Prescription Manager' : 'Patient Medication Hub'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Medicine Management Module
          </h1>

          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed font-medium">
            {mode === 'doctor'
              ? `Prescribe, monitor adherence, and adjust dosage schedules for patient ${activePatient.name} (MRN: ${activePatient.mrn}).`
              : `Track your daily medicines, mark doses as taken, set refill reminders, and maintain 100% adherence!`}
          </p>
        </div>

        {/* Action Button */}
        <div className="z-10 flex flex-wrap items-center gap-3 shrink-0">
          {mode === 'doctor' ? (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-3.5 bg-white text-blue-900 hover:bg-blue-50 rounded-2xl font-black text-xs sm:text-sm shadow-xl hover:scale-105 transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-5 h-5 text-blue-600" />
              <span>+ Prescribe New Medicine</span>
            </button>
          ) : (
            <div className="px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-xs font-bold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-300" />
              <span>Attending Physician: {activePatient.primaryDoctor}</span>
            </div>
          )}
        </div>
      </div>

      {/* ADHERENCE & SUMMARY DASHBOARD BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Adherence Rate Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Today's Adherence Rate
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {todayAdherencePct}%
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {totalTakenSlotDosesToday}/{totalPrescribedSlotDosesToday} Taken
              </span>
            </div>
            <div className="w-36 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
              <div
                className={`h-full transition-all duration-500 ${
                  todayAdherencePct >= 80 ? 'bg-emerald-500' : todayAdherencePct >= 50 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${todayAdherencePct}%` }}
              />
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Adherence Streak Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Dose Adherence Streak
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                14 Days
              </span>
              <span className="text-xs font-bold text-amber-500">🔥 Active</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Consistent daily intake record</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Active Prescriptions Count */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Active Prescriptions
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {medications.length}
              </span>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Medicines</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Scheduled across 3 daily slots</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Pill className="w-6 h-6" />
          </div>
        </div>

        {/* Refill Alerts Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Refill Status
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {lowRefillCount > 0 ? `${lowRefillCount} Low` : 'All Stocked'}
              </span>
              <span
                className={`text-xs font-bold ${
                  lowRefillCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600'
                }`}
              >
                {lowRefillCount > 0 ? 'Refill Needed' : 'OK'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Auto-reminders enabled</p>
          </div>
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              lowRefillCount > 0
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600'
            }`}
          >
            <Bell className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* MODULE TAB NAVIGATION */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'checklist'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-teal-500" />
            <span>Daily Checklist</span>
          </button>

          <button
            onClick={() => setActiveTab('cards')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'cards'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Pill className="w-4 h-4 text-blue-500" />
            <span>Prescribed Medicine Cards</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <History className="w-4 h-4 text-indigo-500" />
            <span>Adherence Timeline History</span>
          </button>
        </div>

        {/* Filter slot for checklist */}
        {activeTab === 'checklist' && (
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-400 uppercase text-[10px]">Filter Slot:</span>
            <button
              onClick={() => setFilterSlot('all')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                filterSlot === 'all'
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              All Slots
            </button>
            <button
              onClick={() => setFilterSlot('Morning')}
              className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                filterSlot === 'Morning'
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Sun className="w-3 h-3" /> Morning
            </button>
            <button
              onClick={() => setFilterSlot('Afternoon')}
              className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                filterSlot === 'Afternoon'
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Sunset className="w-3 h-3" /> Afternoon
            </button>
            <button
              onClick={() => setFilterSlot('Night')}
              className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                filterSlot === 'Night'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Moon className="w-3 h-3" /> Night
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: DAILY MEDICINE CHECKLIST */}
      {activeTab === 'checklist' && (
        <div className="space-y-6">
          <div className="p-4 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/50 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-teal-900 dark:text-teal-200 font-medium">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-teal-600 shrink-0" />
              <span>
                <strong>Daily Checklist Mode:</strong> Click or tap on any scheduled dose box to mark it as taken for today. Your adherence percentage updates in real time!
              </span>
            </div>
            <span className="px-3 py-1 bg-teal-600 text-white font-extrabold rounded-lg text-[10px] shrink-0">
              Today: {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>

          {/* Slots List */}
          {(['Morning', 'Afternoon', 'Night'] as const).map((slotLabel) => {
            if (filterSlot !== 'all' && filterSlot !== slotLabel) return null;

            const slotKey = slotLabel.toLowerCase() as 'morning' | 'afternoon' | 'night';
            const scheduledMeds = medications.filter((m) => m.schedule[slotKey]);

            const SlotIcon = slotLabel === 'Morning' ? Sun : slotLabel === 'Afternoon' ? Sunset : Moon;
            const slotBg =
              slotLabel === 'Morning'
                ? 'bg-amber-500'
                : slotLabel === 'Afternoon'
                ? 'bg-orange-500'
                : 'bg-indigo-600';

            return (
              <div
                key={slotLabel}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl ${slotBg} text-white flex items-center justify-center font-bold shadow-md`}>
                      <SlotIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{slotLabel} Doses</span>
                        <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {scheduledMeds.filter((m) => m.takenTimesToday?.[slotKey]).length}/{scheduledMeds.length} Taken
                        </span>
                      </h3>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {slotLabel === 'Morning'
                          ? 'Recommended window: 07:00 AM - 09:30 AM'
                          : slotLabel === 'Afternoon'
                          ? 'Recommended window: 12:30 PM - 02:00 PM'
                          : 'Recommended window: 08:30 PM - 10:00 PM'}
                      </p>
                    </div>
                  </div>
                </div>

                {scheduledMeds.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4">No medications scheduled for this time slot.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {scheduledMeds.map((med) => {
                      const isTaken = !!med.takenTimesToday?.[slotKey];

                      return (
                        <div
                          key={med.id}
                          className={`p-4 rounded-2xl border transition-all duration-200 space-y-3 relative overflow-hidden ${
                            isTaken
                              ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50'
                              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                                <span>{med.name}</span>
                                <span className="text-xs font-bold px-2 py-0.5 rounded bg-white/80 dark:bg-slate-900 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                                  {med.strength}
                                </span>
                              </h4>
                              <p className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                                <Utensils className="w-3 h-3 text-amber-500" />
                                <span>{med.timing}</span>
                              </p>
                            </div>

                            {/* Checklist Interactive Checkbox */}
                            <button
                              onClick={() => handleToggleDoseSlot(med.id, slotKey)}
                              className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold transition shadow-sm cursor-pointer shrink-0 ${
                                isTaken
                                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                  : 'bg-white dark:bg-slate-700 text-slate-400 border border-slate-300 dark:border-slate-600 hover:border-emerald-500 hover:text-emerald-500'
                              }`}
                              title={isTaken ? 'Mark as untaken' : 'Mark as taken'}
                            >
                              <Check className="w-5 h-5 stroke-[3]" />
                            </button>
                          </div>

                          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                            <span className="text-slate-500 font-semibold truncate max-w-[180px]">
                              Purpose: {med.purpose}
                            </span>
                            <span
                              className={`font-black uppercase text-[10px] px-2 py-0.5 rounded-full ${
                                isTaken
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              }`}
                            >
                              {isTaken ? 'Completed' : 'Pending'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: PRESCRIBED MEDICINE CARDS */}
      {activeTab === 'cards' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {medications.map((med) => (
              <div
                key={med.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5 flex flex-col justify-between hover:shadow-md transition relative group"
              >
                {/* Header Info */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-teal-600 dark:text-teal-400 block">
                        Prescription Rx
                      </span>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                        {med.name}
                      </h3>
                      <span className="inline-block mt-1 px-2.5 py-0.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 text-xs font-black border border-teal-200 dark:border-teal-800">
                        {med.strength}
                      </span>
                    </div>

                    <div className="w-10 h-10 rounded-2xl bg-teal-500 text-white flex items-center justify-center font-bold shadow-md shrink-0">
                      <Pill className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Schedule Badges */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                      Daily Schedule & Timing
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {med.schedule.morning && (
                        <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800 rounded-xl text-xs font-bold flex items-center gap-1">
                          <Sun className="w-3 h-3 text-amber-500" /> Morning
                        </span>
                      )}
                      {med.schedule.afternoon && (
                        <span className="px-2.5 py-1 bg-orange-50 dark:bg-orange-950/40 text-orange-800 dark:text-orange-200 border border-orange-200 dark:border-orange-800 rounded-xl text-xs font-bold flex items-center gap-1">
                          <Sunset className="w-3 h-3 text-orange-500" /> Afternoon
                        </span>
                      )}
                      {med.schedule.night && (
                        <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-bold flex items-center gap-1">
                          <Moon className="w-3 h-3 text-indigo-500" /> Night
                        </span>
                      )}
                      <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1">
                        <Utensils className="w-3 h-3 text-amber-500" /> {med.timing}
                      </span>
                    </div>
                  </div>

                  {/* Clinical Purpose */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 text-xs space-y-1">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                      Clinical Purpose
                    </span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{med.purpose}</p>
                  </div>

                  {/* Duration & Dates */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="text-[9px] font-bold uppercase text-slate-400 block">Start Date</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{med.startDate}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="text-[9px] font-bold uppercase text-slate-400 block">End Date / Duration</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{med.duration}</span>
                    </div>
                  </div>

                  {/* Side Effects List */}
                  {med.sideEffects && med.sideEffects.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-amber-500" /> Known Side Effects:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {med.sideEffects.map((se, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] font-medium px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 border border-amber-200/60 dark:border-amber-900/40"
                          >
                            {se}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reminders Bar */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5 text-blue-500" /> Missed Dose Reminder
                      </span>
                      <button
                        onClick={() => handleToggleReminder(med.id, 'missed')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition cursor-pointer ${
                          med.missedDoseReminder
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                        }`}
                      >
                        {med.missedDoseReminder ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5 text-teal-500" /> Refill Reminder ({med.refillPillsRemaining || 30} pills remaining)
                      </span>
                      <button
                        onClick={() => handleToggleReminder(med.id, 'refill')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition cursor-pointer ${
                          med.refillReminder
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                        }`}
                      >
                        {med.refillReminder ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions for Doctor */}
                {mode === 'doctor' && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400">Doctor Controls:</span>
                    <button
                      onClick={() => handleDiscontinueMedication(med.id)}
                      className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Discontinue
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ADHERENCE TIMELINE HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
            <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-500" />
              <span>Dose Adherence Timeline Logs</span>
            </h3>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Filter:</span>
              <button
                onClick={() => setHistoryFilter('all')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  historyFilter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                All Logs
              </button>
              <button
                onClick={() => setHistoryFilter('taken')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  historyFilter === 'taken'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                Taken
              </button>
              <button
                onClick={() => setHistoryFilter('missed')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  historyFilter === 'missed'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                Missed
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
            {filteredHistoryLogs.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-8 text-center">
                No history logs match the current filter.
              </p>
            ) : (
              <div className="relative border-l-2 border-indigo-100 dark:border-slate-800 ml-4 pl-6 space-y-6">
                {filteredHistoryLogs.map((log: any, idx: number) => (
                  <div key={log.id || idx} className="relative group">
                    {/* Timeline Dot */}
                    <div
                      className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full ring-4 ring-white dark:ring-slate-900 ${
                        log.status === 'taken' ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />

                    <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-slate-900 dark:text-white">
                            {log.medName} ({log.medStrength})
                          </span>
                          <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-black rounded-full border border-indigo-200 dark:border-indigo-800">
                            {log.doseSlot} Dose
                          </span>
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            log.status === 'taken'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {log.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {log.date} at {log.time}
                        </span>

                        {log.notes && (
                          <span className="italic text-slate-600 dark:text-slate-400">{log.notes}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* DOCTOR PRESCRIBE NEW MEDICINE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 relative my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Prescribe New Medicine
                  </h3>
                  <p className="text-xs text-slate-500">
                    Adding prescription for {activePatient.name} (MRN: {activePatient.mrn})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Presets Bar */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                Quick Clinical Presets:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset('Metformin XR', '1000 mg', 'Glycemic Regulation', 'After Food')}
                  className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-200 text-xs font-bold rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 cursor-pointer"
                >
                  Metformin 1000mg
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('Lisinopril', '20 mg', 'Hypertension & Renoprotection', 'After Food')}
                  className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-200 text-xs font-bold rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 cursor-pointer"
                >
                  Lisinopril 20mg
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('Atorvastatin', '40 mg', 'Cholesterol Lowering & ASCVD', 'After Food')}
                  className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-200 text-xs font-bold rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 cursor-pointer"
                >
                  Atorvastatin 40mg
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('Empagliflozin', '10 mg', 'SGLT2i Cardiorenal Protection', 'Before Food')}
                  className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-200 text-xs font-bold rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 cursor-pointer"
                >
                  Empagliflozin 10mg
                </button>
              </div>
            </div>

            {/* Prescribe Form */}
            <form onSubmit={handleAddMedicationSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    Medicine Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Metformin XR"
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    Strength / Dosage *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1000 mg"
                    value={newMedStrength}
                    onChange={(e) => setNewMedStrength(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Schedule Checkboxes */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  Daily Dose Schedule *
                </label>
                <div className="flex flex-wrap gap-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newSchedule.morning}
                      onChange={(e) => setNewSchedule({ ...newSchedule, morning: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>🌅 Morning</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newSchedule.afternoon}
                      onChange={(e) => setNewSchedule({ ...newSchedule, afternoon: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>☀️ Afternoon</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newSchedule.night}
                      onChange={(e) => setNewSchedule({ ...newSchedule, night: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>🌙 Night</span>
                  </label>
                </div>
              </div>

              {/* Food Timing & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    Food Timing
                  </label>
                  <select
                    value={newTiming}
                    onChange={(e) => setNewTiming(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Before Food">Before Food</option>
                    <option value="After Food">After Food</option>
                    <option value="With Food">With Food</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    Duration
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 90 Days"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Clinical Purpose & Side Effects */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    Clinical Purpose
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Glycemic Control & Insulin Sensitivity"
                    value={newPurpose}
                    onChange={(e) => setNewPurpose(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    Known Side Effects (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mild nausea, Dizziness"
                    value={newSideEffects}
                    onChange={(e) => setNewSideEffects(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Reminders Toggles */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newRefillReminder}
                      onChange={(e) => setNewRefillReminder(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Enable Pill Refill Reminder</span>
                  </label>

                  {newRefillReminder && (
                    <input
                      type="number"
                      placeholder="Initial Pills"
                      value={newRefillPills}
                      onChange={(e) => setNewRefillPills(e.target.value)}
                      className="w-28 px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                    />
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newMissedReminder}
                      onChange={(e) => setNewMissedReminder(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Enable Missed Dose Alarm</span>
                  </label>

                  {newMissedReminder && (
                    <input
                      type="text"
                      placeholder="e.g. 08:00 AM"
                      value={newReminderTime}
                      onChange={(e) => setNewReminderTime(e.target.value)}
                      className="w-28 px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                    />
                  )}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-extrabold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold text-xs shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  Confirm & Prescribe Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
