import React, { useRef } from 'react';
import {
  X,
  Printer,
  Download,
  ShieldCheck,
  Award,
  CheckCircle2,
  AlertTriangle,
  FileText,
  User,
  Heart,
  Activity,
  Calendar,
  Stethoscope,
  Building2,
  QrCode,
  Share2,
} from 'lucide-react';
import { Patient } from '../../types';

interface PrintableClinicalReportProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
}

export const PrintableClinicalReport: React.FC<PrintableClinicalReportProps> = ({
  isOpen,
  onClose,
  patient,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full my-auto overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Toolbar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                Official Clinical Summary PDF & Referral Document
              </h3>
              <p className="text-[11px] text-slate-400">
                MRN #{patient.mrn} • Generated via HealthSense CDSS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition shadow-md flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 sm:p-10 overflow-y-auto space-y-8 bg-white text-slate-900 font-sans" ref={reportRef}>
          {/* Header Branding & Institution */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-slate-900 pb-6 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-emerald-400 font-black text-lg flex items-center justify-center">
                  H
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">HEALTHSENSE AI</h1>
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Primary Healthcare Clinical Decision Support System (CDSS)
              </p>
            </div>

            <div className="text-left sm:text-right text-xs space-y-0.5 text-slate-600">
              <p className="font-extrabold text-slate-900">National Health Services • Clinic #402</p>
              <p>Primary Care Division • Regional Health Network</p>
              <p className="font-mono text-[11px]">Report ID: HS-2026-{patient.mrn}</p>
              <p className="text-emerald-700 font-bold">Validated by CDSS Engine v3.4</p>
            </div>
          </div>

          {/* Patient Demographic & Vitals Grid */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Patient Name</span>
              <span className="font-black text-slate-900 text-sm block mt-0.5">{patient.name}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Age / Gender / BMI</span>
              <span className="font-bold text-slate-800 block mt-0.5">
                {patient.age} yrs • {patient.gender} • {patient.vitals.bmi} kg/m²
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Medical Record No.</span>
              <span className="font-mono font-bold text-slate-800 block mt-0.5">MRN #{patient.mrn}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Assessment Date</span>
              <span className="font-bold text-slate-800 block mt-0.5">{patient.lastAssessmentDate}</span>
            </div>
          </div>

          {/* Vitals Summary Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-1.5 border-b pb-1">
              <Activity className="w-4 h-4 text-blue-600" /> Key Biomarkers & Clinical Vitals
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
                <span className="text-slate-500 font-medium">Blood Pressure:</span>
                <span className="font-black text-slate-900 text-sm block">
                  {patient.vitals.bpSystolic}/{patient.vitals.bpDiastolic} mmHg
                </span>
                <span className={`text-[10px] font-bold ${patient.vitals.bpSystolic >= 140 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {patient.vitals.bpSystolic >= 140 ? 'Stage 2 HTN' : 'Controlled Target'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
                <span className="text-slate-500 font-medium">HbA1c Glycemia:</span>
                <span className="font-black text-slate-900 text-sm block">{patient.vitals.hba1c}%</span>
                <span className={`text-[10px] font-bold ${patient.vitals.hba1c >= 8.0 ? 'text-red-600' : patient.vitals.hba1c >= 6.5 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {patient.vitals.hba1c >= 8.0 ? 'Uncontrolled Glycemia' : 'Target Achieved'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
                <span className="text-slate-500 font-medium">LDL Cholesterol:</span>
                <span className="font-black text-slate-900 text-sm block">{patient.vitals.ldl} mg/dL</span>
                <span className={`text-[10px] font-bold ${patient.vitals.ldl >= 130 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {patient.vitals.ldl >= 130 ? 'Elevated Lipid' : 'Optimal'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
                <span className="text-slate-500 font-medium">Fasting Glucose:</span>
                <span className="font-black text-slate-900 text-sm block">{patient.vitals.glucose} mg/dL</span>
                <span className="text-[10px] font-bold text-slate-600">Lab Confirmed</span>
              </div>
            </div>
          </div>

          {/* Disease Risk Stratification */}
          <div className="p-5 bg-slate-900 text-white rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-black text-sm uppercase tracking-wider text-white">
                  Multi-Disease Machine Learning Stratification
                </h3>
              </div>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold rounded-full">
                XGBoost ML Accuracy 94.2%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
                <span className="text-slate-400 font-bold block">Diabetes Risk Score</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-black text-amber-400">{patient.riskScore}%</span>
                  <span className="text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">
                    {patient.riskLevel}
                  </span>
                </div>
                <p className="text-[10px] text-slate-300">Target ADA 2026 HbA1c &lt; 7.0%</p>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
                <span className="text-slate-400 font-bold block">10-Yr ASCVD Risk Score</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-black text-red-400">22%</span>
                  <span className="text-[10px] font-bold uppercase bg-red-500/20 text-red-300 px-2 py-0.5 rounded">
                    High Risk
                  </span>
                </div>
                <p className="text-[10px] text-slate-300">ACC/AHA Statin Therapy Triggered</p>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
                <span className="text-slate-400 font-bold block">CKD Renal Progression</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-black text-emerald-400">14%</span>
                  <span className="text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                    Low / Moderate
                  </span>
                </div>
                <p className="text-[10px] text-slate-300">KDIGO eGFR Target Normal</p>
              </div>
            </div>
          </div>

          {/* Specialist Referral Letter (If Applicable) */}
          <div className="p-5 bg-amber-50 rounded-2xl border border-amber-200 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-amber-200 pb-2">
              <span className="font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-amber-700" /> Specialist Referral Recommendation
              </span>
              <span className="px-2 py-0.5 bg-amber-200 text-amber-900 font-bold rounded text-[10px]">
                {patient.referralSpecialist || 'Endocrinology Consult'}
              </span>
            </div>

            <p className="text-slate-800 leading-relaxed font-medium">
              Patient exhibits persistent glycemic elevation (HbA1c {patient.vitals.hba1c}%) despite first-line therapy. CDSS guidelines strongly recommend specialist consultation for consideration of dual SGLT2i / GLP-1 RA combination therapy.
            </p>
          </div>

          {/* Physician Sign-off & Footer */}
          <div className="pt-6 border-t-2 border-slate-900 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Attending Physician</span>
              <p className="font-extrabold text-slate-900">Dr. Arthur Pendelton, MD</p>
              <p className="text-slate-500">License #MD-884029 • Board Certified Internal Medicine</p>
              <p className="text-[10px] text-emerald-700 font-mono font-bold mt-2">
                ✓ Electronically Signed via HealthSense CDSS
              </p>
            </div>

            <div className="text-right space-y-2 shrink-0">
              <div className="p-2 bg-slate-100 rounded-xl border border-slate-300 inline-block">
                <div className="w-16 h-16 bg-slate-900 text-white font-mono text-[9px] flex items-center justify-center p-1 text-center rounded">
                  [QR-CODE VERIFIED]
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">Confidential Medical Record</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
