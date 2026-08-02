import React, { useState } from 'react';
import { HeartPulse, Activity, Zap, Scale, Plus, TrendingUp, AlertTriangle, CheckCircle2, ShieldCheck, Clock, Sparkles } from 'lucide-react';
import { Patient } from '../../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from 'recharts';

interface Props {
  activePatient: Patient;
  onOpenUpdateVitals: () => void;
}

type Timeframe = '1M' | '3M' | '6M' | '1Y';

export const MyHealth: React.FC<Props> = ({ activePatient, onOpenUpdateVitals }) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('3M');

  // Trend Data for 1M, 3M, 6M, 1Y
  const mockTrendDataMap = {
    '1M': [
      { date: 'Week 1', bpSystolic: 142, bpDiastolic: 90, glucose: 155, hba1c: 7.4, weightKg: 81.2, bmi: 27.8, creatinine: 1.2, egfr: 64 },
      { date: 'Week 2', bpSystolic: 140, bpDiastolic: 88, glucose: 148, hba1c: 7.3, weightKg: 80.8, bmi: 27.6, creatinine: 1.15, egfr: 66 },
      { date: 'Week 3', bpSystolic: 138, bpDiastolic: 86, glucose: 142, hba1c: 7.2, weightKg: 80.5, bmi: 27.5, creatinine: 1.12, egfr: 67 },
      { date: 'Week 4', bpSystolic: 136, bpDiastolic: 85, glucose: 138, hba1c: 7.1, weightKg: 80.0, bmi: 27.3, creatinine: 1.10, egfr: 68 },
    ],
    '3M': [
      { date: 'May', bpSystolic: 148, bpDiastolic: 94, glucose: 168, hba1c: 7.8, weightKg: 83.0, bmi: 28.4, creatinine: 1.25, egfr: 61 },
      { date: 'June', bpSystolic: 144, bpDiastolic: 90, glucose: 156, hba1c: 7.5, weightKg: 81.8, bmi: 28.0, creatinine: 1.18, egfr: 65 },
      { date: 'July', bpSystolic: 138, bpDiastolic: 88, glucose: 142, hba1c: 7.2, weightKg: 80.5, bmi: 27.5, creatinine: 1.12, egfr: 67 },
      { date: 'Current', bpSystolic: 136, bpDiastolic: 85, glucose: 138, hba1c: 7.1, weightKg: 80.0, bmi: 27.3, creatinine: 1.10, egfr: 68 },
    ],
    '6M': [
      { date: 'Feb', bpSystolic: 132, bpDiastolic: 84, glucose: 125, hba1c: 6.2, weightKg: 78.0, bmi: 26.7, creatinine: 0.95, egfr: 78 },
      { date: 'Mar', bpSystolic: 138, bpDiastolic: 88, glucose: 140, hba1c: 6.8, weightKg: 79.5, bmi: 27.2, creatinine: 1.05, egfr: 72 },
      { date: 'Apr', bpSystolic: 145, bpDiastolic: 92, glucose: 160, hba1c: 7.6, weightKg: 82.0, bmi: 28.0, creatinine: 1.20, egfr: 63 },
      { date: 'May', bpSystolic: 148, bpDiastolic: 94, glucose: 168, hba1c: 7.8, weightKg: 83.0, bmi: 28.4, creatinine: 1.25, egfr: 61 },
      { date: 'Jun', bpSystolic: 144, bpDiastolic: 90, glucose: 156, hba1c: 7.5, weightKg: 81.8, bmi: 28.0, creatinine: 1.18, egfr: 65 },
      { date: 'Jul', bpSystolic: 136, bpDiastolic: 85, glucose: 138, hba1c: 7.1, weightKg: 80.0, bmi: 27.3, creatinine: 1.10, egfr: 68 },
    ],
    '1Y': [
      { date: 'Aug 25', bpSystolic: 128, bpDiastolic: 80, glucose: 110, hba1c: 5.8, weightKg: 76.5, bmi: 26.2, creatinine: 0.90, egfr: 82 },
      { date: 'Nov 25', bpSystolic: 132, bpDiastolic: 82, glucose: 120, hba1c: 6.1, weightKg: 77.8, bmi: 26.6, creatinine: 0.94, egfr: 80 },
      { date: 'Feb 26', bpSystolic: 138, bpDiastolic: 86, glucose: 135, hba1c: 6.5, weightKg: 79.0, bmi: 27.0, creatinine: 1.02, egfr: 74 },
      { date: 'May 26', bpSystolic: 148, bpDiastolic: 94, glucose: 168, hba1c: 7.8, weightKg: 83.0, bmi: 28.4, creatinine: 1.25, egfr: 61 },
      { date: 'Aug 26', bpSystolic: 136, bpDiastolic: 85, glucose: 138, hba1c: 7.1, weightKg: 80.0, bmi: 27.3, creatinine: 1.10, egfr: 68 },
    ],
  };

  const currentTrendData = mockTrendDataMap[timeframe];

  // Risk Timeline History Data
  const riskTimeline = [
    { period: 'January 2026', risk: 'Low', score: 28, badgeColor: 'bg-emerald-100 text-emerald-800', summary: 'Baseline assessment; normal fasting glucose & stable renal markers.' },
    { period: 'April 2026', risk: 'Moderate', score: 54, badgeColor: 'bg-amber-100 text-amber-800', summary: 'Elevated fasting glucose (160 mg/dL) and HbA1c increase (7.6%).' },
    { period: 'July 2026', risk: 'High', score: 72, badgeColor: 'bg-red-100 text-red-800', summary: 'Peak systolic BP (148 mmHg) combined with eGFR dip (61 mL/min).' },
    { period: 'Current (August)', risk: activePatient.riskLevel, score: activePatient.riskScore || 58, badgeColor: 'bg-blue-100 text-blue-800', summary: 'Improving trajectory following dietary sodium reduction and prescribed Metformin.' },
  ];

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HeartPulse className="w-6 h-6 text-emerald-600" />
            Health Trends & Risk Progression
          </h1>
          <p className="text-xs text-slate-500">
            Biomarker trajectory tracking across Blood Pressure, Glucose, HbA1c, Weight, and Renal Function
          </p>
        </div>

        <button
          onClick={onOpenUpdateVitals}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/20 flex items-center gap-2 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log New Reading</span>
        </button>
      </div>

      {/* TIMEFRAME SELECTION TOOLBAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Select Trend History Horizon:
        </span>
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {(['1M', '3M', '6M', '1Y'] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                timeframe === tf
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tf === '1M' ? '1 Month' : tf === '3M' ? '3 Months' : tf === '6M' ? '6 Months' : '1 Year'}
            </button>
          ))}
        </div>
      </div>

      {/* METRIC BADGES GRID (Improving / Stable / Needs Attention) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Blood Pressure</span>
          <p className="text-sm font-extrabold text-slate-900 dark:text-white">136/85</p>
          <span className="inline-block text-[9px] font-extrabold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
            Improving
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Fasting Glucose</span>
          <p className="text-sm font-extrabold text-slate-900 dark:text-white">138 mg/dL</p>
          <span className="inline-block text-[9px] font-extrabold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
            Improving
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">HbA1c</span>
          <p className="text-sm font-extrabold text-slate-900 dark:text-white">7.1 %</p>
          <span className="inline-block text-[9px] font-extrabold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
            Needs Attention
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Body Weight</span>
          <p className="text-sm font-extrabold text-slate-900 dark:text-white">80.0 kg</p>
          <span className="inline-block text-[9px] font-extrabold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
            Improving
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Serum Creatinine</span>
          <p className="text-sm font-extrabold text-slate-900 dark:text-white">1.10 mg/dL</p>
          <span className="inline-block text-[9px] font-extrabold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
            Stable
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">eGFR Rate</span>
          <p className="text-sm font-extrabold text-slate-900 dark:text-white">68 mL/min</p>
          <span className="inline-block text-[9px] font-extrabold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
            Stable
          </span>
        </div>
      </div>

      {/* TREND CHARTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart 1: Blood Pressure & Glucose */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Blood Pressure & Glucose Trajectory</h3>
              <p className="text-[11px] text-slate-500">Systolic BP vs Fasting Blood Sugar ({timeframe})</p>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full">
              Improving
            </span>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentTrendData}>
                <defs>
                  <linearGradient id="colorBpSys" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorGlu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="bpSystolic" name="Systolic BP (mmHg)" stroke="#2563EB" fillOpacity={1} fill="url(#colorBpSys)" />
                <Area type="monotone" dataKey="glucose" name="Glucose (mg/dL)" stroke="#10B981" fillOpacity={1} fill="url(#colorGlu)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: HbA1c & Body Weight */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">HbA1c & Weight (kg) Trend</h3>
              <p className="text-[11px] text-slate-500">Glycemic percentage and mass curve ({timeframe})</p>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full">
              Needs Attention
            </span>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={currentTrendData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="hba1c" name="HbA1c (%)" stroke="#6366F1" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="weightKg" name="Weight (kg)" stroke="#14B8A6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Renal Panel (Creatinine & eGFR) */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Renal Function Trajectory (Creatinine & eGFR)</h3>
              <p className="text-[11px] text-slate-500">Serum Creatinine (mg/dL) vs Estimated Glomerular Filtration Rate ({timeframe})</p>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full">
              Stable
            </span>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={currentTrendData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" />
                <YAxis YAxisId="left" />
                <YAxis YAxisId="right" orientation="right" />
                <Tooltip />
                <Line type="monotone" dataKey="egfr" name="eGFR (mL/min)" stroke="#059669" strokeWidth={3} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="creatinine" name="Creatinine (mg/dL)" stroke="#D97706" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* RISK TIMELINE PROGRESSION & AI EXPLANATION */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              Risk Score Progression Timeline
            </h3>
            <p className="text-xs text-slate-500">Historical progression of calculated cardiovascular and metabolic risk score</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-full flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> AI Progression Explanation
          </span>
        </div>

        {/* Progression Step Nodes */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 relative">
          {riskTimeline.map((item, idx) => (
            <div
              key={idx}
              className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 relative"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">{item.period}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${item.badgeColor}`}>
                  {item.risk} Risk ({item.score}%)
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {item.summary}
              </p>
            </div>
          ))}
        </div>

        {/* AI Explanation Box */}
        <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 rounded-2xl text-xs space-y-1.5">
          <span className="font-extrabold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-600" /> AI Clinical Progression Explanation
          </span>
          <p className="text-indigo-950 dark:text-indigo-200 leading-relaxed font-medium">
            "Your calculated health risk score increased from Low (28%) in January to High (72%) in July following an elevated HbA1c reading of 7.8% and a spike in systolic blood pressure to 148 mmHg. Since initiating prescribed antihypertensive therapy and dietary sodium constraints, your fasting blood sugar has dropped by 18% and blood pressure has stabilized at 136/85 mmHg, driving your current risk score down towards Moderate (58%). Continued adherence to Dr. Pendelton's recommendations will further lower this trajectory."
          </p>
        </div>
      </div>
    </div>
  );
};
