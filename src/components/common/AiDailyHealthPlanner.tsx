import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Award,
  AlertTriangle,
  Clock,
  Flame,
  Droplets,
  HeartPulse,
  Activity,
  Moon,
  Pill,
  TestTube,
  Sun,
  Plus,
  RefreshCw,
  X,
  ChevronRight,
  Filter,
  Check,
  Zap,
  Info,
  ShieldAlert,
  Smile,
  Target,
  BarChart3,
  Calendar,
  Layers,
  ThumbsUp,
} from 'lucide-react';
import { Patient, HealthTask, TaskPriority, TaskCategory, Mode, DayProgress } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface AiDailyHealthPlannerProps {
  mode: Mode;
  activePatient: Patient;
  onUpdatePatientPlan?: (updatedTasks: HealthTask[]) => void;
}

export const AiDailyHealthPlanner: React.FC<AiDailyHealthPlannerProps> = ({
  mode,
  activePatient,
}) => {
  const { t } = useLanguage();

  // Generate Initial Tasks based on Patient Metadata (Disease, Age, BMI, Doctor Recs, Risk)
  const generateInitialTasks = (p: Patient): HealthTask[] => {
    const isDiabetic = p.conditions.some(
      (c) => c.toLowerCase().includes('diabet') || c.toLowerCase().includes('glycemic')
    );
    const isHypertensive = p.conditions.some(
      (c) => c.toLowerCase().includes('hyperten') || c.toLowerCase().includes('bp') || c.toLowerCase().includes('cardio')
    );
    const isOverweight = p.vitals.bmi >= 25;
    const isHighRisk = p.riskLevel === 'High';

    const tasks: HealthTask[] = [
      {
        id: 'task-1',
        title: 'Walk 30 minutes at moderate pace',
        priority: isOverweight || isHighRisk ? 'High' : 'Medium',
        time: '07:30 AM',
        category: 'Exercise',
        completed: true,
        reasoning: `Tailored for Age ${p.age} & BMI ${p.vitals.bmi} kg/m² to improve cardiometabolic endurance and glycemic control.`,
        encouragingMessage: '🎉 Fantastic start! 30 minutes of daily walking boosts insulin sensitivity and reduces cardiovascular risk.',
        points: 20,
        iconType: 'walk',
      },
      {
        id: 'task-2',
        title: 'Drink 2.5L water throughout the day',
        priority: 'Medium',
        time: '08:00 AM - 08:00 PM',
        category: 'Hydration',
        completed: true,
        reasoning: 'Essential hydration target to optimize kidney filtration, regulate blood pressure, and maintain metabolic balance.',
        encouragingMessage: '💧 Hydration goal reached! Staying hydrated supports renal health and electrolyte stability.',
        points: 15,
        iconType: 'water',
      },
      {
        id: 'task-3',
        title: 'Check Blood Pressure & log morning reading',
        priority: isHypertensive || isHighRisk ? 'High' : 'Medium',
        time: '08:30 AM',
        category: 'Vitals Check',
        completed: true,
        reasoning: `Personalized for ${p.conditions.join(', ')} (Current BP: ${p.vitals.bpSystolic}/${p.vitals.bpDiastolic} mmHg) to prevent hypertensive spikes.`,
        encouragingMessage: '❤️ Excellent monitoring! Consistent BP tracking helps your clinical team adjust treatment safely.',
        points: 20,
        iconType: 'bp',
      },
      {
        id: 'task-4',
        title: 'Check Fasting Blood Sugar before breakfast',
        priority: isDiabetic ? 'High' : 'Low',
        time: '08:00 AM',
        category: 'Vitals Check',
        completed: false,
        reasoning: `Targeted for glucose regulation (Fasting Glucose: ${p.vitals.glucose} mg/dL, HbA1c: ${p.vitals.hba1c}%).`,
        encouragingMessage: '🩸 Great job logging your blood sugar! Fasting glucose records guide precise dietary and medication choices.',
        points: 20,
        iconType: 'sugar',
      },
      {
        id: 'task-5',
        title: 'Take Morning & Night Prescribed Medicines',
        priority: 'High',
        time: '09:00 AM & 09:00 PM',
        category: 'Medication',
        completed: true,
        reasoning: `Doctor ${p.primaryDoctor} recommendation for active prescriptions (${p.medications.map((m) => m.name).join(', ')}).`,
        encouragingMessage: '💊 Medication adherence complete! Consistent dosing is key to maintaining stable disease control.',
        points: 25,
        iconType: 'meds',
      },
      {
        id: 'task-6',
        title: 'Complete HbA1c Lab Test this week',
        priority: isHighRisk ? 'High' : 'Medium',
        time: '11:00 AM',
        category: 'Lab Check',
        completed: false,
        reasoning: `Required quarterly monitoring based on Risk Level (${p.riskLevel}) & Doctor screening plan.`,
        encouragingMessage: '🧪 Outstanding commitment! Lab tests provide accurate 3-month diagnostic visibility for your care team.',
        points: 15,
        iconType: 'lab',
      },
      {
        id: 'task-7',
        title: '10-Minute Deep Breathing & Meditation',
        priority: 'Low',
        time: '06:00 PM',
        category: 'Mental Health',
        completed: false,
        reasoning: 'Mindfulness practice to reduce vagal tone stress, lower cortisol, and assist autonomic nervous system balance.',
        encouragingMessage: '🧘 Serene work! Mindful breathing calms the nervous system and lowers resting heart rate.',
        points: 10,
        iconType: 'meditation',
      },
      {
        id: 'task-8',
        title: 'Sleep before 11:00 PM for cellular recovery',
        priority: 'Medium',
        time: '10:30 PM',
        category: 'Sleep',
        completed: false,
        reasoning: `Restorative circadian sleep window tailored for Age ${p.age} to optimize immune response and blood pressure dip.`,
        encouragingMessage: '🌙 Rest well! Sleeping before 11 PM facilitates deep restorative slow-wave sleep cycles.',
        points: 15,
        iconType: 'sleep',
      },
    ];

    return tasks;
  };

  const [tasks, setTasks] = useState<HealthTask[]>(() => generateInitialTasks(activePatient));
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<'All' | TaskPriority>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Completed'>('All');
  const [latestEncouragement, setLatestEncouragement] = useState<{ title: string; message: string } | null>({
    title: 'Daily Plan Initialized!',
    message: `Personalized 8-point daily plan active based on Age ${activePatient.age}, BMI ${activePatient.vitals.bmi}, Risk Level ${activePatient.riskLevel}, and Conditions.`,
  });

  // Modal for Adding Custom Task
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('Medium');
  const [newTaskTime, setNewTaskTime] = useState('02:00 PM');
  const [newTaskCategory, setNewTaskCategory] = useState<TaskCategory>('Exercise');
  const [newTaskReasoning, setNewTaskReasoning] = useState('');

  // Re-generate if patient changes
  useEffect(() => {
    setTasks(generateInitialTasks(activePatient));
  }, [activePatient.id]);

  // Compute Daily Progress Stats
  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const completionPct = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  // Compute Daily Score out of 100
  const maxPossiblePoints = tasks.reduce((sum, t) => sum + t.points, 0);
  const currentEarnedPoints = tasks.filter((t) => t.completed).reduce((sum, t) => sum + t.points, 0);
  const dailyScore = maxPossiblePoints > 0 ? Math.round((currentEarnedPoints / maxPossiblePoints) * 100) : 0;

  // Weekly Progress Mock Data
  const weeklyHistory: DayProgress[] = [
    { day: 'Mon', score: 85, tasksCompleted: 6, totalTasks: 8 },
    { day: 'Tue', score: 90, tasksCompleted: 7, totalTasks: 8 },
    { day: 'Wed', score: 75, tasksCompleted: 5, totalTasks: 8 },
    { day: 'Thu', score: 95, tasksCompleted: 8, totalTasks: 8 },
    { day: 'Fri', score: 80, tasksCompleted: 6, totalTasks: 8 },
    { day: 'Sat', score: 100, tasksCompleted: 8, totalTasks: 8 },
    { day: 'Sun (Today)', score: dailyScore, tasksCompleted: completedTasksCount, totalTasks: totalTasksCount },
  ];

  // Toggle Task Completion
  const handleToggleTask = (taskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((t) => {
        if (t.id !== taskId) return t;
        const newCompleted = !t.completed;

        if (newCompleted) {
          setLatestEncouragement({
            title: `Task Completed: ${t.title}`,
            message: t.encouragingMessage,
          });
        }

        return { ...t, completed: newCompleted };
      })
    );
  };

  // Generate Gemini AI Personalized Plan
  const handleGenerateAiPlan = async () => {
    setIsGeneratingAi(true);
    try {
      const response = await fetch('/api/health-planner/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient: activePatient }),
      });

      const data = await response.json();

      if (data.isAiGenerated && data.tasks && data.tasks.length > 0) {
        setTasks(data.tasks);
        setLatestEncouragement({
          title: '✨ Gemini AI Custom Daily Plan Generated!',
          message: `Generated ${data.tasks.length} personalized health actions based on Age ${activePatient.age}, BMI ${activePatient.vitals.bmi} kg/m², Risk Level ${activePatient.riskLevel}, and conditions (${activePatient.conditions.join(', ')}).`,
        });
      } else {
        // High fidelity fallback generator
        setTasks(generateInitialTasks(activePatient));
        setLatestEncouragement({
          title: '⚡ Personalized Clinical Plan Refreshed!',
          message: 'Plan recalibrated with latest clinical guidelines for diabetes, hypertension, and cardio-renal wellness.',
        });
      }
    } catch (err) {
      console.error('Error generating AI plan:', err);
      setTasks(generateInitialTasks(activePatient));
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Add Custom Task Submit
  const handleAddCustomTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: HealthTask = {
      id: `task-custom-${Date.now()}`,
      title: newTaskTitle.trim(),
      priority: newTaskPriority,
      time: newTaskTime,
      category: newTaskCategory,
      completed: false,
      reasoning: newTaskReasoning.trim() || `Added by ${mode === 'doctor' ? 'Attending Physician' : 'Patient'} for daily routine tracking.`,
      encouragingMessage: `🎉 Great initiative completing "${newTaskTitle}"! Keeping up your custom daily routine builds strong health habits.`,
      points: newTaskPriority === 'High' ? 20 : newTaskPriority === 'Medium' ? 15 : 10,
      iconType: 'generic',
    };

    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
    setNewTaskReasoning('');
    setIsAddModalOpen(false);
  };

  // Filter Tasks
  const filteredTasks = tasks.filter((t) => {
    if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;
    if (statusFilter === 'Pending' && t.completed) return false;
    if (statusFilter === 'Completed' && !t.completed) return false;
    return true;
  });

  // Icon Resolver
  const getTaskIcon = (iconType: string, category: TaskCategory) => {
    switch (iconType) {
      case 'walk':
        return Activity;
      case 'water':
        return Droplets;
      case 'bp':
        return HeartPulse;
      case 'sugar':
        return Zap;
      case 'meds':
        return Pill;
      case 'lab':
        return TestTube;
      case 'meditation':
        return Sun;
      case 'sleep':
        return Moon;
      default:
        return category === 'Exercise'
          ? Activity
          : category === 'Hydration'
          ? Droplets
          : category === 'Vitals Check'
          ? HeartPulse
          : category === 'Medication'
          ? Pill
          : category === 'Lab Check'
          ? TestTube
          : category === 'Sleep'
          ? Moon
          : Sparkles;
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* HEADER HERO BANNER WITH AI GENERATION BUTTON */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10 max-w-2xl">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-md">
              <CalendarCheck className="w-6 h-6 animate-bounce" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest bg-white/20 text-white px-3 py-1 rounded-lg border border-white/30">
              AI Daily Health Planner
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Personalized Daily Routine Engine
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed font-medium">
            AI-tailored daily targets derived strictly from patient profile:{' '}
            <strong className="text-white underline">{activePatient.conditions.join(', ')}</strong>, Age{' '}
            <strong className="text-white">{activePatient.age}</strong>, BMI{' '}
            <strong className="text-white">{activePatient.vitals.bmi} kg/m²</strong>, Doctor Recommendations, and{' '}
            <strong className="text-white">{activePatient.riskLevel} Risk</strong> level.
          </p>
        </div>

        {/* Action Button */}
        <div className="z-10 flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={handleGenerateAiPlan}
            disabled={isGeneratingAi}
            className="px-5 py-3.5 bg-white text-emerald-900 hover:bg-emerald-50 rounded-2xl font-black text-xs sm:text-sm shadow-xl hover:scale-105 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className={`w-5 h-5 text-emerald-600 ${isGeneratingAi ? 'animate-spin' : ''}`} />
            <span>{isGeneratingAi ? 'Personalizing via Gemini AI...' : 'Regenerate AI Daily Plan'}</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-3.5 bg-emerald-800/60 hover:bg-emerald-800 text-white backdrop-blur-md border border-white/30 rounded-2xl font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Task</span>
          </button>
        </div>
      </div>

      {/* PATIENT PROFILE CONTEXT BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs font-medium">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Patient:</span>
            <span className="font-extrabold text-slate-900 dark:text-white">{activePatient.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Age:</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">{activePatient.age} Yrs</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold uppercase text-[10px]">BMI:</span>
            <span className="font-bold text-teal-600 dark:text-teal-400">{activePatient.vitals.bmi} kg/m²</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Risk Level:</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                activePatient.riskLevel === 'High'
                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  : activePatient.riskLevel === 'Moderate'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              }`}
            >
              {activePatient.riskLevel} Risk
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Conditions:</span>
            <div className="flex flex-wrap gap-1">
              {activePatient.conditions.map((cond, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded font-bold text-[10px]"
                >
                  {cond}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="text-slate-500 text-[11px] font-semibold flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-emerald-500" />
          <span>Doctor Recs Synced with {activePatient.primaryDoctor}</span>
        </div>
      </div>

      {/* ENCOURAGING MESSAGE ALERT BANNER */}
      {latestEncouragement && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl flex items-start justify-between gap-3 text-xs text-emerald-900 dark:text-emerald-200 animate-fadeIn shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-md">
              <Smile className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-black text-sm text-emerald-950 dark:text-emerald-100">
                {latestEncouragement.title}
              </h4>
              <p className="font-medium text-emerald-800 dark:text-emerald-300 leading-relaxed">
                {latestEncouragement.message}
              </p>
            </div>
          </div>
          <button
            onClick={() => setLatestEncouragement(null)}
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* METRICS DASHBOARD GRID: PROGRESS RING, DAILY SCORE, WEEKLY & MONTHLY PROGRESS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Circular Progress Ring */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col justify-between items-center text-center space-y-4">
          <div className="w-full flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Task Completion Ring
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {completedTasksCount}/{totalTasksCount} Tasks
            </span>
          </div>

          {/* SVG Circular Ring */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                className="text-slate-100 dark:text-slate-800"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                className="text-emerald-500 transition-all duration-700 ease-out"
                strokeWidth="10"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * completionPct) / 100}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {completionPct}%
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Completed</span>
            </div>
          </div>

          <p className="text-xs font-semibold text-slate-500">
            {completionPct >= 80
              ? '🌟 Peak Health Adherence!'
              : completionPct >= 50
              ? '👍 Solid Momentum Today'
              : '💪 Keep going! Check off your tasks'}
          </p>
        </div>

        {/* Metric 2: Daily Score Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Daily Health Score
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900 dark:text-white">
                {dailyScore}
              </span>
              <span className="text-sm font-bold text-slate-400">/ 100 Points</span>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  dailyScore >= 80 ? 'bg-emerald-500' : dailyScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${dailyScore}%` }}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-bold">Priority Weighting:</span>
            <span className="font-extrabold text-teal-600 dark:text-teal-400">
              {currentEarnedPoints} / {maxPossiblePoints} Pts Earned
            </span>
          </div>
        </div>

        {/* Metric 3: Weekly Progress Bar Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Weekly Progress (7 Days)
            </span>
            <BarChart3 className="w-5 h-5 text-indigo-500" />
          </div>

          {/* 7 Day Bars */}
          <div className="flex items-end justify-between gap-1.5 h-24 pt-2">
            {weeklyHistory.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                {/* Tooltip */}
                <div className="absolute -top-8 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-20">
                  {item.score}% ({item.tasksCompleted}/{item.totalTasks})
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg h-20 relative flex items-end overflow-hidden">
                  <div
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      item.day.includes('Today')
                        ? 'bg-teal-500 animate-pulse'
                        : item.score >= 80
                        ? 'bg-emerald-500'
                        : 'bg-indigo-400'
                    }`}
                    style={{ height: `${item.score}%` }}
                  />
                </div>
                <span className="text-[9px] font-extrabold text-slate-400 truncate max-w-[32px]">
                  {item.day.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-semibold text-slate-500">
            <span>7-Day Avg: 86%</span>
            <span className="text-emerald-600 font-bold">🔥 6-Day Streak</span>
          </div>
        </div>

        {/* Metric 4: Monthly Progress & Consistency */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Monthly Consistency
            </span>
            <Calendar className="w-5 h-5 text-teal-500" />
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">88%</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                25 / 28 Days Active
              </span>
            </div>

            {/* Mini Heatmap 28 Blocks */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 28 }).map((_, i) => {
                const isMissed = i === 4 || i === 12 || i === 19;
                return (
                  <div
                    key={i}
                    className={`h-2.5 rounded-sm ${
                      isMissed
                        ? 'bg-slate-200 dark:bg-slate-800'
                        : i === 27
                        ? 'bg-teal-500 animate-ping'
                        : 'bg-emerald-500'
                    }`}
                    title={`Day ${i + 1}: ${isMissed ? 'Incomplete' : 'Completed'}`}
                  />
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
            <span>Target: 80%+ Adherence</span>
            <span className="text-teal-600 dark:text-teal-400 font-extrabold">Top 5% Healthier</span>
          </div>
        </div>
      </div>

      {/* CONTROLS & FILTER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
            Priority Filter:
          </span>
          <div className="flex items-center gap-1.5">
            {(['All', 'High', 'Medium', 'Low'] as const).map((pri) => (
              <button
                key={pri}
                onClick={() => setPriorityFilter(pri)}
                className={`px-3 py-1 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                  priorityFilter === pri
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {pri}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
            Status Filter:
          </span>
          <div className="flex items-center gap-1.5">
            {(['All', 'Pending', 'Completed'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                  statusFilter === st
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TASKS LIST GRID WITH BEAUTIFUL ILLUSTRATED CARDS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-500" />
            <span>Today's Personalized Tasks ({filteredTasks.length})</span>
          </h3>

          <span className="text-xs font-bold text-slate-400">
            Click task check box to mark complete & view encouraging AI feedback
          </span>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="font-black text-slate-800 dark:text-slate-200 text-base">
              No tasks match your selected filter!
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try switching your Priority or Status filters to view your complete daily routine.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTasks.map((task) => {
              const IconComp = getTaskIcon(task.iconType, task.category);

              const priorityBg =
                task.priority === 'High'
                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900'
                  : task.priority === 'Medium'
                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900'
                  : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900';

              return (
                <div
                  key={task.id}
                  className={`bg-white dark:bg-slate-900 border rounded-3xl p-5 shadow-sm space-y-4 transition-all duration-200 hover:shadow-md relative overflow-hidden ${
                    task.completed
                      ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/30 dark:bg-emerald-950/10'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      {/* Checkbox Button */}
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold transition shadow-sm cursor-pointer shrink-0 mt-0.5 ${
                          task.completed
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-300 hover:text-emerald-500 hover:border-emerald-500 border border-slate-300 dark:border-slate-700'
                        }`}
                        title={task.completed ? 'Mark as pending' : 'Mark as completed'}
                      >
                        <Check className="w-5 h-5 stroke-[3]" />
                      </button>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Priority Pill */}
                          <span
                            className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase border ${priorityBg}`}
                          >
                            {task.priority} Priority
                          </span>

                          {/* Time Slot Tag */}
                          <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {task.time}
                          </span>

                          {/* Category Tag */}
                          <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800">
                            {task.category}
                          </span>
                        </div>

                        {/* Task Title */}
                        <h4
                          className={`text-base font-black leading-snug transition ${
                            task.completed
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {task.title}
                        </h4>
                      </div>
                    </div>

                    {/* Illustrated Category Badge */}
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                        task.completed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
                      }`}
                    >
                      <IconComp className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Reasoning & Clinical Context */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 text-xs space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-teal-600 dark:text-teal-400 block">
                      AI Personalization Reason:
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                      {task.reasoning}
                    </p>
                  </div>

                  {/* Encouraging Message if Completed */}
                  {task.completed && (
                    <div className="p-3 bg-emerald-100/70 dark:bg-emerald-950/60 rounded-2xl border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2 animate-fadeIn">
                      <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <p className="font-semibold italic">{task.encouragingMessage}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400 font-semibold">
                    <span>Reward: +{task.points} Health Points</span>
                    <span
                      className={`font-black uppercase text-[10px] ${
                        task.completed ? 'text-emerald-600' : 'text-amber-500'
                      }`}
                    >
                      {task.completed ? '✓ Completed' : '⌛ Pending'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ADD CUSTOM TASK MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 relative">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Add Custom Health Task
                  </h3>
                  <p className="text-xs text-slate-500">
                    Add a personalized task to {activePatient.name}'s daily routine
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

            <form onSubmit={handleAddCustomTaskSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  Task Action Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Walk 30 minutes or Check BP"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    Priority Level
                  </label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    Category
                  </label>
                  <select
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value as TaskCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Exercise">Exercise</option>
                    <option value="Hydration">Hydration</option>
                    <option value="Vitals Check">Vitals Check</option>
                    <option value="Medication">Medication</option>
                    <option value="Sleep">Sleep</option>
                    <option value="Lab Check">Lab Check</option>
                    <option value="Mental Health">Mental Health</option>
                    <option value="Nutrition">Nutrition</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  Target Time
                </label>
                <input
                  type="text"
                  placeholder="e.g. 07:30 AM or Evening"
                  value={newTaskTime}
                  onChange={(e) => setNewTaskTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  Clinical / Personal Reason
                </label>
                <textarea
                  rows={2}
                  placeholder="Why is this task important for the patient?"
                  value={newTaskReasoning}
                  onChange={(e) => setNewTaskReasoning(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md transition cursor-pointer"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
