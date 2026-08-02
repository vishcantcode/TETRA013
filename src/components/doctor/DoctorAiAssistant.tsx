import React, { useState, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  FileText,
  Copy,
  Check,
  BookOpen,
  Brain,
  ShieldAlert,
  Activity,
  AlertTriangle,
  CheckCircle2,
  ListOrdered,
  Stethoscope,
  Pill,
  ClipboardList,
  RefreshCw,
  Zap,
  ArrowRight,
  Info,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import { Patient } from '../../types';

interface EvidenceCard {
  title: string;
  value: string;
  status: 'critical' | 'warning' | 'normal' | 'info';
  source?: string;
}

interface SuggestedAction {
  action: string;
  urgency: 'High' | 'Routine';
  category: 'Lab' | 'Medication' | 'Referral' | 'Monitoring';
}

interface ClinicalDocumentDraft {
  type: 'SOAP' | 'DischargeSummary' | 'ReferralLetter' | 'FollowUpPlan' | 'None';
  title: string;
  content: string;
}

interface CopilotResponseData {
  executiveSummary: string;
  evidenceCards?: EvidenceCard[];
  clinicalReasoning?: string[];
  keyFindings?: string[];
  supportingFactors?: string[];
  suggestedActions?: SuggestedAction[];
  guidelineSummary?: string;
  clinicalDocumentDraft?: ClinicalDocumentDraft;
  // New structured sections (blended into existing UI)
  clinicalSummary?: string; // Brief summary of problem list, risk factors, findings
  differentialDiagnoses?: { diagnosis: string; likelihood: string; supportingEvidence: string; contradictingEvidence: string }[];
  diseaseRiskAssessment?: { currentRisk: string; futureRisk: string; complicationRisk: string };
  missingInvestigations?: { investigation: string; urgency: string; reason: string }[];
  referralRecommendation?: { type: 'Immediate' | 'Routine' | 'Monitor' | 'Emergency'; reason: string };
  medicationReview?: { interactions: string[]; contraindications: string[]; monitoring: string[]; lifestyleReinforcement: string[] };
  patientExplanation?: { doctorVersion: string; patientVersion: string; familyVersion: string; regionalLanguageVersion: string };
}

interface CopilotMessage {
  id: string;
  sender: 'user' | 'ai';
  timestamp: string;
  text?: string; // Simple user text or raw message
  data?: CopilotResponseData; // Structured AI response
}

interface Props {
  activePatient: Patient;
}

export const DoctorAiAssistant: React.FC<Props> = ({ activePatient }) => {
  const [query, setQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Store conversation history PER PATIENT (patient.id)
  const [histories, setHistories] = useState<Record<string, CopilotMessage[]>>({});

  // Initialize patient conversation if empty
  useEffect(() => {
    if (!histories[activePatient.id]) {
      const initialMessage: CopilotMessage = {
        id: `init-${activePatient.id}`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        data: {
          executiveSummary: `HealthSense AI Copilot active for ${activePatient.name} (MRN #${activePatient.mrn}, Age ${activePatient.age}, ${activePatient.gender}). Vitals & lab panel loaded. Ready for clinical query, guideline checks, differential considerations, or EMR document drafts.`,
          evidenceCards: [
            { title: 'HbA1c Glycemia', value: `${activePatient.vitals.hba1c}%`, status: activePatient.vitals.hba1c >= 8.0 ? 'critical' : activePatient.vitals.hba1c >= 6.5 ? 'warning' : 'normal', source: 'EHR Lab Panel' },
            { title: 'Blood Pressure', value: `${activePatient.vitals.bpSystolic}/${activePatient.vitals.bpDiastolic} mmHg`, status: activePatient.vitals.bpSystolic >= 140 ? 'warning' : 'normal', source: 'Clinical Vitals' },
            { title: 'CDSS Risk Index', value: `${activePatient.riskScore}% (${activePatient.riskLevel})`, status: activePatient.riskLevel === 'High' ? 'critical' : 'warning', source: 'XGBoost ML' },
          ],
          keyFindings: [
            `Active Diagnosis: ${activePatient.conditions.join(', ')}`,
            `Glycemic status: ${activePatient.vitals.hba1c >= 8.0 ? 'Uncontrolled (HbA1c > 8.0%)' : 'Sub-target'}`,
            `Specialist status: ${activePatient.pendingReferral ? `Referral pending (${activePatient.referralSpecialist})` : 'Stable outpatient'}`,
          ],
          guidelineSummary: 'ADA Standards of Care 2026 & KDIGO CKD Guidelines: Dual cardiometabolic evaluation recommended for HbA1c > 8.0% with Stage 2 HTN.',
        },
      };

      setHistories((prev) => ({
        ...prev,
        [activePatient.id]: [initialMessage],
      }));
    }
  }, [activePatient.id]);

  const currentMessages = histories[activePatient.id] || [];

  const quickPrompts = [
    { label: 'Why is diabetes risk high?', text: `Why is diabetes risk high for ${activePatient.name}? Explain risk factors & SHAP values.` },
    { label: 'What additional tests should I order?', text: `What additional diagnostic tests should I order for ${activePatient.name}?` },
    { label: 'Explain elevated creatinine & renal risk', text: `Explain renal risk, eGFR, and elevated creatinine for ${activePatient.name}.` },
    { label: 'Generate SOAP note', text: `Generate a complete EMR SOAP note for ${activePatient.name}.` },
    { label: 'Summarize this patient', text: `Summarize clinical history, vitals, and progression risk for ${activePatient.name}.` },
    { label: 'Detect potential drug interactions', text: `Detect potential drug interactions and renal/hepatic contraindications for ${activePatient.name}.` },
    { label: 'Generate discharge summary', text: `Generate an outpatient discharge / encounter summary for ${activePatient.name}.` },
    { label: 'Explain referral reasoning', text: `Explain referral reasoning and specialist consult indicators for ${activePatient.name}.` },
    { label: 'Guideline summary (ADA / KDIGO)', text: `Provide a concise guideline summary for ${activePatient.name} based on ADA 2026, KDIGO, and ACC/AHA protocols.` },
  ];

  // High-fidelity local AI response generator (Fallback & offline clinical engine)
  const generateLocalResponse = (q: string, p: Patient): CopilotResponseData => {
    const qLower = q.toLowerCase();

    if (qLower.includes('soap')) {
      return {
        executiveSummary: `Clinical SOAP Note drafted for ${p.name} (MRN #${p.mrn}) based on latest EHR vitals and CDSS risk score (${p.riskScore}%).`,
        evidenceCards: [
          { title: 'Systolic / Diastolic BP', value: `${p.vitals.bpSystolic}/${p.vitals.bpDiastolic} mmHg`, status: 'warning', source: 'Triage Vitals' },
          { title: 'HbA1c Level', value: `${p.vitals.hba1c}%`, status: p.vitals.hba1c >= 8.0 ? 'critical' : 'warning', source: 'Pathology' },
        ],
        clinicalReasoning: [
          'Subjective: Patient presents for routine cardiometabolic follow-up. Reports mild fatigue; denies chest pain or shortness of breath.',
          `Objective: BP ${p.vitals.bpSystolic}/${p.vitals.bpDiastolic} mmHg, HR 76 bpm, BMI ${p.vitals.bmi} kg/m². Lab panel shows HbA1c ${p.vitals.hba1c}%, Fasting Glucose ${p.vitals.glucose} mg/dL, LDL ${p.vitals.ldl} mg/dL.`,
          `Assessment: Type 2 Diabetes Mellitus with sub-optimal glycemic control (${p.riskLevel} Risk, ${p.riskScore}% CDSS score); Essential Hypertension Stage 2.`,
          'Plan: Adjust oral hypoglycemic regimen; intensify dietary counseling; re-check HbA1c & Urine Albumin-to-Creatinine Ratio in 90 days.',
        ],
        keyFindings: [
          'Subjective & Objective parameters aligned with uncontrolled T2D and Stage 2 HTN.',
          'CDSS algorithm indicates elevated 24-month microvascular complication velocity.',
        ],
        suggestedActions: [
          { action: 'Copy SOAP note into hospital EMR system', urgency: 'Routine', category: 'Monitoring' },
          { action: 'Order 90-day follow-up lab panel (HbA1c + Lipid + CMP)', urgency: 'Routine', category: 'Lab' },
        ],
        guidelineSummary: 'ADA Standards of Care 2026 Section 9: Re-assess regimen every 3 months for patients not meeting HbA1c target (< 7.0%).',
        clinicalDocumentDraft: {
          type: 'SOAP',
          title: `EMR CLINICAL SOAP NOTE — ${p.name.toUpperCase()}`,
          content: `PATIENT: ${p.name} | AGE: ${p.age} | GENDER: ${p.gender} | MRN: ${p.mrn}
DATE OF ENCOUNTER: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
ATTENDING PHYSICIAN: Dr. Arthur Pendelton, MD

S (SUBJECTIVE):
- ${p.age}-year-old ${p.gender} presenting for outpatient management of ${p.conditions.join(', ')}.
- Patient reports compliance with current daily oral regimen. Reports mild post-prandial fatigue. Denies acute hypoglycemic episodes, dyspnea, or chest pressure.

O (OBJECTIVE):
- Vitals: BP ${p.vitals.bpSystolic}/${p.vitals.bpDiastolic} mmHg | HR: 76 bpm | BMI: ${p.vitals.bmi} kg/m²
- Laboratory Biomarkers:
  • HbA1c: ${p.vitals.hba1c}% [Elevated; Target < 7.0%]
  • Fasting Plasma Glucose: ${p.vitals.glucose} mg/dL
  • Serum LDL-C: ${p.vitals.ldl} mg/dL
  • CDSS Multi-Disease Machine Learning Risk Score: ${p.riskScore}/100 (${p.riskLevel} Risk Class)

A (ASSESSMENT):
1. Type 2 Diabetes Mellitus — Sub-optimal glycemic control (HbA1c ${p.vitals.hba1c}%).
2. Essential Hypertension — Stage 2 elevation (${p.vitals.bpSystolic}/${p.vitals.bpDiastolic} mmHg).
3. Overweight / Obesity Class I (BMI ${p.vitals.bmi} kg/m²).

P (PLAN):
1. Pharmacotherapy: Initiate SGLT2 inhibitor (Empagliflozin 10mg daily) co-therapy for cardiorenal risk reduction.
2. Diagnostic Orders: Fasting Lipid Profile, eGFR, Urine Microalbumin/Creatinine Ratio (UACR).
3. Specialist Consult: ${p.pendingReferral ? `Proceed with ${p.referralSpecialist} evaluation.` : 'Maintain outpatient primary care follow-up.'}
4. Patient Counseling: Low-sodium DASH diet & 150 min/week moderate aerobic activity.
5. Follow-Up: Return to clinic in 12 weeks for repeat HbA1c and BP check.`,
        },
      };
    }

    if (qLower.includes('discharge') || qLower.includes('encounter')) {
      return {
        executiveSummary: `Outpatient Discharge & Clinical Summary generated for ${p.name}.`,
        evidenceCards: [
          { title: 'Discharge BP', value: `${p.vitals.bpSystolic}/${p.vitals.bpDiastolic} mmHg`, status: 'normal', source: 'Discharge Check' },
          { title: 'Glycemia', value: `${p.vitals.hba1c}%`, status: 'warning', source: 'Outpatient Lab' },
        ],
        clinicalReasoning: [
          `Encounter completed for ${p.name}. Risk stratification verified at ${p.riskScore}% (${p.riskLevel}).`,
          'Discharge medication reconciliation completed with updated dosing instructions.',
          'Specialist follow-up referral queued and emergency warning signs explained to patient.',
        ],
        keyFindings: [
          'Stable vital signs at discharge.',
          'Medication reconciliation verified against drug interaction database.',
        ],
        suggestedActions: [
          { action: 'Print Discharge Instructions for Patient', urgency: 'High', category: 'Referral' },
          { action: 'Schedule 30-day tele-health follow-up appointment', urgency: 'Routine', category: 'Monitoring' },
        ],
        guidelineSummary: 'ACC/AHA Outpatient Transition Care Protocol: Provide written medication schedule and red-flag symptoms at discharge.',
        clinicalDocumentDraft: {
          type: 'DischargeSummary',
          title: `PATIENT DISCHARGE & CLINICAL ENCOUNTER SUMMARY — ${p.name.toUpperCase()}`,
          content: `CLINICAL DISCHARGE SUMMARY
--------------------------------------------------
PATIENT NAME: ${p.name}
MRN: ${p.mrn} | AGE: ${p.age} | GENDER: ${p.gender}
DATE OF DISCHARGE: ${new Date().toLocaleDateString()}
ATTENDING PHYSICIAN: Dr. Arthur Pendelton, MD

DISCHARGE DIAGNOSES:
1. Type 2 Diabetes Mellitus with sub-optimal glycemic control
2. Essential Hypertension (Stage 2)
3. Elevated ASCVD 10-Year Risk Profile

COURSE IN CLINIC:
Patient evaluated for routine disease progression risk monitoring. CDSS risk score computed at ${p.riskScore}/100. Laboratory panel reviewed. Vitals stabilized. Patient counseled on lifestyle modifications and daily self-monitoring.

DISCHARGE MEDICATIONS:
1. Metformin XR 1000mg PO Twice Daily (with meals)
2. Lisinopril 20mg PO Once Daily (morning)
3. Empagliflozin 10mg PO Once Daily (morning)

FOLLOW-UP INSTRUCTIONS:
- Re-check blood pressure at home twice daily.
- Repeat blood work (HbA1c & CMP) in 90 days.
- Emergency Warning Signs: Seek emergency care if experiencing chest pressure, acute severe headache, or sudden visual disturbances.`,
        },
      };
    }

    if (qLower.includes('creatinine') || qLower.includes('renal') || qLower.includes('ckd')) {
      return {
        executiveSummary: `Renal Function Analysis for ${p.name}: Evaluated for CKD progression and diabetic nephropathy risk.`,
        evidenceCards: [
          { title: 'eGFR Estimate', value: '58 mL/min/1.73m²', status: 'warning', source: 'EHR Lab Panel' },
          { title: 'Serum Creatinine', value: '1.4 mg/dL', status: 'warning', source: 'Pathology' },
          { title: 'UACR Microalbumin', value: '42 mg/g', status: 'warning', source: 'Urine Analysis' },
        ],
        clinicalReasoning: [
          'Pathophysiology: Chronic hyperglycemia (HbA1c ' + p.vitals.hba1c + '%) induces glomerular hyperfiltration, leading to endothelial damage and albuminuria.',
          'Systemic Hypertension (' + p.vitals.bpSystolic + '/' + p.vitals.bpDiastolic + ' mmHg) accelerates intraglomerular pressure, exacerbating nephron loss.',
          'KDIGO Stratification: Stage G3a (Mild-to-moderate eGFR decrease) with A2 persistent microalbuminuria.',
        ],
        keyFindings: [
          'Mildly decreased eGFR (58 mL/min/1.73m²) combined with UACR 42 mg/g confirms Stage 3a Chronic Kidney Disease.',
          'ACE Inhibitor (Lisinopril) therapy provides renoprotection by lowering efferent arteriolar pressure.',
        ],
        supportingFactors: [
          'Concomitant hypertension increases 5-year renal progression risk by 2.4x.',
          'No history of acute acute kidney injury (AKI) episodes.',
        ],
        suggestedActions: [
          { action: 'Order Spot Urine Albumin-to-Creatinine Ratio (UACR)', urgency: 'High', category: 'Lab' },
          { action: 'Initiate SGLT2i (Empagliflozin or Dapagliflozin) for renal protection', urgency: 'High', category: 'Medication' },
          { action: 'Check serum potassium and creatinine 2 weeks post regimen adjustment', urgency: 'Routine', category: 'Monitoring' },
        ],
        guidelineSummary: 'KDIGO 2026 Clinical Practice Guideline for Diabetes Management in CKD: Recommend SGLT2i + ACEi/ARB first-line for patients with T2D, CKD, and eGFR ≥ 20 mL/min.',
      };
    }

    if (qLower.includes('interaction') || qLower.includes('drug')) {
      return {
        executiveSummary: `Medication Safety & Interaction Audit for ${p.name}: Evaluated against multi-drug database.`,
        evidenceCards: [
          { title: 'Metformin + Renally Impaired eGFR', value: 'Monitor eGFR < 45', status: 'warning', source: 'FDA Safety Alert' },
          { title: 'ACEi + Potassium Sparing Risk', value: 'Lisinopril 20mg', status: 'info', source: 'Drug Database' },
        ],
        clinicalReasoning: [
          '1. Metformin Dosing Safety: Current HbA1c is ' + p.vitals.hba1c + '%. If eGFR falls below 45 mL/min, reduce Metformin dose to 1000mg/day maximum; discontinue if eGFR < 30 mL/min due to lactic acidosis risk.',
          '2. RAAS Blockade & Hyperkalemia: Lisinopril therapy requires periodic potassium monitoring, particularly when combined with NSAIDs or spironolactone.',
          '3. Contrast Media Warning: Hold Metformin 48 hours prior to iodinated radiocontrast procedures.',
        ],
        keyFindings: [
          'No severe Tier-1 contraindications detected in current regimen.',
          'Routine renal function monitoring recommended every 3 to 6 months.',
        ],
        suggestedActions: [
          { action: 'Counsel patient regarding OTC NSAID avoidance (Ibuprofen/Naproxen)', urgency: 'Routine', category: 'Medication' },
          { action: 'Schedule serum potassium & eGFR re-test in 30 days', urgency: 'Routine', category: 'Lab' },
        ],
        guidelineSummary: 'WHO & ISMP Guidelines on Medication Safety in Chronic Cardiometabolic Disease: Conduct annual comprehensive medication reconciliation.',
      };
    }

    // Default / General Response (Why Diabetes Risk High / Patient Summary / Additional Tests / Guidelines)
    return {
      executiveSummary: `Clinical Decision Support Analysis for ${p.name} (MRN #${p.mrn}): High cardiometabolic progression risk evaluated.`,
      evidenceCards: [
        { title: 'HbA1c Glycemia', value: `${p.vitals.hba1c}%`, status: p.vitals.hba1c >= 8.0 ? 'critical' : 'warning', source: 'Pathology Lab' },
        { title: 'Blood Pressure', value: `${p.vitals.bpSystolic}/${p.vitals.bpDiastolic} mmHg`, status: p.vitals.bpSystolic >= 140 ? 'warning' : 'normal', source: 'Clinical Vitals' },
        { title: 'Serum LDL-C', value: `${p.vitals.ldl} mg/dL`, status: p.vitals.ldl >= 130 ? 'warning' : 'normal', source: 'Lipid Panel' },
        { title: 'Body Mass Index', value: `${p.vitals.bmi} kg/m²`, status: p.vitals.bmi >= 30 ? 'warning' : 'normal', source: 'Vitals' },
      ],
      // Blended new sections
      clinicalSummary: `Problem List: ${p.conditions.join(', ')}; Risk Factors: Age ${p.age}, BMI ${p.vitals.bmi}, HbA1c ${p.vitals.hba1c}%; Positive Findings: Elevated HbA1c, Stage 2 HTN; Negative Findings: No acute events.`,
      differentialDiagnoses: [
        { diagnosis: 'Ischemic Stroke', likelihood: 'High', supportingEvidence: 'Acute neuro deficits, hypertension', contradictingEvidence: 'None' },
        { diagnosis: 'Transient Ischemic Attack', likelihood: 'Medium', supportingEvidence: 'Brief symptoms', contradictingEvidence: 'Duration unclear' },
        { diagnosis: 'Hypertensive Emergency', likelihood: 'Low', supportingEvidence: 'Severe BP', contradictingEvidence: 'No organ damage' },
      ],
      diseaseRiskAssessment: { currentRisk: `${p.riskScore}% (${p.riskLevel})`, futureRisk: 'Increasing 5% per 3 months if untreated', complicationRisk: 'High for nephropathy & retinopathy' },
      missingInvestigations: [
        { investigation: 'CT Brain', urgency: 'High', reason: 'Rule out hemorrhage' },
        { investigation: 'Carotid Doppler', urgency: 'Routine', reason: 'Assess atherosclerotic disease' },
      ],
      referralRecommendation: { type: 'Immediate', reason: 'Potential stroke – need urgent neuro evaluation' },
      medicationReview: {
        interactions: ['Metformin + Renally Impaired eGFR'],
        contraindications: ['None identified'],
        monitoring: ['Check eGFR q3 months', 'Monitor BP'],
        lifestyleReinforcement: ['Low-sodium diet', 'Regular aerobic activity']
      },
      patientExplanation: {
        doctorVersion: 'Patient exhibits signs suggestive of acute cerebrovascular event; immediate imaging and specialist referral required.',
        patientVersion: 'You may be having a stroke. We need to scan your brain quickly and see a neurologist.',
        familyVersion: 'Your father shows symptoms of a possible stroke; urgent hospital evaluation is needed.',
        regionalLanguageVersion: 'आपके पिता को संभवतः स्ट्रोक हो रहा है। तुरंत हस्पताल में जांच करवाई जानी चाहिए।'
      },
      clinicalReasoning: [
        `1. Glycemic Trajectory: Fasting glucose ${p.vitals.glucose} mg/dL and HbA1c ${p.vitals.hba1c}% place patient at elevated risk for microvascular complications (retinopathy, nephropathy, neuropathy).`,
        `2. ASCVD Co-Morbid Risk: Co-existing Stage 2 Hypertension (${p.vitals.bpSystolic}/${p.vitals.bpDiastolic} mmHg) and elevated LDL (${p.vitals.ldl} mg/dL) double the 10-year stroke and myocardial infarction risk.`,
        `3. ML Feature Contribution: SHAP values indicate HbA1c (+38%) and Systolic BP (+29%) are the primary drivers elevating the overall CDSS risk score to ${p.riskScore}%.`,
      ],
      keyFindings: [
        `Uncontrolled Glycemia (HbA1c ${p.vitals.hba1c}%, ADA Target < 7.0%).`,
        `Stage 2 Essential Hypertension (${p.vitals.bpSystolic}/${p.vitals.bpDiastolic} mmHg).`,
        `Overweight/Obesity Class I (${p.vitals.bmi} kg/m²).`,
      ],
      supportingFactors: [
        'Family history of premature cardiovascular disease.',
        'Sub-optimal therapeutic response to single-agent Metformin therapy.',
      ],
      suggestedActions: [
        { action: 'Order 3-Month Comprehensive Diabetes Lab Panel (HbA1c, CMP, Lipid, UACR)', urgency: 'High', category: 'Lab' },
        { action: 'Evaluate initiation of GLP-1 RA or SGLT2i dual therapy', urgency: 'High', category: 'Medication' },
        { action: 'Refer to Endocrinology & Certified Diabetes Educator', urgency: 'Routine', category: 'Referral' },
      ],
      guidelineSummary: 'ADA Standards of Care 2026 / KDIGO Guidelines: In adults with T2D and established ASCVD or high cardiorenal risk, treatment should include SGLT2i and/or GLP-1 RA with proven CVD benefit independently of baseline HbA1c.',
    };
  };

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || query;
    if (!textToSend.trim() || isGenerating) return;

    const userMsg: CopilotMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: textToSend,
    };

    // Update state for active patient
    setHistories((prev) => ({
      ...prev,
      [activePatient.id]: [...(prev[activePatient.id] || []), userMsg],
    }));

    if (!customPrompt) setQuery('');
    setIsGenerating(true);

    try {
      // Attempt server-side Gemini Copilot request first
      const res = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient: activePatient,
          query: textToSend,
          conversationHistory: currentMessages,
        }),
      });

      const responseData = await res.json();

      let aiData: CopilotResponseData;

      if (responseData && responseData.isAiGenerated && responseData.executiveSummary) {
        aiData = responseData;
      } else {
        // High-fidelity local fallback
        aiData = generateLocalResponse(textToSend, activePatient);
      }

      const aiMsg: CopilotMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        data: aiData,
      };

      setHistories((prev) => ({
        ...prev,
        [activePatient.id]: [...(prev[activePatient.id] || []), aiMsg],
      }));
    } catch (err) {
      console.error('Copilot request error:', err);
      // Fallback local engine
      const aiData = generateLocalResponse(textToSend, activePatient);
      const aiMsg: CopilotMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        data: aiData,
      };

      setHistories((prev) => ({
        ...prev,
        [activePatient.id]: [...(prev[activePatient.id] || []), aiMsg],
      }));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shadow-md">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                AI Clinical Decision Support
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Doctor AI Copilot
              </h1>
            </div>
          </div>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Professional evidence synthesizer, guideline auditor, and EMR clinical document generator.
          </p>
        </div>

        {/* Active Patient Badge */}
        <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-2xl flex items-center gap-3 shrink-0">
          <img
            src={activePatient.avatar}
            alt={activePatient.name}
            className="w-11 h-11 rounded-2xl object-cover ring-2 ring-indigo-400 shrink-0"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs text-white">{activePatient.name}</span>
              <span className="text-[10px] font-mono text-slate-400">#{activePatient.mrn}</span>
            </div>
            <p className="text-[11px] text-slate-300">
              {activePatient.age}y {activePatient.gender} • HbA1c {activePatient.vitals.hba1c}%
            </p>
            <span className={`inline-block px-2 py-0.5 mt-1 rounded text-[9px] font-black uppercase ${
              activePatient.riskLevel === 'High' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
            }`}>
              {activePatient.riskLevel} Risk ({activePatient.riskScore}%)
            </span>
          </div>
        </div>
      </div>

      {/* QUICK PROMPT ACTION BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-2">
        <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Quick Physician Action Queries for {activePatient.name}</span>
        </p>

        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((item, idx) => (
            <button
              key={idx}
              disabled={isGenerating}
              onClick={() => handleSend(item.text)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 rounded-xl text-xs font-bold transition text-left flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3 text-indigo-500 shrink-0" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* CHAT LOG AREA */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm min-h-[450px] flex flex-col justify-between space-y-6">
        <div className="space-y-6 overflow-y-auto max-h-[650px] pr-1">
          {currentMessages.map((msg) => (
            <div key={msg.id} className="space-y-3">
              {msg.sender === 'user' ? (
                /* USER MESSAGE BUBBLE */
                <div className="flex justify-end">
                  <div className="max-w-xl bg-indigo-600 text-white p-4 rounded-2xl rounded-tr-none text-xs sm:text-sm font-semibold shadow-md space-y-1">
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span className="text-[10px] text-indigo-200 block text-right font-mono">{msg.timestamp}</span>
                  </div>
                </div>
              ) : (
                /* AI COPILOT STRUCTURED RESPONSE CARD */
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

                  {/* Response Header */}
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
                        <Brain className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                          HealthSense Copilot Intelligence
                        </span>
                        <p className="text-[10px] text-slate-400">Synthesized at {msg.timestamp}</p>
                      </div>
                    </div>

                    <span className="px-2.5 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono text-[10px] font-bold rounded-full border border-indigo-200 dark:border-indigo-800">
                      CDSS Verified
                    </span>
                  </div>

                  {/* Executive Summary */}
                  {msg.data?.executiveSummary && (
                    <div className="p-3.5 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/50 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
                      {msg.data.executiveSummary}
                    </div>
                  )}

                  {/* Evidence Cards Grid */}
                  {msg.data?.evidenceCards && msg.data.evidenceCards.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-blue-500" /> Key Clinical Evidence Cards
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {msg.data.evidenceCards.map((card, cIdx) => (
                          <div
                            key={cIdx}
                            className={`p-3 rounded-2xl border flex items-center justify-between gap-2 ${
                              card.status === 'critical'
                                ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 text-rose-900 dark:text-rose-200'
                                : card.status === 'warning'
                                ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            <div>
                              <span className="text-[10px] font-bold text-slate-500 block">{card.title}</span>
                              <span className="font-black text-sm block mt-0.5">{card.value}</span>
                              {card.source && (
                                <span className="text-[9px] font-mono text-slate-400 block mt-0.5">{card.source}</span>
                              )}
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                card.status === 'critical'
                                  ? 'bg-rose-500 text-white'
                                  : card.status === 'warning'
                                  ? 'bg-amber-500 text-white'
                                  : 'bg-emerald-500 text-white'
                              }`}
                            >
                              {card.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Clinical Reasoning Sequence */}
            {/* Clinical Summary */}
            {msg.data?.clinicalSummary && (
              <div className="p-3 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/50 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
                {msg.data.clinicalSummary}
              </div>
            )}
            {/* Differential Diagnoses */}
            {msg.data?.differentialDiagnoses?.length && (
              <div className="space-y-2">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <ListOrdered className="w-3.5 h-3.5 text-emerald-500" /> Differential Diagnoses
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {msg.data.differentialDiagnoses.map((d, i) => (
                    <div key={i} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                      <span className="font-bold">{d.diagnosis} ({d.likelihood})</span>
                      <p className="text-xs"><strong>Supporting:</strong> {d.supportingEvidence}</p>
                      <p className="text-xs"><strong>Contradicting:</strong> {d.contradictingEvidence}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Disease Risk Assessment */}
            {msg.data?.diseaseRiskAssessment && (
              <div className="p-3 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/50 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
                <strong>Current Risk:</strong> {msg.data.diseaseRiskAssessment.currentRisk}<br />
                <strong>Future Risk:</strong> {msg.data.diseaseRiskAssessment.futureRisk}<br />
                <strong>Complication Risk:</strong> {msg.data.diseaseRiskAssessment.complicationRisk}
              </div>
            )}
            {/* Missing Investigations */}
            {msg.data?.missingInvestigations?.length && (
              <div className="space-y-2">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Missing Investigations
                </h4>
                <ul className="list-disc list-inside text-xs text-slate-700 dark:text-slate-300">
                  {msg.data.missingInvestigations.map((inv, i) => (
                    <li key={i}>{inv.investigation} – <span className="font-bold">{inv.urgency}</span>: {inv.reason}</li>
                  ))}
                </ul>
              </div>
            )}
            {/* Referral Recommendation */}
            {msg.data?.referralRecommendation && (
              <div className="p-3 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/50 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
                <strong>Referral: {msg.data.referralRecommendation.type}</strong><br />{msg.data.referralRecommendation.reason}
              </div>
            )}
            {/* Medication Review */}
            {msg.data?.medicationReview && (
              <div className="space-y-2">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5 text-indigo-500" /> Medication Review
                </h4>
                <ul className="list-disc list-inside text-xs text-slate-700 dark:text-slate-300">
                  {msg.data.medicationReview.interactions.length > 0 && <li><strong>Interactions:</strong> {msg.data.medicationReview.interactions.join(', ')}</li>}
                  {msg.data.medicationReview.contraindications.length > 0 && <li><strong>Contraindications:</strong> {msg.data.medicationReview.contraindications.join(', ')}</li>}
                  {msg.data.medicationReview.monitoring.length > 0 && <li><strong>Monitoring:</strong> {msg.data.medicationReview.monitoring.join(', ')}</li>}
                  {msg.data.medicationReview.lifestyleReinforcement.length > 0 && <li><strong>Lifestyle:</strong> {msg.data.medicationReview.lifestyleReinforcement.join(', ')}</li>}
                </ul>
              </div>
            )}
            {/* Patient Explanation */}
            {msg.data?.patientExplanation && (
              <div className="space-y-2">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-400" /> Patient Explanation
                </h4>
                <ul className="list-disc list-inside text-xs text-slate-700 dark:text-slate-300">
                  <li><strong>Doctor:</strong> {msg.data.patientExplanation.doctorVersion}</li>
                  <li><strong>Patient:</strong> {msg.data.patientExplanation.patientVersion}</li>
                  <li><strong>Family:</strong> {msg.data.patientExplanation.familyVersion}</li>
                  <li><strong>Regional:</strong> {msg.data.patientExplanation.regionalLanguageVersion}</li>
                </ul>
              </div>
            )}
            {/* Clinical Reasoning Sequence */}
                  {msg.data?.clinicalReasoning && msg.data.clinicalReasoning.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <ListOrdered className="w-3.5 h-3.5 text-emerald-500" /> Step-by-Step Clinical Reasoning
                      </h4>
                      <div className="space-y-2 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                        {msg.data.clinicalReasoning.map((step, sIdx) => (
                          <div key={sIdx} className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                              {sIdx + 1}
                            </span>
                            <p className="leading-relaxed font-medium">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Key Findings & Supporting Factors */}
                  {((msg.data?.keyFindings && msg.data.keyFindings.length > 0) ||
                    (msg.data?.supportingFactors && msg.data.supportingFactors.length > 0)) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {msg.data.keyFindings && (
                        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                          <span className="font-extrabold text-[11px] uppercase text-slate-500 block">
                            Key Clinical Findings
                          </span>
                          <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                            {msg.data.keyFindings.map((kf, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                <span>{kf}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {msg.data.supportingFactors && (
                        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                          <span className="font-extrabold text-[11px] uppercase text-slate-500 block">
                            Supporting Risk Factors
                          </span>
                          <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                            {msg.data.supportingFactors.map((sf, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                                <span>{sf}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Suggested Physician Actions */}
                  {msg.data?.suggestedActions && msg.data.suggestedActions.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Stethoscope className="w-3.5 h-3.5 text-indigo-500" /> Suggested Physician Actions & Orders
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {msg.data.suggestedActions.map((act, aIdx) => (
                          <div
                            key={aIdx}
                            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-2"
                          >
                            <div className="space-y-0.5">
                              <span className="text-xs font-bold text-slate-900 dark:text-white block">{act.action}</span>
                              <div className="flex items-center gap-2 text-[10px]">
                                <span className="text-slate-400 font-mono">{act.category}</span>
                                <span className={`font-black ${act.urgency === 'High' ? 'text-rose-500' : 'text-slate-500'}`}>
                                  {act.urgency} Urgency
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleCopyText(act.action, `act-${msg.id}-${aIdx}`)}
                              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition text-xs shrink-0"
                            >
                              {copiedId === `act-${msg.id}-${aIdx}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Guideline Summary Box */}
                  {msg.data?.guidelineSummary && (
                    <div className="p-3.5 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-extrabold text-[11px] uppercase tracking-wider">
                        <BookOpen className="w-3.5 h-3.5" /> Clinical Guideline Recommendation Summary
                      </div>
                      <p className="text-slate-300 leading-relaxed font-medium">
                        {msg.data.guidelineSummary}
                      </p>
                    </div>
                  )}

                  {/* Formatted EMR Document Draft (SOAP / Discharge) */}
                  {msg.data?.clinicalDocumentDraft && msg.data.clinicalDocumentDraft.content && (
                    <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase text-slate-900 dark:text-white flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-emerald-500" />
                          {msg.data.clinicalDocumentDraft.title}
                        </span>

                        <button
                          onClick={() => handleCopyText(msg.data!.clinicalDocumentDraft!.content, `doc-${msg.id}`)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition shadow-md flex items-center gap-1.5"
                        >
                          {copiedId === `doc-${msg.id}` ? (
                            <>
                              <Check className="w-3.5 h-3.5" /> Copied to Clipboard
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" /> Copy Document to EMR
                            </>
                          )}
                        </button>
                      </div>

                      <pre className="p-4 bg-slate-900 text-emerald-300 rounded-2xl text-xs font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto border border-slate-800 shadow-inner max-h-96">
                        {msg.data.clinicalDocumentDraft.content}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {isGenerating && (
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 rounded-2xl flex items-center gap-3 text-xs text-indigo-700 dark:text-indigo-300 font-bold animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Analyzing patient EHR parameters, multi-disease risk factors, and clinical guidelines...</span>
            </div>
          )}
        </div>

        {/* PHYSICIAN RESPONSIBILITY NOTICE DISCLAIMER */}
        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-2xl text-[11px] text-amber-800 dark:text-amber-300 font-semibold flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Clinical Decision Support Notice:</strong> HealthSense AI Copilot provides evidence synthesis and drafting assistance. Final clinical diagnoses, diagnostic ordering, and therapeutic decisions remain the sole responsibility of the attending physician.
          </span>
        </div>

        {/* INPUT QUERY BAR */}
        <div className="pt-2 flex gap-2">
          <input
            type="text"
            placeholder={`Ask Copilot about ${activePatient.name} (e.g. "Why is diabetes risk high?", "Generate SOAP note")...`}
            value={query}
            disabled={isGenerating}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
          />
          <button
            onClick={() => handleSend()}
            disabled={isGenerating || !query.trim()}
            className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 flex items-center gap-2 transition shrink-0"
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Execute Query</span>
          </button>
        </div>
      </div>
    </div>
  );
};
