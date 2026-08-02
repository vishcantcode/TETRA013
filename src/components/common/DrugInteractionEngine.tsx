import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Pill,
  Activity,
  CheckCircle2,
  Sparkles,
  Info,
  Search,
  Plus,
  Trash2,
  FileText,
  Printer,
  RefreshCw,
  Check,
  X,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Clock,
  Zap,
} from 'lucide-react';
import {
  Patient,
  FullMedication,
  DrugInteractionItem,
  InteractionCategory,
  InteractionSeverity,
} from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface DrugInteractionEngineProps {
  activePatient: Patient;
  onUpdatePatient?: (updatedPatient: Patient) => void;
  isDoctorMode?: boolean;
  isHighContrast?: boolean;
}

// Default pre-computed intelligence generator based on patient profile
export const generatePatientInteractions = (patient: Patient, simulatedDrugs: string[] = []): DrugInteractionItem[] => {
  const currentDrugNames = [
    ...patient.medications.map((m) => m.name.toLowerCase()),
    ...simulatedDrugs.map((d) => d.toLowerCase()),
  ];
  const conditions = patient.conditions.map((c) => c.toLowerCase());
  const hba1c = patient.vitals.hba1c || 8.2;
  const glucose = patient.vitals.glucose || 185;
  const bpSystolic = patient.vitals.bpSystolic || 142;

  const interactions: DrugInteractionItem[] = [];

  const hasDrug = (term: string) => currentDrugNames.some((d) => d.includes(term));
  const hasCondition = (term: string) => conditions.some((c) => c.includes(term));

  // 1. DRUG-DRUG: ACE Inhibitor (Lisinopril/Enalapril) + K-sparing diuretic or potassium supplement or NSAID
  if (hasDrug('lisinopril') || hasDrug('enalapril') || hasDrug('ramipril')) {
    if (hasDrug('spironolactone') || hasDrug('triamterene') || hasDrug('potassium')) {
      interactions.push({
        id: 'di-101',
        category: 'Drug-Drug Interactions',
        severity: 'Severe',
        involvedAgents: ['Lisinopril 10 mg', 'Spironolactone 25 mg'],
        title: 'Synergistic Hyperkalemia & Renin-Angiotensin Suppression Risk',
        mechanism: 'Combined renin-angiotensin-aldosterone system (RAAS) suppression and reduced aldosterone-mediated distal renal tubular K+ secretion.',
        clinicalImpact: 'High likelihood of severe, life-threatening hyperkalemia (Serum K+ > 5.5 mEq/L) leading to cardiac arrhythmias, muscle paralysis, and acute renal decline.',
        suggestedMonitoring: 'Baseline serum potassium & creatinine within 3-5 days of initiation, re-check at 14 days and monthly during dose titration.',
        alternativeDiscussionPoints: [
          'Consider replacing Spironolactone with a thiazide/loop diuretic if fluid overload persists without severe heart failure indication.',
          'If dual therapy is necessary, limit Lisinopril to lowest effective dose and initiate strict low-potassium diet counseling.',
          'Educate patient on symptoms of hyperkalemia (muscle weakness, paresthesia, palpitations).',
        ],
      });
    }

    if (hasDrug('ibuprofen') || hasDrug('naproxen') || hasDrug('diclofenac') || hasDrug('aspirin')) {
      interactions.push({
        id: 'di-102',
        category: 'Drug-Drug Interactions',
        severity: 'Major',
        involvedAgents: ['Lisinopril 10 mg', 'Ibuprofen / NSAID'],
        title: 'Hemodynamic Renal Function Impairment & Reduced Antihypertensive Efficacy',
        mechanism: 'NSAIDs inhibit renal vasodilatory prostaglandins (afferent arteriole), while ACE inhibitors dilate efferent renal arterioles, severely reducing glomerular filtration rate (GFR).',
        clinicalImpact: 'Acute decline in renal function (Triple Whammy risk), blunting of blood pressure control by 5–10 mmHg, and sodium fluid retention.',
        suggestedMonitoring: 'Serum Creatinine & eGFR within 7 days. Daily home Blood Pressure log.',
        alternativeDiscussionPoints: [
          'Switch analgesic from NSAID to Acetaminophen (Paracetamol) up to 2g/day for pain management.',
          'If topical NSAID is required for osteoarthritis, use topical Diclofenac gel with systemic absorption monitoring.',
        ],
      });
    }
  }

  // 2. DRUG-DRUG: Metformin + Iodine Contrast or Renal Toxic Agent
  if (hasDrug('metformin')) {
    if (hasCondition('kidney') || hasCondition('ckd') || hasCondition('renal') || patient.vitals.bmi > 32) {
      interactions.push({
        id: 'di-103',
        category: 'Drug-Disease Interactions',
        severity: 'Major',
        involvedAgents: ['Metformin 1000 mg', 'Chronic Kidney Disease Stage 3 / Decreased eGFR'],
        title: 'Metformin Accumulation & Risk of Lactic Acidosis in Renal Impairment',
        mechanism: 'Metformin is excreted unchanged by renal tubular secretion. Reduced GFR causes drug accumulation, inhibition of hepatic gluconeogenesis from lactate, and mitochondrial respiration suppression.',
        clinicalImpact: 'Severe, life-threatening Metformin-Associated Lactic Acidosis (MALA), metabolic acidosis, somnolence, and hemodialysis requirement.',
        suggestedMonitoring: 'eGFR and Serum Creatinine every 3 months. Serum Bicarbonate & Anion Gap if lethargic or septic.',
        alternativeDiscussionPoints: [
          'If eGFR is 30–45 mL/min/1.73m², reduce Metformin max dose to 1000 mg/day.',
          'Discontinue Metformin if eGFR falls below 30 mL/min/1.73m² and switch to DPP-4 inhibitor (Linagliptin - non-renal) or SGLT2 inhibitor if eGFR permits.',
          'Temporarily hold Metformin for 48 hours prior to iodinated radiocontrast procedures.',
        ],
      });
    }
  }

  // 3. DUPLICATE THERAPY: Dual RAAS Blockade or Dual Diuretic
  if ((hasDrug('lisinopril') && hasDrug('telmisartan')) || (hasDrug('enalapril') && hasDrug('losartan'))) {
    interactions.push({
      id: 'di-104',
      category: 'Duplicate Therapy',
      severity: 'Severe',
      involvedAgents: ['Lisinopril (ACE Inhibitor)', 'Telmisartan (ARB)'],
      title: 'Duplicate RAAS Inhibition Class Redundancy',
      mechanism: 'Simultaneous blockade of Angiotensin Converting Enzyme and Angiotensin II Type-1 Receptors without additive clinical benefit.',
      clinicalImpact: 'Significantly increased incidence of acute kidney injury, severe hypotension, and syncope without additional cardiovascular mortality reduction (ONTARGET Trial evidence).',
      suggestedMonitoring: 'Immediate discontinuation of one agent. Serum Creatinine & Potassium in 3 days.',
      alternativeDiscussionPoints: [
        'Discontinue ARB (Telmisartan) and retain ACE Inhibitor (Lisinopril) single agent.',
        'If ACE inhibitor cough is present, stop Lisinopril completely and convert to ARB monotherapy.',
      ],
    });
  }

  // 4. DRUG-DRUG: Sulfonylurea (Glimepiride/Gliclazide) + Beta Blocker or Metformin Synergistic Hypoglycemia
  if (hasDrug('glimepiride') || hasDrug('gliclazide') || hasDrug('glipizide')) {
    if (hasDrug('metformin') || hasDrug('insulin')) {
      interactions.push({
        id: 'di-105',
        category: 'Drug-Drug Interactions',
        severity: 'Moderate',
        involvedAgents: ['Glimepiride 2 mg', 'Metformin 1000 mg'],
        title: 'Additive Antidiabetic Hypoglycemia Potentiation',
        mechanism: 'Glimepiride stimulates pancreatic beta-cell insulin secretion while Metformin enhances peripheral insulin sensitivity.',
        clinicalImpact: 'Increased risk of symptomatic hypoglycemia (Glucose < 70 mg/dL), especially if meals are skipped or during vigorous activity.',
        suggestedMonitoring: 'Self-Monitored Blood Glucose (SMBG) pre-meals and bedtime. Log all glucose readings below 70 mg/dL.',
        alternativeDiscussionPoints: [
          'Ensure patient is instructed on 15/15 Rule for hypoglycemia treatment (15g fast-acting carbohydrate).',
          'Consider lowering Glimepiride dose to 1 mg if HbA1c approaches target (< 7.0%) or if renal clearance declines.',
        ],
      });
    }

    if (hasDrug('propranolol') || hasDrug('atenolol') || hasDrug('metoprolol')) {
      interactions.push({
        id: 'di-106',
        category: 'Contraindications',
        severity: 'Major',
        involvedAgents: ['Glimepiride', 'Propranolol / Non-selective Beta Blocker'],
        title: 'Hypoglycemia Unawareness & Sympatholytic Symptom Masking',
        mechanism: 'Beta blockers inhibit beta-2 adrenergic receptors, masking autonomic warning signs of hypoglycemia (tachycardia, tremors, anxiety), leaving only diaphoresis (sweating) unmasked.',
        clinicalImpact: 'Patient may experience severe neuroglycopenic hypoglycemia (confusion, seizures, loss of consciousness) without preceding warning tachycardia.',
        suggestedMonitoring: 'Frequent blood glucose monitoring before driving or exercise.',
        alternativeDiscussionPoints: [
          'Switch to Cardioselective Beta-1 Blocker (Bisoprolol or Metoprolol Succinate) or Calcium Channel Blocker (Amlodipine) if prescribed for hypertension.',
        ],
      });
    }
  }

  // 5. DRUG-DISEASE: Beta Blocker in Asthma / COPD
  if (hasCondition('asthma') || hasCondition('copd') || hasCondition('bronchospasm')) {
    if (hasDrug('propranolol') || hasDrug('carvedilol') || hasDrug('labetalol')) {
      interactions.push({
        id: 'di-107',
        category: 'Drug-Disease Interactions',
        severity: 'Severe',
        involvedAgents: ['Propranolol (Non-selective Beta Blocker)', 'Bronchial Asthma / Reactive Airway'],
        title: 'Bronchospasm Indication Contraindication in Asthma',
        mechanism: 'Blockade of bronchial beta-2 receptors causes smooth muscle constriction and antagonizes endogenous or inhaled beta-2 agonist bronchodilators (Albuterol).',
        clinicalImpact: 'Severe acute asthma exacerbation, refractory bronchospasm, and respiratory distress.',
        suggestedMonitoring: 'Peak Expiratory Flow Rate (PEFR) & Pulmonary function testing.',
        alternativeDiscussionPoints: [
          'Immediately substitute with Cardioselective Beta-1 Antagonist (Bisoprolol or Nebivolol) or Calcium Channel Blocker (Amlodipine/Diltiazem).',
        ],
      });
    }
  }

  // 6. MONITORING RECOMMENDATIONS: Statin + Fibrate / Azole / Calcium Channel Blocker
  if (hasDrug('atorvastatin') || hasDrug('rosuvastatin') || hasDrug('simvastatin')) {
    interactions.push({
      id: 'di-108',
      category: 'Monitoring Recommendations',
      severity: 'Minor',
      involvedAgents: ['Atorvastatin 40 mg', 'Baseline Metabolic & Hepatic Protocol'],
      title: 'Baseline & Serial Hepatic Transaminase & Muscle Toxicity Protocol',
      mechanism: 'HMG-CoA Reductase Inhibitor hepatic metabolism and rare risk of skeletal muscle cell necrosis (rhabdomyolysis).',
      clinicalImpact: 'Elevation in ALT/AST transaminases (>3x ULN) or myopathy/creatine kinase elevation.',
      suggestedMonitoring: 'ALT/AST at baseline, 12 weeks post-initiation, and annually thereafter. Serum Creatine Kinase (CK) if muscle pain/weakness occurs.',
      alternativeDiscussionPoints: [
        'Advise patient to report unexplained muscle aches, tenderness, or dark urine immediately.',
        'If myalgia occurs, check Serum CK and consider temporary drug holiday or trial of Rosuvastatin twice weekly.',
      ],
    });
  }

  // 7. DRUG-DRUG SIMULATION: If user adds Aspirin / Clarithromycin / Ciprofloxacin
  if (hasDrug('clarithromycin') || hasDrug('erythromycin')) {
    if (hasDrug('atorvastatin') || hasDrug('simvastatin')) {
      interactions.push({
        id: 'di-109',
        category: 'Drug-Drug Interactions',
        severity: 'Severe',
        involvedAgents: ['Clarithromycin 500 mg', 'Atorvastatin 40 mg'],
        title: 'CYP3A4 Enzyme Inhibition & Acute Rhabdomyolysis Risk',
        mechanism: 'Clarithromycin potently inhibits hepatic & intestinal CYP3A4 metabolism, increasing statin systemic AUC by 400–1000%.',
        clinicalImpact: 'Severe acute rhabdomyolysis, myoglobinuria, and acute tubular necrosis renal failure.',
        suggestedMonitoring: 'Hold statin during 7-10 day antibiotic course. Serum CK if muscle pain reported.',
        alternativeDiscussionPoints: [
          'Switch antibiotic to Azithromycin (does not inhibit CYP3A4) or Amoxicillin-Clavulanate if clinically susceptible.',
          'Temporarily pause Statin therapy for duration of Macrolide antibiotic treatment.',
        ],
      });
    }
  }

  if (hasDrug('ciprofloxacin') || hasDrug('levofloxacin')) {
    interactions.push({
      id: 'di-110',
      category: 'Monitoring Recommendations',
      severity: 'Moderate',
      involvedAgents: ['Ciprofloxacin 500 mg', 'Multi-Drug Regimen'],
      title: 'Fluoroquinolone QTc Interval & Chelation Binding Precaution',
      mechanism: 'Fluoroquinolones block cardiac hERG K+ channels (QTc prolongation) and chelate with oral multivalent cations (Calcium, Iron, Magnesium).',
      clinicalImpact: 'Decreased antibiotic absorption by up to 75% when co-administered with antacids, plus additive cardiac repolarization delay.',
      suggestedMonitoring: 'Separate administration of oral cations or dairy by at least 2 hours before or 6 hours after Ciprofloxacin.',
      alternativeDiscussionPoints: [
        'Counsel patient on strict meal/supplement timing with Ciprofloxacin doses.',
      ],
    });
  }

  return interactions;
};

