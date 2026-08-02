import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Edit3,
  FileText,
  Clock,
  UserCheck,
  Stethoscope,
  Activity,
  Calendar,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Copy,
  Printer,
  Download,
  ListCheck,
  Sliders,
  Plus,
  RefreshCw,
  Search,
  ExternalLink,
  Info,
  ArrowRight,
  User,
  Heart,
  Zap,
  CheckSquare,
  Square,
  AlertCircle,
  HelpCircle,
  Settings2,
} from 'lucide-react';
import { Patient, Vitals } from '../../types';
import { ClinicalGuidelineEngine } from '../../services/clinicalGuidelineEngine';
import {
  GuidelineEngineResult,
  GuidelineRuleResult,
  DiseaseCategory,
  DoctorApprovalStatus,
  PatientCarePlan,
  GuidelineRule,
} from '../../types/clinicalGuideline';

interface Props {
  activePatient: Patient;
  customVitals?: Partial<Vitals>;
}

export const ClinicalGuidelineEngineDashboard: React.FC<Props> = ({
  activePatient,
  customVitals,
}) => {
  const [engineResult, setEngineResult] = useState<GuidelineEngineResult | null>(null);
  const [selectedDiseaseFilter, setSelectedDiseaseFilter] = useState<string>('All');
  const [expandedRuleId, setExpandedRuleId] = useState<string | null>(null);

  // Doctor Approval State tracking
  const [approvalStates, setApprovalStates] = useState<Record<string, DoctorApprovalStatus>>({});
  const [doctorNotes, setDoctorNotes] = useState<Record<string, string>>({});
  const [modifiedRecs, setModifiedRecs] = useState<Record<string, string>>({});
  const [activeNoteEditId, setActiveNoteEditId] = useState<string | null>(null);
  const [activeModEditId, setActiveModEditId] = useState<string | null>(null);

  // Modals
  const [isCarePlanModalOpen, setIsCarePlanModalOpen] = useState(false);
  const [generatedCarePlan, setGeneratedCarePlan] = useState<PatientCarePlan | null>(null);
  const [isKnowledgeBaseModalOpen, setIsKnowledgeBaseModalOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Engine instance
  const engine = ClinicalGuidelineEngine.getInstance();

  useEffect(() => {
    const res = engine.evaluatePatient(activePatient, customVitals);
    setEngineResult(res);

    // Initialize approval states for triggered rules
    const initStates: Record<string, DoctorApprovalStatus> = {};
    res.triggeredRules.forEach((tr) => {
      initStates[tr.rule.ruleId] = 'Pending';
    });
    setApprovalStates(initStates);
  }, [activePatient, customVitals]);

  if (!engineResult) return null;

  const {
    allRulesEvaluated,
    triggeredRules,
    missingInvestigations,
    referrals,
    followUpSchedules,
    alerts,
    diseaseRiskSummaries,
  } = engineResult;

  // Filter rules by selected disease tab
  const filteredRules =
    selectedDiseaseFilter === 'All'
      ? triggeredRules
      : triggeredRules.filter((tr) => tr.rule.disease === selectedDiseaseFilter);

  // Approval status handlers
  const handleSetApproval = (ruleId: string, status: DoctorApprovalStatus) => {
    setApprovalStates((prev) => ({ ...prev, [ruleId]: status }));
  };

  const handleSaveNote = (ruleId: string, note: string) => {
    setDoctorNotes((prev) => ({ ...prev, [ruleId]: note }));
    setActiveNoteEditId(null);
  };

  const handleSaveMod = (ruleId: string, modText: string) => {
    setModifiedRecs((prev) => ({ ...prev, [ruleId]: modText }));
    setApprovalStates((prev) => ({ ...prev, [ruleId]: 'Modified' }));
    setActiveModEditId(null);
  };

  // Generate Care Plan
  const handleGenerateCarePlan = () => {
    const approvedIds = Object.keys(approvalStates).filter(
      (id) => approvalStates[id] === 'Approved' || approvalStates[id] === 'Modified'
    );

    const carePlan = engine.generatePatientCarePlan(
      engineResult,
      approvedIds,
      modifiedRecs,
      doctorNotes,
      'Dr. Arthur Pendelton, MD'
    );

    setGeneratedCarePlan(carePlan);
    setIsCarePlanModalOpen(true);
  };

  const handleCopyGuidelineSummary = () => {
    const text = `HEALTHSENSE AI - CLINICAL GUIDELINE ENGINE REPORT
Patient: ${activePatient.name} (MRN: #${activePatient.mrn})
Evaluated: ${new Date(engineResult.evaluatedAt).toLocaleString()}
Active Disease Risks: ${diseaseRiskSummaries.map((d) => `${d.disease}: ${d.riskLevel}`).join(', ')}

TRIGGERED CLINICAL GUIDELINE RULES (${triggeredRules.length}):
${triggeredRules
  .map(
    (tr, i) =>
      `${i + 1}. [${tr.rule.ruleId}] ${tr.rule.ruleName} (${tr.rule.priority} Priority)
   Guideline: ${tr.rule.supportingGuideline}
   Recommendation: ${modifiedRecs[tr.rule.ruleId] || tr.rule.recommendation}
   Doctor Approval: ${approvalStates[tr.rule.ruleId] || 'Pending'}`
  )
  .join('\n\n')}

RECOMMENDED INVESTIGATIONS (${missingInvestigations.length}):
${missingInvestigations.map((m) => `- ${m.investigation} (${m.priority} Priority): ${m.reason}`).join('\n')}

SPECIALIST REFERRALS (${referrals.length}):
${referrals.map((r) => `- ${r.specialist} (${r.priority} Priority): ${r.reason}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const approvedCount = Object.values(approvalStates).filter(
    (s) => s === 'Approved' || s === 'Modified'
  ).length;
  const rejectedCount = Object.values(approvalStates).filter((s) => s === 'Rejected').length;
  const pendingCount = Object.values(approvalStates).filter((s) => s === 'Pending').length;

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden space-y-5">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/10">
              <BookOpen className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Clinical Guideline & Evidence Engine
                </h1>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] rounded-full border border-emerald-400/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Guidelines 2026
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Modular clinical reasoning backbone mapping patient data against ADA, ACC/AHA, KDIGO & AHA/ASA practice guidelines.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsKnowledgeBaseModalOpen(true)}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition border border-white/20 flex items-center gap-1.5"
            >
              <Settings2 className="w-3.5 h-3.5 text-emerald-400" /> Knowledge Base Rules
            </button>
            <button
              onClick={handleCopyGuidelineSummary}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
            >
              {copySuccess ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copySuccess ? 'Copied Summary!' : 'Copy Summary'}
            </button>
          </div>
        </div>

        {/* Quick Disease Risk Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
          {diseaseRiskSummaries.map((d) => (
            <div
              key={d.disease}
              onClick={() => setSelectedDiseaseFilter(d.disease)}
              className={`p-3 rounded-2xl border transition cursor-pointer ${
                selectedDiseaseFilter === d.disease
                  ? 'bg-emerald-500/30 border-emerald-400 text-white shadow-md'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300">
                  {d.disease}
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    d.riskLevel === 'Critical'
                      ? 'bg-red-400 animate-ping'
                      : d.riskLevel === 'High'
                      ? 'bg-amber-400'
                      : d.riskLevel === 'Attention'
                      ? 'bg-yellow-400'
                      : 'bg-emerald-400'
                  }`}
                />
              </div>
              <div className="mt-1 font-black text-xs text-white">
                {d.triggeredRulesCount} Rules Flagged
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 1: ALERT ENGINE BANNER */}
      <div className="space-y-3">
        <span className="text-[10px] uppercase font-black text-emerald-600 dark:text-emerald-400 tracking-widest block">
          SECTION 1 • ALERT ENGINE
        </span>

        {alerts.map((alt) => {
          const isEmergency = alt.alertLevel === 'Emergency Referral';
          const isUrgent = alt.alertLevel === 'Urgent Review';
          const isHigh = alt.alertLevel === 'High Risk';

          return (
            <div
              key={alt.id}
              className={`p-5 rounded-3xl border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                isEmergency
                  ? 'bg-red-900 text-white border-red-700'
                  : isUrgent
                  ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/60 text-red-900 dark:text-red-200'
                  : isHigh
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200'
                  : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    isEmergency
                      ? 'bg-white text-red-700 animate-bounce'
                      : isUrgent
                      ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300'
                      : isHigh
                      ? 'bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300'
                      : 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300'
                  }`}
                >
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10">
                      {alt.alertLevel}
                    </span>
                    <h3 className="font-black text-sm">{alt.title}</h3>
                  </div>
                  <p className="text-xs font-medium opacity-90">{alt.reason}</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {alt.supportingFindings.map((f, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/40 dark:bg-black/20"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="shrink-0 self-start sm:self-center text-right space-y-1">
                <span className="text-[10px] font-bold uppercase opacity-75 block">Recommended Action</span>
                <span className="px-3 py-1.5 bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-xl text-xs font-black inline-block border border-white/20">
                  {alt.recommendedAction}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* SECTION 2: MODULAR DISEASE RULE SETS & DOCTOR APPROVAL WORKFLOW */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">
              SECTION 2 • EVIDENCE-BASED RULE SETS & CLINICAL APPROVAL
            </span>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
              <Stethoscope className="w-5 h-5 text-emerald-600" />
              Triggered Guideline Recommendations & Physician Review
            </h2>
          </div>

          {/* Disease Category Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
            {['All', 'Diabetes', 'Hypertension', 'CKD', 'Cardiovascular', 'Stroke'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedDiseaseFilter(cat)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                  selectedDiseaseFilter === cat
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Physican Approval Advisory Warning */}
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl flex items-center gap-3 text-xs text-amber-900 dark:text-amber-200 font-medium">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Physician Advisory Mandate:</strong> HealthSense AI guidelines are strictly decision-support advisories. The AI never finalizes care decisions — every item requires explicit doctor approval, modification, or rejection.
          </span>
        </div>

        {/* Rules List */}
        <div className="space-y-4">
          {filteredRules.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-xs font-bold">No guideline rule triggers active for category: {selectedDiseaseFilter}</p>
            </div>
          ) : (
            filteredRules.map((tr) => {
              const rule = tr.rule;
              const approval = approvalStates[rule.ruleId] || 'Pending';
              const isExpanded = expandedRuleId === rule.ruleId;
              const doctorNote = doctorNotes[rule.ruleId];
              const customMod = modifiedRecs[rule.ruleId];

              return (
                <div
                  key={rule.ruleId}
                  className={`border rounded-2xl transition-all overflow-hidden ${
                    approval === 'Approved'
                      ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/10'
                      : approval === 'Modified'
                      ? 'border-blue-300 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/10'
                      : approval === 'Rejected'
                      ? 'border-red-300 dark:border-red-900/60 bg-red-50/20 dark:bg-red-950/10 opacity-75'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/50'
                  }`}
                >
                  {/* Card Main Row */}
                  <div className="p-4 sm:p-5 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold px-2.5 py-1 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg">
                          {rule.ruleId}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-black text-sm text-slate-900 dark:text-white">
                              {rule.ruleName}
                            </h3>
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                                rule.priority === 'Urgent'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                                  : rule.priority === 'High'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              }`}
                            >
                              {rule.priority} Priority
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Supporting Guideline: <strong className="text-emerald-700 dark:text-emerald-400">{rule.supportingGuideline}</strong>
                          </p>
                        </div>
                      </div>

                      {/* Approval Status Badge & Actions */}
                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <span
                          className={`px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 ${
                            approval === 'Approved'
                              ? 'bg-emerald-600 text-white'
                              : approval === 'Modified'
                              ? 'bg-blue-600 text-white'
                              : approval === 'Rejected'
                              ? 'bg-red-600 text-white'
                              : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {approval === 'Approved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {approval === 'Modified' && <Edit3 className="w-3.5 h-3.5" />}
                          {approval === 'Rejected' && <XCircle className="w-3.5 h-3.5" />}
                          {approval === 'Pending' && <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />}
                          <span>{approval}</span>
                        </span>

                        <button
                          onClick={() => setExpandedRuleId(isExpanded ? null : rule.ruleId)}
                          className="p-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 transition"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Recommendation Box */}
                    <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Evidence-Based Clinical Recommendation:
                      </span>
                      <p className="text-xs text-slate-800 dark:text-slate-200 font-semibold leading-relaxed">
                        {customMod ? (
                          <span className="text-blue-600 dark:text-blue-400 font-bold">
                            [Doctor Modified] {customMod}
                          </span>
                        ) : (
                          rule.recommendation
                        )}
                      </p>
                    </div>

                    {/* DOCTOR APPROVAL INTERACTIVE CONTROL BUTTONS */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => handleSetApproval(rule.ruleId, 'Approved')}
                          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
                            approval === 'Approved'
                              ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                        </button>

                        <button
                          onClick={() => {
                            setActiveModEditId(rule.ruleId);
                            setExpandedRuleId(rule.ruleId);
                          }}
                          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
                            approval === 'Modified'
                              ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                              : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100'
                          }`}
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Modify
                        </button>

                        <button
                          onClick={() => handleSetApproval(rule.ruleId, 'Rejected')}
                          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
                            approval === 'Rejected'
                              ? 'bg-red-600 text-white ring-2 ring-red-400'
                              : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 hover:bg-red-100'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>

                        <button
                          onClick={() => setActiveNoteEditId(activeNoteEditId === rule.ruleId ? null : rule.ruleId)}
                          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5 text-purple-500" />
                          {doctorNote ? 'Edit Notes' : '+ Add Note'}
                        </button>
                      </div>

                      {doctorNote && (
                        <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-lg border border-purple-200">
                          Note: {doctorNote}
                        </span>
                      )}
                    </div>

                    {/* Inline Modify Input */}
                    {activeModEditId === rule.ruleId && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 rounded-xl space-y-2">
                        <span className="text-xs font-bold text-blue-900 dark:text-blue-200">
                          Custom Doctor Modification for {rule.ruleId}:
                        </span>
                        <textarea
                          defaultValue={customMod || rule.recommendation}
                          id={`mod-text-${rule.ruleId}`}
                          rows={2}
                          className="w-full text-xs p-2.5 rounded-lg border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setActiveModEditId(null)}
                            className="px-3 py-1 text-xs font-bold text-slate-500 hover:text-slate-700"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              const textarea = document.getElementById(
                                `mod-text-${rule.ruleId}`
                              ) as HTMLTextAreaElement;
                              if (textarea) handleSaveMod(rule.ruleId, textarea.value);
                            }}
                            className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-500"
                          >
                            Save Modification
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Inline Note Input */}
                    {activeNoteEditId === rule.ruleId && (
                      <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 rounded-xl space-y-2">
                        <span className="text-xs font-bold text-purple-900 dark:text-purple-200">
                          Add Clinical Justification Note for {rule.ruleId}:
                        </span>
                        <input
                          type="text"
                          defaultValue={doctorNote || ''}
                          id={`note-text-${rule.ruleId}`}
                          placeholder="e.g. Patient prefers oral therapy over injectable..."
                          className="w-full text-xs p-2 rounded-lg border border-purple-300 dark:border-purple-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setActiveNoteEditId(null)}
                            className="px-3 py-1 text-xs font-bold text-slate-500 hover:text-slate-700"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              const input = document.getElementById(
                                `note-text-${rule.ruleId}`
                              ) as HTMLInputElement;
                              if (input) handleSaveNote(rule.ruleId, input.value);
                            }}
                            className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-500"
                          >
                            Save Note
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Expandable Details: Conditions & Clinical Reason */}
                    {isExpanded && (
                      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                        <div>
                          <strong className="text-slate-500 uppercase text-[10px]">Condition Evaluated:</strong>
                          <p className="text-slate-700 dark:text-slate-300 font-mono text-[11px] bg-slate-100 dark:bg-slate-800 p-2 rounded-lg mt-0.5">
                            {rule.conditionsDescription}
                          </p>
                        </div>
                        <div>
                          <strong className="text-slate-500 uppercase text-[10px]">Pathophysiological Justification:</strong>
                          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
                            {rule.clinicalReason}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* SECTION 3: MISSING INVESTIGATION ENGINE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">
              SECTION 3 • MISSING INVESTIGATION ENGINE
            </span>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
              <FileText className="w-5 h-5 text-emerald-600" />
              Recommended & Overdue Diagnostic Investigations
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-xl">
            {missingInvestigations.length} Recommended Tests
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider">
                <th className="py-3 px-3">Investigation</th>
                <th className="py-3 px-3">Disease Origin</th>
                <th className="py-3 px-3">Clinical Reason</th>
                <th className="py-3 px-3">Importance</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {missingInvestigations.map((mi) => (
                <tr key={mi.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 font-extrabold text-slate-900 dark:text-white">
                    {mi.investigation}
                  </td>
                  <td className="py-3 px-3 text-slate-500 font-bold">
                    {mi.diseaseOrigin}
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300 max-w-xs">
                    {mi.reason}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold rounded-md">
                      {mi.clinicalImportance}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-black rounded-full ${
                        mi.priority === 'Urgent'
                          ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          : mi.priority === 'High'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {mi.priority}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-700 dark:text-slate-300">
                    {mi.status === 'Overdue' ? (
                      <span className="text-red-600 dark:text-red-400 font-black">Overdue</span>
                    ) : (
                      mi.status
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 4: REFERRAL ENGINE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">
            SECTION 4 • REFERRAL ENGINE
          </span>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            Specialist Referral Guidance & Clinical Timelines
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {referrals.map((ref) => (
            <div
              key={ref.id}
              className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-black rounded-xl flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" /> {ref.specialist}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-black rounded-md ${
                      ref.priority === 'Urgent'
                        ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {ref.priority} Priority
                  </span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-snug">
                  {ref.reason}
                </p>

                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 text-[11px]">
                  <strong className="text-slate-500 uppercase text-[10px] block">Referral Summary:</strong>
                  <p className="text-slate-600 dark:text-slate-400">{ref.referralSummary}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Suggested Timeline:</span>
                <span className="font-extrabold text-emerald-700 dark:text-emerald-400">
                  {ref.suggestedTimeline}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 5: FOLLOW-UP ENGINE & TIMELINE VISUALIZATION */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">
            SECTION 5 • FOLLOW-UP ENGINE
          </span>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
            <Clock className="w-5 h-5 text-emerald-600" />
            Interactive Follow-Up Schedule & Timeline
          </h3>
        </div>

        <div className="space-y-4">
          {followUpSchedules.map((fu, idx) => (
            <div
              key={fu.id}
              className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20">
                  {fu.interval}
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">
                    {fu.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    {fu.reason}
                  </p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
                    Focus: {fu.focusArea}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 shrink-0 self-start md:self-center">
                {fu.recommendedTests.map((t, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold rounded-lg"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM STICKY ACTION BAR FOR DOCTOR APPROVAL */}
      <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
            <CheckSquare className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-white">Physician Approval Status</h4>
            <p className="text-xs text-slate-300">
              {approvedCount} Approved / Modified • {pendingCount} Pending • {rejectedCount} Rejected
            </p>
          </div>
        </div>

        <button
          onClick={handleGenerateCarePlan}
          className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-2xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Generate Approved Patient Care Plan
        </button>
      </div>

      {/* MODAL 1: GENERATED PATIENT CARE PLAN (PLAIN LANGUAGE) */}
      {isCarePlanModalOpen && generatedCarePlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider block">
                    DOCTOR-APPROVED PATIENT CARE PLAN
                  </span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Health Plan for {generatedCarePlan.patientName} ({generatedCarePlan.patientMrn})
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setIsCarePlanModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl"
              >
                ✕
              </button>
            </div>

            {/* Plain Language Care Plan Content */}
            <div className="space-y-5 text-xs text-slate-700 dark:text-slate-300">
              <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl space-y-2">
                <span className="font-extrabold text-emerald-900 dark:text-emerald-200 block text-sm">
                  Doctor's Summary
                </span>
                <p className="leading-relaxed">{generatedCarePlan.plainLanguageSummary}</p>
              </div>

              {/* Next Tests */}
              <div className="space-y-2">
                <h4 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" /> Upcoming Tests & Investigations
                </h4>
                <ul className="space-y-2">
                  {generatedCarePlan.nextTests.map((t, idx) => (
                    <li
                      key={idx}
                      className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center"
                    >
                      <div>
                        <strong className="text-slate-900 dark:text-white block">{t.name}</strong>
                        <span className="text-slate-500">{t.reason}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">
                        {t.timeframe}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Lifestyle Advice */}
              <div className="space-y-2">
                <h4 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-emerald-600" /> Daily Healthy Lifestyle Guidance
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {generatedCarePlan.lifestyleAdvice.map((la, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1"
                    >
                      <strong className="text-slate-900 dark:text-white text-[11px] block">{la.category}</strong>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">{la.advice}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Referrals */}
              {generatedCarePlan.referralDetails.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-600" /> Specialist Consultations
                  </h4>
                  <ul className="space-y-1.5">
                    {generatedCarePlan.referralDetails.map((ref, idx) => (
                      <li
                        key={idx}
                        className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center"
                      >
                        <div>
                          <strong className="text-slate-900 dark:text-white">{ref.specialist}</strong>
                          <p className="text-[11px] text-slate-500">{ref.purpose}</p>
                        </div>
                        <span className="text-[10px] font-extrabold text-emerald-600">{ref.timeline}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Follow up */}
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-between text-xs font-bold">
                <span>Recommended Next Follow-up Visit:</span>
                <span className="text-emerald-600 font-black">{generatedCarePlan.followUpDate}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <span className="text-[11px] text-slate-400">
                Approved by {generatedCarePlan.doctorApprovedBy} on {generatedCarePlan.generatedDate}
              </span>
              <button
                onClick={() => {
                  alert('Patient Care Plan sent to EHR portal & printed successfully!');
                  setIsCarePlanModalOpen(false);
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl transition"
              >
                Send Care Plan to Patient Portal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIGURABLE KNOWLEDGE BASE INSPECTOR */}
      {isKnowledgeBaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
                  <Settings2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-purple-600 uppercase tracking-wider block">
                    CONFIGURABLE MEDICAL KNOWLEDGE BASE
                  </span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Rule Sets & Clinical Threshold Inspector
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setIsKnowledgeBaseModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              The HealthSense AI architecture decouples medical guideline rules from UI components. Rules can be modified, version-controlled, or dynamically updated without altering the user interface.
            </p>

            {/* Active Rules Table */}
            <div className="max-h-96 overflow-y-auto space-y-3">
              {engine.getActiveRules().map((rule) => (
                <div
                  key={rule.ruleId}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-purple-600">{rule.ruleId}</span>
                      <strong className="text-slate-900 dark:text-white">{rule.ruleName}</strong>
                    </div>
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-bold rounded-md">
                      {rule.disease}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                    Condition: {rule.conditionsDescription}
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Guideline Source: {rule.supportingGuideline}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setIsKnowledgeBaseModalOpen(false)}
                className="px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
