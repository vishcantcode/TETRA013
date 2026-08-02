import React from 'react';
import { History, Calendar, Stethoscope, FileText, CheckCircle2, Bell, ShieldCheck, Clock, ArrowRight } from 'lucide-react';
import { Patient } from '../../types';

interface Props {
  activePatient: Patient;
}

export const PatientHistory: React.FC<Props> = ({ activePatient }) => {
  const careJourneySteps = [
    { id: 'cj-1', title: 'Health Assessment Completed', date: 'June 18, 2026', status: 'Completed', desc: '10-Stage CDSS Risk Assessment completed with Dr. Arthur Pendelton.' },
    { id: 'cj-2', title: 'Blood Report Uploaded', date: 'July 28, 2026', status: 'Completed', desc: 'Pathology lab report parsed via Optical Character Recognition (OCR).' },
    { id: 'cj-3', title: 'AI Analysis Completed', date: 'July 28, 2026', status: 'Completed', desc: 'Biomarkers parsed and compared against standard reference ranges.' },
    { id: 'cj-4', title: 'Doctor Reviewed Results', date: 'July 29, 2026', status: 'Completed', desc: 'Dr. Pendelton signed off on medical assessment & lifestyle guidelines.' },
    { id: 'cj-5', title: 'Lifestyle Plan Generated', date: 'July 29, 2026', status: 'Active', desc: 'Low-sodium glycemic diet & 30-min walk protocol active.' },
    { id: 'cj-6', title: 'Follow-up Scheduled', date: 'August 12, 2026', status: 'Upcoming', desc: 'In-person clinic consultation booked for 10:30 AM.' },
    { id: 'cj-7', title: 'Repeat Investigation Due', date: 'August 28, 2026', status: 'Scheduled', desc: 'Repeat serum creatinine & eGFR panel due at Quest Diagnostics.' },
  ];

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <History className="w-6 h-6 text-blue-600" />
          Care Journey & Follow-up Center
        </h1>
        <p className="text-xs text-slate-500">
          Chronological record of clinical milestones, doctor consultations, pending lab tests, and automated reminders
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Complete Care Journey Timeline */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              Complete Care Journey Timeline
            </h2>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-full">
              7 Key Milestones
            </span>
          </div>

          <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 pl-8">
            {careJourneySteps.map((step) => (
              <div key={step.id} className="relative space-y-1.5">
                <div
                  className={`absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full ring-4 ring-white dark:ring-slate-900 ${
                    step.status === 'Completed'
                      ? 'bg-emerald-500'
                      : step.status === 'Active'
                      ? 'bg-blue-600'
                      : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                />
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{step.title}</span>
                  <span className="text-xs text-slate-400 font-semibold">{step.date}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{step.desc}</p>
                <div className="pt-1 flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      step.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : step.status === 'Active'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    Status: {step.status}
                  </span>
                  <span className="text-[10px] text-slate-400">Attending Doctor: {activePatient.primaryDoctor}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Column: Follow-Up Center & Reminders */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" />
                Follow-Up Center
              </h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 rounded-2xl space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-amber-900 dark:text-amber-200">Pending Lab Tests</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-200 text-amber-800 rounded-md">2 Action Items</span>
                </div>
                <p className="text-amber-800 dark:text-amber-300 font-medium">1. Repeat HbA1c Panel (Due in 5 days)</p>
                <p className="text-amber-800 dark:text-amber-300 font-medium">2. Repeat Serum Creatinine & eGFR</p>
              </div>

              <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 rounded-2xl space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-blue-900 dark:text-blue-200">Upcoming Follow-Up</span>
                  <span className="text-[10px] text-blue-700 font-bold">Aug 12, 2026</span>
                </div>
                <p className="text-blue-800 dark:text-blue-300">In-person consultation booked with {activePatient.primaryDoctor}</p>
              </div>

              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-emerald-900 dark:text-emerald-200">Referral Status</span>
                  <span className="text-[10px] text-emerald-700 font-bold">Confirmed</span>
                </div>
                <p className="text-emerald-800 dark:text-emerald-300">
                  {activePatient.referralSpecialist || 'Nephrology Specialist Review'}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Generated Health Reminders</span>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Repeat HbA1c (Due within 7 days)</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Repeat Creatinine (Due in 3 weeks)</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Annual Lipid Profile (Due in 2 months)</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Blood Pressure Logs (Bi-weekly)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