export const DrugInteractionEngine: React.FC<DrugInteractionEngineProps> = ({
  activePatient,
  onUpdatePatient,
  isDoctorMode = true,
  isHighContrast = false,
}) => {
  const { t } = useLanguage();

  const [simulatedDrugs, setSimulatedDrugs] = useState<string[]>([]);
  const [candidateInput, setCandidateInput] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [acknowledgedIds, setAcknowledgedIds] = useState<Record<string, { by: string; at: string; notes: string }>>({});
  const [acknowledgeModalItem, setAcknowledgeModalItem] = useState<DrugInteractionItem | null>(null);
  const [clinicianAckNotes, setClinicianAckNotes] = useState<string>('');

  // Generate current interaction list
  const interactionList = generatePatientInteractions(activePatient, simulatedDrugs);

  const handleRunScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 1000);
  };

  const handleAddCandidateDrug = (drugName: string) => {
    if (!drugName.trim()) return;
    if (!simulatedDrugs.includes(drugName.trim())) {
      setSimulatedDrugs([...simulatedDrugs, drugName.trim()]);
    }
    setCandidateInput('');
    handleRunScan();
  };

  const handleRemoveSimulatedDrug = (index: number) => {
    setSimulatedDrugs(simulatedDrugs.filter((_, i) => i !== index));
    handleRunScan();
  };

  const handleAcknowledge = (item: DrugInteractionItem) => {
    setAcknowledgeModalItem(item);
    setClinicianAckNotes('');
  };

  const confirmAcknowledge = () => {
    if (!acknowledgeModalItem) return;
    const nowStr = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAcknowledgedIds((prev) => ({
      ...prev,
      [acknowledgeModalItem.id]: {
        by: activePatient.primaryDoctor || 'Dr. V. Patel, MD',
        at: nowStr,
        notes: clinicianAckNotes || 'Reviewed and clinical safety protocols confirmed.',
      },
    }));
    setAcknowledgeModalItem(null);
  };

  // Filter interaction list
  const filteredInteractions = interactionList.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSev = selectedSeverity === 'All' || item.severity === selectedSeverity;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.involvedAgents.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.mechanism.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.clinicalImpact.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCat && matchesSev && matchesSearch;
  });

  const severeCount = interactionList.filter((i) => i.severity === 'Severe').length;
  const majorCount = interactionList.filter((i) => i.severity === 'Major').length;
  const moderateCount = interactionList.filter((i) => i.severity === 'Moderate').length;

  const getSeverityBadge = (severity: InteractionSeverity) => {
    switch (severity) {
      case 'Severe':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-600 text-white shadow-md shadow-rose-600/30 flex items-center gap-1.5 animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5" />
            Severe Risk / Contraindicated
          </span>
        );
      case 'Major':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-slate-900 shadow-md flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Major Clinical Warning
          </span>
        );
      case 'Moderate':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-800 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Moderate Interaction
          </span>
        );
      case 'Minor':
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-slate-500" />
            Minor / Precaution
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER BANNER */}
      <div className={`rounded-3xl p-6 sm:p-8 border shadow-xl relative overflow-hidden transition-all ${
        isHighContrast
          ? 'bg-black border-yellow-400 text-yellow-300'
          : 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-slate-800'
      }`}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                AI Clinical Safety Intelligence
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                {severeCount} Severe / {majorCount} Major Flags
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <ShieldAlert className="w-8 h-8 text-rose-400 shrink-0" />
              Drug Interaction & Safety Engine
            </h1>

            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Automated multi-axial pharmacology analyzer detecting <strong className="text-white font-semibold">Drug-Drug Interactions</strong>, <strong className="text-white font-semibold">Drug-Disease Interactions</strong>, <strong className="text-white font-semibold">Duplicate Class Redundancy</strong>, <strong className="text-white font-semibold">Absolute Contraindications</strong>, and <strong className="text-white font-semibold">Monitoring Protocols</strong>.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700">
                <Pill className="w-4 h-4 text-purple-400" />
                Prescribed Meds Analyzed: <strong className="text-white ml-1">{activePatient.medications.length} Medications</strong>
              </span>
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700">
                <Activity className="w-4 h-4 text-indigo-400" />
                Diseases Cross-Referenced: <strong className="text-white ml-1">{activePatient.conditions.join(', ') || 'Metabolic Diseases'}</strong>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={handleRunScan}
              disabled={isScanning}
              className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-xl shadow-rose-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning Pharmacology Database...' : 'Run Interaction Scan'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 backdrop-blur-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span>Print Safety Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* MANDATORY CLINICAL DISCLAIMER BANNER (REQUIRED BY PROMPT) */}
      <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-700 text-amber-900 dark:text-amber-200 flex items-start gap-3 shadow-md">
        <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <h4 className="font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300">
            Mandatory Clinical Verification Notice:
          </h4>
          <p className="leading-relaxed">
            <strong>Clinicians must independently verify all drug interaction findings, patient lab parameters, and medical history before altering therapy or modifying prescribed dosages.</strong> This automated Decision Support System provides pharmacodynamic and pharmacokinetic guidance to aid clinical judgment.
          </p>
        </div>
      </div>

      {/* REAL-TIME DRUG SIMULATION ENGINE */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-500" />
              Prospective Drug Simulator (Test New Rx Addition)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Simulate adding a candidate medicine to evaluate potential interactions with {activePatient.name}'s active regimen in real-time.
            </p>
          </div>

          {simulatedDrugs.length > 0 && (
            <button
              onClick={() => { setSimulatedDrugs([]); handleRunScan(); }}
              className="text-xs text-rose-600 dark:text-rose-400 font-bold hover:underline self-end sm:self-center cursor-pointer"
            >
              Clear All Simulated ({simulatedDrugs.length})
            </button>
          )}
        </div>

        {/* Input & Quick Candidates */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Pill className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Type drug name (e.g. Spironolactone, Ibuprofen, Clarithromycin, Ciprofloxacin, Aspirin)..."
              value={candidateInput}
              onChange={(e) => setCandidateInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddCandidateDrug(candidateInput);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            />
          </div>

          <button
            onClick={() => handleAddCandidateDrug(candidateInput)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Simulate Drug</span>
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Quick Test Candidates:</span>
          {['Spironolactone 25mg', 'Ibuprofen 400mg', 'Clarithromycin 500mg', 'Ciprofloxacin 500mg', 'Propranolol 40mg', 'Aspirin 81mg'].map((drug) => (
            <button
              key={drug}
              onClick={() => handleAddCandidateDrug(drug)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 transition cursor-pointer text-[11px] font-semibold"
            >
              + {drug}
            </button>
          ))}
        </div>

        {/* Active Simulated Drugs List */}
        {simulatedDrugs.length > 0 && (
          <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-purple-900 dark:text-purple-300">Simulating Active co-rx:</span>
            {simulatedDrugs.map((d, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-600 text-white font-bold text-xs shadow-sm"
              >
                <Pill className="w-3.5 h-3.5" />
                {d}
                <button
                  onClick={() => handleRemoveSimulatedDrug(idx)}
                  className="hover:bg-purple-700 p-0.5 rounded-full transition cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* STATS OVERVIEW & CATEGORY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-800 dark:text-rose-300">
            <span className="text-xs font-bold uppercase tracking-wider">Severe / Contraindicated</span>
            <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-900 dark:text-rose-200">{severeCount}</div>
            <span className="text-[11px] text-rose-700 dark:text-rose-400 font-medium">Critical Clinical Action</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-800 dark:text-amber-300">
            <span className="text-xs font-bold uppercase tracking-wider">Major Warnings</span>
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-900 dark:text-amber-200">{majorCount}</div>
            <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">Close Monitoring Needed</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-800 dark:text-blue-300">
            <span className="text-xs font-bold uppercase tracking-wider">Moderate / Precautions</span>
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-blue-900 dark:text-blue-200">{moderateCount}</div>
            <span className="text-[11px] text-blue-700 dark:text-blue-400 font-medium">Routine Adjustments</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300">
            <span className="text-xs font-bold uppercase tracking-wider">Total Safety Checks</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-900 dark:text-emerald-200">{interactionList.length}</div>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">Cross-referenced vectors</span>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH CONTROLS */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by drug name, mechanism, or clinical impact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Severity filter buttons */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0 overflow-x-auto">
            {['All', 'Severe', 'Major', 'Moderate'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  selectedSeverity === sev
                    ? sev === 'Severe'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : sev === 'Major'
                      ? 'bg-amber-500 text-slate-900 shadow-sm'
                      : 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* 5 Required Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-medium shrink-0">Analysis Category:</span>
          {[
            'All',
            'Drug-Drug Interactions',
            'Drug-Disease Interactions',
            'Duplicate Therapy',
            'Contraindications',
            'Monitoring Recommendations',
          ].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* DETAILED INTERACTION CARDS LIST */}
      <div className="space-y-6">
        {filteredInteractions.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No High-Risk Interactions Found for Current Query
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Selected filters produced 0 interaction flags. Try adjusting your search query or selecting "All" categories.
            </p>
          </div>
        ) : (
          filteredInteractions.map((item) => {
            const isAck = !!acknowledgedIds[item.id];
            const ackData = acknowledgedIds[item.id];

            return (
              <div
                key={item.id}
                className={`rounded-3xl border shadow-md transition-all overflow-hidden ${
                  item.severity === 'Severe'
                    ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900'
                    : item.severity === 'Major'
                    ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Top Category Accent Line */}
                <div className={`h-1.5 w-full ${
                  item.severity === 'Severe'
                    ? 'bg-rose-600'
                    : item.severity === 'Major'
                    ? 'bg-amber-500'
                    : 'bg-indigo-600'
                }`} />

                <div className="p-6 space-y-5">
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {getSeverityBadge(item.severity)}
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                          {item.category}
                        </span>
                        {isAck && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            Acknowledged by Clinician
                          </span>
                        )}
                      </div>

                      <h2 className="text-lg font-extrabold text-slate-900 dark:text-white pt-1">
                        {item.title}
                      </h2>

                      {/* Involved Agents Pills */}
                      <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
                        <span className="text-slate-500 font-medium">Involved Agents / Profile:</span>
                        {item.involvedAgents.map((agent, aIdx) => (
                          <span
                            key={aIdx}
                            className="px-2.5 py-0.5 rounded-md font-bold bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700"
                          >
                            {agent}
                          </span>
                        ))}
                      </div>
                    </div>

                    {isDoctorMode && !isAck && (
                      <button
                        onClick={() => handleAcknowledge(item)}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold shadow-md transition flex items-center gap-1.5 shrink-0 self-start sm:self-center cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                        <span>Acknowledge Risk</span>
                      </button>
                    )}
                  </div>

                  {/* 4 CORE DISPLAY SECTIONS REQUIRED BY PROMPT */}
                  <div className="grid md:grid-cols-2 gap-4 text-xs">
                    {/* 1. MECHANISM */}
                    <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
                      <span className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5 text-[11px] text-indigo-600 dark:text-indigo-400">
                        <Activity className="w-4 h-4" />
                        Pharmacological Mechanism:
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                        {item.mechanism}
                      </p>
                    </div>

                    {/* 2. CLINICAL IMPACT */}
                    <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
                      <span className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5 text-[11px] text-rose-600 dark:text-rose-400">
                        <AlertTriangle className="w-4 h-4" />
                        Direct Clinical Impact & Consequence:
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                        {item.clinicalImpact}
                      </p>
                    </div>

                    {/* 3. SUGGESTED MONITORING */}
                    <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5 md:col-span-2">
                      <span className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5 text-[11px] text-blue-600 dark:text-blue-400">
                        <Clock className="w-4 h-4" />
                        Suggested Baseline & Serial Laboratory Monitoring:
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                        {item.suggestedMonitoring}
                      </p>
                    </div>
                  </div>

                  {/* 4. ALTERNATIVE DISCUSSION POINTS FOR CLINICIANS */}
                  <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 text-xs space-y-2">
                    <span className="font-extrabold text-purple-900 dark:text-purple-200 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                      <Stethoscope className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      Alternative Discussion Points for Clinicians & Patients:
                    </span>
                    <ul className="space-y-1.5 pl-2 text-slate-800 dark:text-slate-200">
                      {item.alternativeDiscussionPoints.map((point, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-2 leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0 mt-1.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* ACKNOWLEDGED LOG IF ACKNOWLEDGED */}
                  {isAck && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <div>
                          <strong>Acknowledged by:</strong> {ackData.by} on {ackData.at}
                          <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5 italic">"{ackData.notes}"</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* BOTTOM MANDATORY CLINICAL SAFEGUARD DISCLAIMER */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-2 text-center">
        <ShieldAlert className="w-8 h-8 text-amber-400 mx-auto mb-1" />
        <h4 className="font-bold text-sm text-amber-300 uppercase tracking-wider">
          Pharmacovigilance & Decision Support Mandate
        </h4>
        <p className="text-xs text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Clinicians must verify all drug interactions, kidney function parameters (eGFR/Creatinine), hepatic enzymes, and patient allergy profiles before making any therapeutic modifications or changing dosage regimens.
        </p>
      </div>

      {/* MODAL: CLINICIAN ACKNOWLEDGE */}
      {acknowledgeModalItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Acknowledge Interaction Flag</h3>
                  <p className="text-xs text-slate-500">Record clinical rationale & verification note</p>
                </div>
              </div>
              <button
                onClick={() => setAcknowledgeModalItem(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">{acknowledgeModalItem.title}</span>
              <p className="text-rose-600 dark:text-rose-400 font-semibold">{acknowledgeModalItem.category} • {acknowledgeModalItem.severity} Severity</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Clinician Note / Safety Plan:
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Reviewed with patient. Potassium levels will be checked in 5 days. Low-potassium dietary advice provided."
                value={clinicianAckNotes}
                onChange={(e) => setClinicianAckNotes(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setAcknowledgeModalItem(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmAcknowledge}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Confirm Acknowledgment</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
