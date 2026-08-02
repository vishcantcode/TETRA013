import React from 'react';
import {
  Stethoscope,
  UserCheck,
  Activity,
  ArrowRight,
  ShieldCheck,
  Microscope,
  Zap,
  TrendingUp,
  BrainCircuit,
  FileCheck2,
  Heart,
  PhoneCall,
  BellRing,
} from 'lucide-react';
import { Mode } from '../types';

interface LandingPageProps {
  setMode: (mode: Mode) => void;
  isHighContrast: boolean;
  onLaunchDemo?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ setMode, isHighContrast, onLaunchDemo }) => {
  return (
    <div className={`min-h-[calc(100vh-4rem)] transition-colors ${
      isHighContrast ? 'bg-black text-yellow-300' : 'bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100'
    }`}>
      {/* Hero Section */}
      <div className="relative overflow-hidden py-12 md:py-20 px-4 sm:px-6 lg:px-8">
        {/* Background Subtle Gradient Blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-500/10 via-emerald-500/10 to-indigo-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          {/* Clinical Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 shadow-sm">
            <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span>Next-Generation Healthcare Decision Platform</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            HealthSense <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-emerald-600 to-indigo-600">AI</span>
          </h1>

          {/* Subtitle required by prompt */}
          <p className="text-lg sm:text-2xl font-medium text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            AI-Powered Clinical Decision Support System for Early Detection and Referral of Lifestyle Diseases.
          </p>

          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Empowering primary healthcare doctors and patients with evidence-based screening recommendations, explainable risk markers, and automated specialist referral pathways.
          </p>

          {/* HACKATHON PRESENTATION MODE HERO BANNER */}
          {onLaunchDemo && (
            <div className="pt-4 max-w-2xl mx-auto">
              <button
                onClick={onLaunchDemo}
                className="w-full p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 hover:from-slate-850 hover:to-indigo-900 border-2 border-emerald-500/50 hover:border-emerald-400 text-white shadow-2xl transition transform hover:scale-[1.01] flex items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-3.5 text-left">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
                    <Zap className="w-6 h-6 text-emerald-400 animate-pulse" />
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 font-black text-[10px] rounded-full border border-emerald-400/30 uppercase tracking-wider block w-fit mb-1">
                      Hackathon Demo Experience
                    </span>
                    <h3 className="font-black text-base text-white group-hover:text-emerald-300 transition">
                      Launch Presentation Mode
                    </h3>
                    <p className="text-xs text-slate-300">
                      Experience complete 2-minute workflow with preloaded patient scenarios
                    </p>
                  </div>
                </div>

                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform font-black">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </button>
            </div>
          )}
        </div>

        {/* THREE INTERACTIVE MODE CARDS */}
        <div className="max-w-6xl mx-auto mt-12 grid lg:grid-cols-3 gap-6 px-2 relative z-10">
          {/* DOCTOR MODE CARD */}
          <div
            onClick={() => setMode('doctor')}
            className={`group relative rounded-3xl p-8 border transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between shadow-xl hover:shadow-2xl hover:-translate-y-1 ${
              isHighContrast
                ? 'bg-black border-yellow-400 hover:border-yellow-300'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-500/50'
            }`}
          >
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />

            <div className="space-y-6">
              {/* Doctor Header & Icon Illustration */}
              <div className="flex items-center justify-between">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                  <Stethoscope className="w-8 h-8" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  Primary Care Provider
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition">
                  Doctor Mode
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Access Population Health Dashboards, CDSS Risk Calculators, EHR Patient Profiles, Lab Analysis, and Automated Referral Generators.
                </p>
              </div>

              {/* Feature Checklist */}
              <ul className="space-y-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>ADA & ACC/AHA Evidence-Based Screening Guidelines</span>
                </li>
                <li className="flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>Explainable AI Risk Attribution (Diabetes, CVD, NAFLD)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Microscope className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Automated Lab Biomarker Extraction & Parsing</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Launch Doctor Console
              </span>
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center group-hover:translate-x-1 transition-transform shadow-md shadow-blue-600/30">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* PATIENT MODE CARD */}
          <div
            onClick={() => setMode('patient')}
            className={`group relative rounded-3xl p-8 border transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between shadow-xl hover:shadow-2xl hover:-translate-y-1 ${
              isHighContrast
                ? 'bg-black border-yellow-400 hover:border-yellow-300'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500/50'
            }`}
          >
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 to-teal-500" />

            <div className="space-y-6">
              {/* Patient Header & Icon Illustration */}
              <div className="flex items-center justify-between">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                  <UserCheck className="w-8 h-8" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Patient Portal
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition">
                  Patient Mode
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Track Vitals, View Plain-English AI Health Summaries, Schedule Medication Reminders, and Monitor Weekly Lifestyle Goals.
                </p>
              </div>

              {/* Feature Checklist */}
              <ul className="space-y-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Real-Time Vitals Tracking (Blood Pressure, Glucose, BMI)</span>
                </li>
                <li className="flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-teal-500 shrink-0" />
                  <span>Plain-English Lab Result AI Explanation</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Personalized Preventive Care & Diet Recommendations</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Launch Patient Portal
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center group-hover:translate-x-1 transition-transform shadow-md shadow-emerald-600/30">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* FAMILY CAREGIVER MODE CARD */}
          <div
            onClick={() => setMode('caregiver')}
            className={`group relative rounded-3xl p-8 border transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between shadow-xl hover:shadow-2xl hover:-translate-y-1 ${
              isHighContrast
                ? 'bg-black border-yellow-400 hover:border-yellow-300'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-purple-500/50'
            }`}
          >
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600" />

            <div className="space-y-6">
              {/* Caregiver Header & Icon Illustration */}
              <div className="flex items-center justify-between">
                <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                  <Heart className="w-8 h-8 fill-current" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                  Family Portal
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-purple-600 transition">
                  Family Caregiver Mode
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Monitor Loved Ones' Medicine Adherence, Upcoming Appointments, Pending Tests, Referrals, Emergency Alerts, and Manage Emergency Contacts.
                </p>
              </div>

              {/* Feature Checklist */}
              <ul className="space-y-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <BellRing className="w-4 h-4 text-purple-500 shrink-0" />
                  <span>Real-Time Adherence & Low Refill Warnings</span>
                </li>
                <li className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>1-Touch Emergency Contact Network & SOS Trigger</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Read-Only Clinical Safeguards Protecting Prescriptions</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                Launch Caregiver Portal
              </span>
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center group-hover:translate-x-1 transition-transform shadow-md shadow-purple-600/30">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Platform Stats & Capabilities Banner */}
        <div className="max-w-5xl mx-auto mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-lg">
          <div className="text-center p-3">
            <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">98.4%</p>
            <p className="text-xs font-medium text-slate-500 mt-1">Guideline Alignment Target</p>
          </div>
          <div className="text-center p-3 border-l border-slate-100 dark:border-slate-800">
            <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">5 Tracks</p>
            <p className="text-xs font-medium text-slate-500 mt-1">Lifestyle Disease Screening</p>
          </div>
          <div className="text-center p-3 border-l border-slate-100 dark:border-slate-800">
            <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">Instant</p>
            <p className="text-xs font-medium text-slate-500 mt-1">Specialist Referral Drafts</p>
          </div>
          <div className="text-center p-3 border-l border-slate-100 dark:border-slate-800">
            <p className="text-3xl font-extrabold text-amber-500">HIPAA</p>
            <p className="text-xs font-medium text-slate-500 mt-1">Ready Design Architecture</p>
          </div>
        </div>
      </div>
    </div>
  );
};
