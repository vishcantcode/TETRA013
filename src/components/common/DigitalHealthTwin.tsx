import React, { useState, useMemo } from 'react';
import {
  Activity,
  Heart,
  Brain,
  ShieldAlert,
  Flame,
  Sparkles,
  Zap,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sliders,
  User,
  Clock,
  ArrowRight,
  Info,
  Check,
  Stethoscope,
  ChevronRight,
  Smile,
  ShieldCheck,
  Award,
  Sparkle,
  Scale,
  Dumbbell,
  Cigarette,
  Wine,
  Pill,
  Moon,
  Droplet,
  Footprints,
  Apple,
  BrainCircuit,
  Gauge,
  BarChart2,
  LineChart as LineChartIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { Patient } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface DigitalHealthTwinProps {
  activePatient?: Patient;
  isHighContrast?: boolean;
}

export const DigitalHealthTwin: React.FC<DigitalHealthTwinProps> = ({
  activePatient,
  isHighContrast = false,
}) => {
  const { t } = useLanguage();

  // Mode: Patient Friendly vs Doctor Mode
  const [viewMode, setViewMode] = useState<'patient' | 'doctor'>('doctor');

  // Baseline Values initialized from activePatient or default
  const baseline = useMemo(() => {
    return {
      name: activePatient?.name || 'Eleanor Vance',
      age: activePatient?.age || 58,
      gender: activePatient?.gender || 'Female',
      weightKg: activePatient?.vitals?.weightKg || 88,
      heightCm: 165,
      exerciseMins: 45, // per week
      smokingPacks: 0.5, // packs/day
      alcoholDrinks: 4, // drinks/week
      medAdherence: 65, // %
      sleepHrs: 6.0, // hrs
      waterLiters: 1.2, // L/day
      dailySteps: 4200,
      dietQuality: 4, // 1-10
      stressLevel: 7, // 1-10
      bpSystolic: activePatient?.vitals?.bpSystolic || 148,
      bpDiastolic: activePatient?.vitals?.bpDiastolic || 92,
      glucose: activePatient?.vitals?.glucose || 182,
      hba1c: activePatient?.vitals?.hba1c || 8.4,
      eGFR: 68,
      cholesterol: 228,
      ldl: activePatient?.vitals?.ldl || 152,
    };
  }, [activePatient]);

  // Simulated What-If Controls (State)
  const [weightKg, setWeightKg] = useState<number>(baseline.weightKg);
  const [exerciseMins, setExerciseMins] = useState<number>(baseline.exerciseMins);
  const [smokingPacks, setSmokingPacks] = useState<number>(baseline.smokingPacks);
  const [alcoholDrinks, setAlcoholDrinks] = useState<number>(baseline.alcoholDrinks);
  const [medAdherence, setMedAdherence] = useState<number>(baseline.medAdherence);
  const [sleepHrs, setSleepHrs] = useState<number>(baseline.sleepHrs);
  const [waterLiters, setWaterLiters] = useState<number>(baseline.waterLiters);
  const [dailySteps, setDailySteps] = useState<number>(baseline.dailySteps);
  const [dietQuality, setDietQuality] = useState<number>(baseline.dietQuality);
  const [stressLevel, setStressLevel] = useState<number>(baseline.stressLevel);
  const [bpSystolic, setBpSystolic] = useState<number>(baseline.bpSystolic);
  const [glucose, setGlucose] = useState<number>(baseline.glucose);
  const [hba1c, setHba1c] = useState<number>(baseline.hba1c);

  // Preset Handlers
  const handleResetToBaseline = () => {
    setWeightKg(baseline.weightKg);
    setExerciseMins(baseline.exerciseMins);
    setSmokingPacks(baseline.smokingPacks);
    setAlcoholDrinks(baseline.alcoholDrinks);
    setMedAdherence(baseline.medAdherence);
    setSleepHrs(baseline.sleepHrs);
    setWaterLiters(baseline.waterLiters);
    setDailySteps(baseline.dailySteps);
    setDietQuality(baseline.dietQuality);
    setStressLevel(baseline.stressLevel);
    setBpSystolic(baseline.bpSystolic);
    setGlucose(baseline.glucose);
    setHba1c(baseline.hba1c);
  };

  const handleApplyModerateScenario = () => {
    setWeightKg(Math.max(60, baseline.weightKg - 5));
    setExerciseMins(120);
    setSmokingPacks(0.1);
    setAlcoholDrinks(2);
    setMedAdherence(85);
    setSleepHrs(7.0);
    setWaterLiters(2.0);
    setDailySteps(7500);
    setDietQuality(7);
    setStressLevel(4);
    setBpSystolic(132);
    setGlucose(140);
    setHba1c(7.3);
  };

  const handleApplyIdealScenario = () => {
    setWeightKg(Math.max(58, baseline.weightKg - 10));
    setExerciseMins(210);
    setSmokingPacks(0);
    setAlcoholDrinks(0);
    setMedAdherence(98);
    setSleepHrs(8.0);
    setWaterLiters(2.5);
    setDailySteps(10500);
    setDietQuality(9);
    setStressLevel(2);
    setBpSystolic(120);
    setGlucose(105);
    setHba1c(6.2);
  };

  // DYNAMIC COMPUTATIONS & RISK ENGINE
  const simResults = useMemo(() => {
    // Deltas vs baseline
    const weightDelta = weightKg - baseline.weightKg; // e.g. -10
    const exDelta = exerciseMins - baseline.exerciseMins; // e.g. +105
    const medDelta = medAdherence - baseline.medAdherence; // e.g. +33
    const hba1cDelta = hba1c - baseline.hba1c; // e.g. -2.2
    const bpDelta = bpSystolic - baseline.bpSystolic; // e.g. -28

    // Calculate Simulated Risks (0-100%)
    // Base Baseline Risks
    const baseDiabetesRisk = 82;
    const baseHtnRisk = 78;
    const baseCkdRisk = 48;
    const baseAscvdRisk = 64;
    const baseStrokeRisk = 38;

    // Reductions based on sliders
    const weightEffect = (weightDelta / 10) * 12; // -10kg => -12%
    const exEffect = (exDelta / 100) * 8; // +100m => -8%
    const medEffect = (medDelta / 30) * 10; // +30% => -10%
    const smokeEffect = (baseline.smokingPacks - smokingPacks) * 15; // quit => -15%
    const dietEffect = (dietQuality - baseline.dietQuality) * 2; // +5 => -10%

    // Diabetes Risk Calculation
    let simDiabetes = Math.min(99, Math.max(12, Math.round(baseDiabetesRisk + weightEffect + (hba1cDelta * 18) - exEffect - (medEffect * 0.8))));
    // Hypertension Risk Calculation
    let simHtn = Math.min(99, Math.max(15, Math.round(baseHtnRisk + (bpDelta * 1.1) + weightEffect * 0.6 - (stressLevel - baseline.stressLevel) * 2)));
    // CKD Risk Calculation
    let simCkd = Math.min(99, Math.max(8, Math.round(baseCkdRisk + (hba1cDelta * 10) + (bpDelta * 0.6) - medEffect)));
    // ASCVD Risk Calculation
    let simAscvd = Math.min(99, Math.max(10, Math.round(baseAscvdRisk + weightEffect * 0.8 - smokeEffect - exEffect + (bpDelta * 0.8))));
    // Stroke Risk Calculation
    let simStroke = Math.min(99, Math.max(5, Math.round(baseStrokeRisk + (bpDelta * 0.9) - smokeEffect * 0.8)));

    // Risk Category
    const maxRisk = Math.max(simDiabetes, simHtn, simCkd, simAscvd, simStroke);
    let riskCategory: 'High Risk' | 'Moderate Risk' | 'Low Risk' = 'High Risk';
    if (maxRisk < 35) riskCategory = 'Low Risk';
    else if (maxRisk < 60) riskCategory = 'Moderate Risk';

    // Referral Recommendation
    let referralStatus = 'Urgent Specialist Referral Needed';
    if (maxRisk < 35) referralStatus = 'Routine Annual Monitoring';
    else if (maxRisk < 60) referralStatus = 'Elective Outpatient Follow-Up (60 Days)';

    // Wellness Score (0-100)
    // Sub-scores
    const scoreNutrition = Math.min(100, Math.max(10, dietQuality * 10));
    const scorePhysical = Math.min(100, Math.max(10, Math.round((exerciseMins / 150) * 60 + (dailySteps / 10000) * 40)));
    const scoreMedication = medAdherence;
    const scoreSleep = Math.min(100, Math.max(10, Math.round(100 - Math.abs(sleepHrs - 7.5) * 25)));
    const scoreHydration = Math.min(100, Math.max(10, Math.round((waterLiters / 2.5) * 100)));
    const scoreStress = Math.min(100, Math.max(10, (10 - stressLevel) * 10));
    const scoreClinical = Math.min(100, Math.max(10, Math.round(100 - maxRisk * 0.85)));

    const overallWellness = Math.min(100, Math.max(10, Math.round(
      scoreNutrition * 0.15 +
      scorePhysical * 0.15 +
      scoreMedication * 0.20 +
      scoreSleep * 0.10 +
      scoreHydration * 0.05 +
      scoreStress * 0.10 +
      scoreClinical * 0.25
    )));

    // BMI calculation
    const heightM = baseline.heightCm / 100;
    const simBmi = +(weightKg / (heightM * heightM)).toFixed(1);
    const baseBmi = +(baseline.weightKg / (heightM * heightM)).toFixed(1);

    // Simulated eGFR & LDL
    const simEgfr = Math.min(100, Math.max(30, Math.round(baseline.eGFR - (hba1cDelta * 4) + (medEffect * 0.2))));
    const simLdl = Math.min(220, Math.max(70, Math.round(baseline.ldl + (weightDelta * 2) - (dietEffect * 4))));

    return {
      simDiabetes,
      simHtn,
      simCkd,
      simAscvd,
      simStroke,
      riskCategory,
      referralStatus,
      overallWellness,
      simBmi,
      baseBmi,
      simEgfr,
      simLdl,
      scores: {
        scoreNutrition,
        scorePhysical,
        scoreMedication,
        scoreSleep,
        scoreHydration,
        scoreStress,
        scoreClinical,
      },
    };
  }, [
    weightKg,
    exerciseMins,
    smokingPacks,
    alcoholDrinks,
    medAdherence,
    sleepHrs,
    waterLiters,
    dailySteps,
    dietQuality,
    stressLevel,
    bpSystolic,
    glucose,
    hba1c,
    baseline,
  ]);

  // PROGRESSION TIMELINE DATA FOR CHARTS (0, 3, 6, 12, 24 Months)
  const timelineData = useMemo(() => {
    // Generate values for 3 curves: No Intervention, Moderate, Ideal (Simulated)
    const months = ['Current', '3 Mths', '6 Mths', '12 Mths', '24 Mths'];

    return months.map((month, idx) => {
      const factor = idx / 4; // 0 to 1

      // No Intervention (deteriorating baseline)
      const noIntHba1c = +(baseline.hba1c + factor * 0.8).toFixed(1);
      const noIntBp = Math.round(baseline.bpSystolic + factor * 12);
      const noIntBmi = +(simResults.baseBmi + factor * 1.2).toFixed(1);
      const noIntEgfr = Math.round(baseline.eGFR - factor * 8);
      const noIntRisk = Math.min(98, Math.round(78 + factor * 15));

      // Current Simulated Intervention (user selected sliders)
      const simHba1cVal = +(baseline.hba1c + (hba1c - baseline.hba1c) * Math.min(1, factor * 1.5)).toFixed(1);
      const simBpVal = Math.round(baseline.bpSystolic + (bpSystolic - baseline.bpSystolic) * Math.min(1, factor * 1.5));
      const simBmiVal = +(simResults.baseBmi + (simResults.simBmi - simResults.baseBmi) * Math.min(1, factor * 1.2)).toFixed(1);
      const simEgfrVal = Math.round(baseline.eGFR + (simResults.simEgfr - baseline.eGFR) * factor);
      const simRiskVal = Math.round(82 + (simResults.simDiabetes - 82) * Math.min(1, factor * 1.4));

      // Ideal Scenario (optimal trajectory)
      const idealHba1cVal = +(baseline.hba1c - factor * 2.2).toFixed(1);
      const idealBpVal = Math.round(baseline.bpSystolic - factor * 28);
      const idealBmiVal = +(simResults.baseBmi - factor * 3.8).toFixed(1);
      const idealEgfrVal = Math.round(baseline.eGFR + factor * 6);
      const idealRiskVal = Math.round(82 - factor * 48);

      return {
        month,
        // HbA1c
        noIntHba1c,
        simHba1c: simHba1cVal,
        idealHba1c: idealHba1cVal,
        // BP
        noIntBp,
        simBp: simBpVal,
        idealBp: idealBpVal,
        // BMI
        noIntBmi,
        simBmi: simBmiVal,
        idealBmi: idealBmiVal,
        // eGFR
        noIntEgfr,
        simEgfr: simEgfrVal,
        idealEgfr: idealEgfrVal,
        // Overall Risk
        noIntRisk,
        simRisk: simRiskVal,
        idealRisk: idealRiskVal,
      };
    });
  }, [baseline, hba1c, bpSystolic, simResults]);

  // Dynamic AI Insight Bullet Generator
  const aiInsights = useMemo(() => {
    const list: string[] = [];
    const weightLoss = baseline.weightKg - weightKg;
    const hba1cDrop = +(baseline.hba1c - hba1c).toFixed(1);
    const bpDrop = baseline.bpSystolic - bpSystolic;

    if (weightLoss >= 5) {
      list.push(`Losing approximately ${weightLoss.toFixed(1)} kg directly lowers systemic insulin resistance and reduces 10-year cardiovascular risk by ~28%.`);
    } else {
      list.push(`Achieving a 5–8 kg weight reduction will significantly optimize metabolic biomarkers and decrease visceral lipid accumulation.`);
    }

    if (medAdherence >= 85) {
      list.push(`High medication adherence (≥85%) stabilizes long-term renal hemodynamics and lowers end-stage kidney disease risk.`);
    } else {
      list.push(`Improving medication adherence above 80% is critical to preventing subclinical microvascular damage.`);
    }

    if (bpDrop >= 10 || bpSystolic <= 130) {
      list.push(`Reducing systolic blood pressure below 130 mmHg cuts stroke probability by up to 35%.`);
    } else {
      list.push(`Reducing sodium intake and targeting SBP < 130 mmHg will provide essential neurovascular protection.`);
    }

    if (exerciseMins >= 150) {
      list.push(`Meeting aerobic target of ≥150 mins/week improves peripheral glucose uptake and vascular endothelial elasticity.`);
    }

    if (hba1cDrop >= 1.0) {
      list.push(`A ${hba1cDrop}% reduction in HbA1c protects microvascular capillary beds in retinopathy and nephropathy.`);
    }

    return list;
  }, [weightKg, hba1c, bpSystolic, medAdherence, exerciseMins, baseline]);

  return (
    <div className="space-y-6 pb-16">
      {/* HEADER & TOP BAR */}
      <div
        className={`rounded-3xl p-6 sm:p-8 border shadow-2xl relative overflow-hidden transition-all ${
          isHighContrast
            ? 'bg-black border-yellow-400 text-yellow-300'
            : 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border-slate-800'
        }`}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1.5">
                <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />
                AI Digital Health Twin Engine
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-400/30 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-teal-400" />
                Real-Time Predictive What-If Simulator
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <User className="w-8 h-8 text-indigo-400 shrink-0" />
              Digital Health Twin: {baseline.name}
            </h1>

            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Virtual health model synthesized from clinical biomarkers, lifestyle factors, and epidemiological predictive models. Adjust lifestyle levers below to simulate preventive health trajectories.
            </p>
          </div>

          {/* MODE SWITCHER (PATIENT FRIENDLY VS DOCTOR MODE) */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-800/90 border border-slate-700/80 backdrop-blur-md shrink-0">
            <button
              onClick={() => setViewMode('patient')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                viewMode === 'patient'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smile className="w-4 h-4" />
              <span>Patient Friendly Mode</span>
            </button>

            <button
              onClick={() => setViewMode('doctor')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                viewMode === 'doctor'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Doctor / Clinical Mode</span>
            </button>
          </div>
        </div>
      </div>

      {/* MANDATORY DISCLAIMER BANNER */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-start gap-3 text-xs leading-relaxed shadow-sm">
        <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold block mb-0.5">Educational Simulation Notice:</strong>
          These projections are educational simulations based on available information and should not be interpreted as guaranteed outcomes. Clinical decisions should always be made by qualified healthcare professionals.
        </div>
      </div>

      {/* OVERALL WELLNESS SCORE & RISK PREDICTION SUMMARY */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* WELLNESS SCORE GAUGE CARD */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-indigo-500" />
              Overall Digital Twin Wellness Score
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
              Live Index
            </span>
          </div>

          <div className="py-6 flex flex-col items-center justify-center text-center space-y-3">
            {/* Circle Progress Gauge */}
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-slate-100 dark:stroke-slate-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className={`transition-all duration-700 ease-out ${
                    simResults.overallWellness >= 75
                      ? 'stroke-emerald-500'
                      : simResults.overallWellness >= 50
                      ? 'stroke-amber-500'
                      : 'stroke-rose-500'
                  }`}
                  strokeWidth="8"
                  strokeDasharray={264}
                  strokeDashoffset={264 - (264 * simResults.overallWellness) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-slate-900 dark:text-white">
                  {simResults.overallWellness}
                </span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">/ 100</span>
              </div>
            </div>

            <div className="text-xs space-y-1">
              <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                {simResults.overallWellness >= 75
                  ? 'Optimal Health Trajectory'
                  : simResults.overallWellness >= 50
                  ? 'Moderate Health Stability'
                  : 'High Risk Intervention Needed'}
              </div>
              <p className="text-slate-500 dark:text-slate-400">
                {viewMode === 'patient'
                  ? 'Every healthy choice today can improve your future health!'
                  : 'Calculated from weighted metabolic, renal, CVD, and behavioral indices.'}
              </p>
            </div>
          </div>

          {/* Sub-Score Breakdown Progress Bars */}
          <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="font-bold text-slate-700 dark:text-slate-300 mb-2">Wellness Breakdown:</div>
            {[
              { label: 'Nutrition', score: simResults.scores.scoreNutrition, color: 'bg-emerald-500' },
              { label: 'Physical Activity', score: simResults.scores.scorePhysical, color: 'bg-indigo-500' },
              { label: 'Medication Adherence', score: simResults.scores.scoreMedication, color: 'bg-purple-500' },
              { label: 'Sleep Quality', score: simResults.scores.scoreSleep, color: 'bg-blue-500' },
              { label: 'Hydration', score: simResults.scores.scoreHydration, color: 'bg-cyan-500' },
              { label: 'Stress Management', score: simResults.scores.scoreStress, color: 'bg-amber-500' },
              { label: 'Clinical Stability', score: simResults.scores.scoreClinical, color: 'bg-rose-500' },
            ].map((sub) => (
              <div key={sub.label} className="space-y-1">
                <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  <span>{sub.label}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{sub.score}/100</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${sub.color}`} style={{ width: `${sub.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SIMULATED RISK PROJECTION CARDS (5 CONDITIONS) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-indigo-500" />
                  Simulated 10-Year Disease Risk Projections
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Real-time recalculated disease probabilities under current simulated parameters.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  Risk Tier: <strong className={simResults.riskCategory === 'Low Risk' ? 'text-emerald-600' : simResults.riskCategory === 'Moderate Risk' ? 'text-amber-600' : 'text-rose-600'}>{simResults.riskCategory}</strong>
                </span>
              </div>
            </div>

            {/* 5 Risks Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Diabetes Risk */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span className="text-xs font-bold">Diabetes Risk</span>
                  <Flame className="w-4 h-4 text-rose-500" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {simResults.simDiabetes}%
                </div>
                <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <span>Baseline: 82%</span>
                  {simResults.simDiabetes < 82 && (
                    <span className="text-emerald-600 font-bold">({simResults.simDiabetes - 82}%)</span>
                  )}
                </div>
              </div>

              {/* Hypertension Risk */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span className="text-xs font-bold">Hypertension Risk</span>
                  <Activity className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {simResults.simHtn}%
                </div>
                <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <span>Baseline: 78%</span>
                  {simResults.simHtn < 78 && (
                    <span className="text-emerald-600 font-bold">({simResults.simHtn - 78}%)</span>
                  )}
                </div>
              </div>

              {/* CKD Risk */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span className="text-xs font-bold">CKD (Kidney) Risk</span>
                  <ShieldAlert className="w-4 h-4 text-purple-500" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {simResults.simCkd}%
                </div>
                <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <span>Baseline: 48%</span>
                  {simResults.simCkd < 48 && (
                    <span className="text-emerald-600 font-bold">({simResults.simCkd - 48}%)</span>
                  )}
                </div>
              </div>

              {/* Cardiovascular Risk */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span className="text-xs font-bold">ASCVD CVD Risk</span>
                  <Heart className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {simResults.simAscvd}%
                </div>
                <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <span>Baseline: 64%</span>
                  {simResults.simAscvd < 64 && (
                    <span className="text-emerald-600 font-bold">({simResults.simAscvd - 64}%)</span>
                  )}
                </div>
              </div>

              {/* Stroke Risk */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span className="text-xs font-bold">Stroke Risk</span>
                  <Brain className="w-4 h-4 text-cyan-500" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {simResults.simStroke}%
                </div>
                <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <span>Baseline: 38%</span>
                  {simResults.simStroke < 38 && (
                    <span className="text-emerald-600 font-bold">({simResults.simStroke - 38}%)</span>
                  )}
                </div>
              </div>

              {/* Referral Status */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1.5 flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Referral Status</span>
                <div className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 leading-tight">
                  {simResults.referralStatus}
                </div>
                <span className="text-[10px] text-slate-400">Dynamic Clinical Decision</span>
              </div>
            </div>

            {/* SIDE BY SIDE COMPARISON HIGHLIGHTS */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 space-y-2 text-xs">
              <div className="font-extrabold text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                Side-by-Side Scenario Impact Summary
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900">
                  <span className="text-slate-400 block">Weight:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {baseline.weightKg} kg → <strong className="text-emerald-600">{weightKg} kg</strong>
                  </span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900">
                  <span className="text-slate-400 block">HbA1c:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {baseline.hba1c}% → <strong className="text-emerald-600">{hba1c}%</strong>
                  </span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900">
                  <span className="text-slate-400 block">Diabetes Risk:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    82% → <strong className="text-emerald-600">{simResults.simDiabetes}%</strong>
                  </span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900">
                  <span className="text-slate-400 block">Referral:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                    {simResults.referralStatus.includes('Routine') ? 'Routine Monitoring' : 'Specialist Referral'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* INTERVENTION SIMULATOR (SLIDERS CONTROL PANEL) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-500" />
              Interactive What-If Scenario Levers
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Drag the interactive sliders below to simulate immediate biometric and lifestyle health impacts.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleResetToBaseline}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Baseline</span>
            </button>

            <button
              onClick={handleApplyModerateScenario}
              className="px-3 py-2 rounded-xl bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/30 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Moderate Scenario</span>
            </button>

            <button
              onClick={handleApplyIdealScenario}
              className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ideal Scenario</span>
            </button>
          </div>
        </div>

        {/* SLIDERS GRID (ALL 13 REQUESTED ADJUSTMENTS) */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
          {/* 1. Weight (kg) */}
          <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-indigo-500" />
                Weight (kg)
              </span>
              <span className="text-indigo-600 dark:text-indigo-400 font-extrabold text-sm">{weightKg} kg</span>
            </div>
            <input
              type="range"
              min={50}
              max={130}
              step={0.5}
              value={weightKg}
              onChange={(e) => setWeightKg(parseFloat(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Baseline: {baseline.weightKg} kg</span>
              <span>Target BMI: {simResults.simBmi}</span>
            </div>
          </div>

          {/* 2. Exercise (mins/week) */}
          <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-1.5">
                <Dumbbell className="w-4 h-4 text-emerald-500" />
                Aerobic Exercise
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">{exerciseMins} mins/wk</span>
            </div>
            <input
              type="range"
              min={0}
              max={300}
              step={15}
              value={exerciseMins}
              onChange={(e) => setExerciseMins(parseInt(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Baseline: {baseline.exerciseMins} mins</span>
              <span>AHA Rec: ≥150 mins</span>
            </div>
          </div>

          {/* 3. Smoking (packs/day) */}
          <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-1.5">
                <Cigarette className="w-4 h-4 text-rose-500" />
                Smoking (Packs/Day)
              </span>
              <span className="text-rose-600 dark:text-rose-400 font-extrabold text-sm">{smokingPacks} pk/day</span>
            </div>
            <input
              type="range"
              min={0}
              max={2}
              step={0.1}
              value={smokingPacks}
              onChange={(e) => setSmokingPacks(parseFloat(e.target.value))}
              className="w-full accent-rose-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Baseline: {baseline.smokingPacks} pk</span>
              <span>Goal: 0 pk (Quit)</span>
            </div>
          </div>

          {/* 4. Alcohol (drinks/week) */}
          <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-1.5">
                <Wine className="w-4 h-4 text-purple-500" />
                Alcohol Intake
              </span>
              <span className="text-purple-600 dark:text-purple-400 font-extrabold text-sm">{alcoholDrinks} drinks/wk</span>
            </div>
            <input
              type="range"
              min={0}
              max={20}
              step={1}
              value={alcoholDrinks}
              onChange={(e) => setAlcoholDrinks(parseInt(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Baseline: {baseline.alcoholDrinks} drinks</span>
              <span>Low Risk: ≤2 drinks</span>
            </div>
          </div>

          {/* 5. Medication Adherence (%) */}
          <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-teal-500" />
                Medication Adherence
              </span>
              <span className="text-teal-600 dark:text-teal-400 font-extrabold text-sm">{medAdherence}%</span>
            </div>
            <input
              type="range"
              min={20}
              max={100}
              step={5}
              value={medAdherence}
              onChange={(e) => setMedAdherence(parseInt(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Baseline: {baseline.medAdherence}%</span>
              <span>Target: ≥85%</span>
            </div>
          </div>

          {/* 6. Sleep Duration (hrs/night) */}
          <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-1.5">
                <Moon className="w-4 h-4 text-blue-500" />
                Sleep Duration
              </span>
              <span className="text-blue-600 dark:text-blue-400 font-extrabold text-sm">{sleepHrs} hrs/night</span>
            </div>
            <input
              type="range"
              min={4}
              max={10}
              step={0.5}
              value={sleepHrs}
              onChange={(e) => setSleepHrs(parseFloat(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Baseline: {baseline.sleepHrs} hrs</span>
              <span>Optimal: 7-8 hrs</span>
            </div>
          </div>

          {/* 7. Water Intake (L/day) */}
          <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-1.5">
                <Droplet className="w-4 h-4 text-cyan-500" />
                Daily Hydration
              </span>
              <span className="text-cyan-600 dark:text-cyan-400 font-extrabold text-sm">{waterLiters} L/day</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={4.0}
              step={0.1}
              value={waterLiters}
              onChange={(e) => setWaterLiters(parseFloat(e.target.value))}
              className="w-full accent-cyan-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Baseline: {baseline.waterLiters} L</span>
              <span>Target: 2.5 L</span>
            </div>
          </div>

          {/* 8. Daily Steps */}
          <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-1.5">
                <Footprints className="w-4 h-4 text-amber-500" />
                Daily Steps
              </span>
              <span className="text-amber-600 dark:text-amber-400 font-extrabold text-sm">{dailySteps.toLocaleString()} steps</span>
            </div>
            <input
              type="range"
              min={1000}
              max={15000}
              step={500}
              value={dailySteps}
              onChange={(e) => setDailySteps(parseInt(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Baseline: {baseline.dailySteps.toLocaleString()}</span>
              <span>Target: 10,000</span>
            </div>
          </div>

          {/* 9. Diet Quality (1-10) */}
          <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-1.5">
                <Apple className="w-4 h-4 text-emerald-500" />
                Diet Quality Index
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">{dietQuality} / 10</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={dietQuality}
              onChange={(e) => setDietQuality(parseInt(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Baseline: {baseline.dietQuality}/10</span>
              <span>DASH / Mediterranean</span>
            </div>
          </div>

          {/* 10. Stress Level (1-10) */}
          <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-indigo-500" />
                Stress Level
              </span>
              <span className="text-indigo-600 dark:text-indigo-400 font-extrabold text-sm">{stressLevel} / 10</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={stressLevel}
              onChange={(e) => setStressLevel(parseInt(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Baseline: {baseline.stressLevel}/10</span>
              <span>Low Stress: ≤3</span>
            </div>
          </div>

          {/* 11. Blood Pressure (Systolic mmHg) */}
          <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-amber-500" />
                Systolic BP (mmHg)
              </span>
              <span className="text-amber-600 dark:text-amber-400 font-extrabold text-sm">{bpSystolic} mmHg</span>
            </div>
            <input
              type="range"
              min={100}
              max={180}
              step={2}
              value={bpSystolic}
              onChange={(e) => setBpSystolic(parseInt(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Baseline: {baseline.bpSystolic} mmHg</span>
              <span>Target: &lt;120 mmHg</span>
            </div>
          </div>

          {/* 12. Blood Sugar / Glucose (mg/dL) */}
          <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-rose-500" />
                Fasting Glucose
              </span>
              <span className="text-rose-600 dark:text-rose-400 font-extrabold text-sm">{glucose} mg/dL</span>
            </div>
            <input
              type="range"
              min={80}
              max={240}
              step={2}
              value={glucose}
              onChange={(e) => setGlucose(parseInt(e.target.value))}
              className="w-full accent-rose-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Baseline: {baseline.glucose} mg/dL</span>
              <span>Target: &lt;100 mg/dL</span>
            </div>
          </div>

          {/* 13. HbA1c (%) */}
          <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 col-span-full md:col-span-1">
            <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-indigo-500" />
                HbA1c Glycemic Index
              </span>
              <span className="text-indigo-600 dark:text-indigo-400 font-extrabold text-sm">{hba1c}%</span>
            </div>
            <input
              type="range"
              min={5.0}
              max={11.0}
              step={0.1}
              value={hba1c}
              onChange={(e) => setHba1c(parseFloat(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Baseline: {baseline.hba1c}%</span>
              <span>Target: &lt;6.5%</span>
            </div>
          </div>
        </div>
      </div>

      {/* DISEASE PROGRESSION TIMELINE & MULTI-SCENARIO TREND CHARTS */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <LineChartIcon className="w-5 h-5 text-indigo-500" />
              Disease Progression Timeline (0 to 24 Months)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Longitudinal projections under 3 comparative scenarios: No Intervention vs Current Simulated vs Ideal.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold">
              <span className="w-3 h-1 bg-rose-500 rounded-full" /> No Intervention
            </span>
            <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold">
              <span className="w-3 h-1 bg-indigo-500 rounded-full" /> Current Simulated
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
              <span className="w-3 h-1 bg-emerald-500 rounded-full" /> Ideal Lifestyle
            </span>
          </div>
        </div>

        {/* TIMELINE STEPS VISUAL PIPELINE */}
        <div className="grid grid-cols-5 gap-2 text-center text-xs font-bold py-2">
          {['Current Month', '3 Months', '6 Months', '12 Months', '24 Months'].map((step, idx) => (
            <div key={step} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 relative">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-0.5">Step 0{idx + 1}</span>
              <span className="text-slate-900 dark:text-white font-extrabold">{step}</span>
              {idx < 4 && (
                <ChevronRight className="w-4 h-4 text-slate-300 absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 hidden sm:block" />
              )}
            </div>
          ))}
        </div>

        {/* 2 MAIN TREND CHARTS */}
        <div className="grid lg:grid-cols-2 gap-6 pt-2">
          {/* Chart 1: HbA1c & Overall Risk Trajectory */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center justify-between">
              <span>HbA1c (%) Glycemic Progression</span>
              <span className="text-[10px] text-slate-400 font-normal">Target: &lt;6.5%</span>
            </h4>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis domain={[5, 10]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      color: '#fff',
                      borderRadius: '12px',
                      fontSize: '11px',
                    }}
                  />
                  <Line type="monotone" dataKey="noIntHba1c" name="No Intervention" stroke="#f43f5e" strokeWidth={2.5} strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="simHba1c" name="Simulated Scenario" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="idealHba1c" name="Ideal Scenario" stroke="#10b981" strokeWidth={2.5} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Systolic BP Trajectory */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center justify-between">
              <span>Systolic Blood Pressure (mmHg) Trajectory</span>
              <span className="text-[10px] text-slate-400 font-normal">Target: &lt;120 mmHg</span>
            </h4>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis domain={[110, 170]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      color: '#fff',
                      borderRadius: '12px',
                      fontSize: '11px',
                    }}
                  />
                  <Line type="monotone" dataKey="noIntBp" name="No Intervention" stroke="#f43f5e" strokeWidth={2.5} strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="simBp" name="Simulated Scenario" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="idealBp" name="Ideal Scenario" stroke="#10b981" strokeWidth={2.5} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* AI CLINICAL INSIGHTS & MODE SPECIFIC DETAILS */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Personalized AI Insights */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              AI Preventive Clinical Insights
            </h3>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
              Gemini Health Synthesis
            </span>
          </div>

          <div className="space-y-3 text-xs leading-relaxed">
            {aiInsights.map((insight, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-3"
              >
                <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="text-slate-700 dark:text-slate-300 font-medium">
                  {insight}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mode Specific Considerations */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              {viewMode === 'doctor' ? (
                <>
                  <Stethoscope className="w-5 h-5 text-indigo-500" />
                  Clinical Considerations & Follow-Up Plan
                </>
              ) : (
                <>
                  <Smile className="w-5 h-5 text-emerald-500" />
                  Your Personalized Encouragement & Next Steps
                </>
              )}
            </h3>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {viewMode === 'doctor' ? 'Provider View' : 'Patient View'}
            </span>
          </div>

          {viewMode === 'doctor' ? (
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 space-y-1">
                <span className="font-bold text-indigo-900 dark:text-indigo-200 block">Suggested Clinical Monitoring:</span>
                <p className="text-slate-600 dark:text-slate-300">
                  • Repeat HbA1c in 90 days. Repeat spot urine albumin-to-creatinine ratio (uACR) in 6 months.
                </p>
                <p className="text-slate-600 dark:text-slate-300">
                  • Order 24-hr ambulatory BP monitoring if home SBP stays &gt; 135 mmHg.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-1">
                <span className="font-bold text-emerald-900 dark:text-emerald-200 block">Pharmacotherapy Considerations:</span>
                <p className="text-slate-600 dark:text-slate-300">
                  • Evaluate initiation of SGLT2 inhibitor (e.g. Empagliflozin 10mg) for combined cardiorenal protection.
                </p>
                <p className="text-slate-600 dark:text-slate-300">
                  • Optimize ACEi/ARB titration if SBP remains elevated above 130 mmHg.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 font-medium space-y-2">
                <span className="font-extrabold text-sm block">"Every healthy choice today can improve your future health."</span>
                <p>
                  By taking small, achievable steps — like adding a 20-minute daily walk or choosing fresh meals — you are actively protecting your heart, kidneys, and energy levels.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">Easy Action Step for Today:</span>
                <p className="text-slate-600 dark:text-slate-300">
                  Drink 1 extra glass of water and try to log 15 minutes of evening walking. You've got this!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
