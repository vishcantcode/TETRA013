import { Patient, Vitals } from '../types';
import {
  GuidelineRule,
  GuidelineRuleResult,
  MissingInvestigation,
  ReferralRecommendation,
  FollowUpSchedule,
  ClinicalAlert,
  DiseaseRiskSummary,
  GuidelineEngineResult,
  PatientCarePlan,
  DiseaseCategory,
  Priority,
} from '../types/clinicalGuideline';
import { ALL_CLINICAL_RULES } from './rules';

export class ClinicalGuidelineEngine {
  private static instance: ClinicalGuidelineEngine;
  private customRules: GuidelineRule[] = [...ALL_CLINICAL_RULES];

  private constructor() {}

  public static getInstance(): ClinicalGuidelineEngine {
    if (!ClinicalGuidelineEngine.instance) {
      ClinicalGuidelineEngine.instance = new ClinicalGuidelineEngine();
    }
    return ClinicalGuidelineEngine.instance;
  }

  public getActiveRules(): GuidelineRule[] {
    return this.customRules;
  }

  public addRule(newRule: GuidelineRule) {
    this.customRules.push(newRule);
  }

  public resetToDefaultRules() {
    this.customRules = [...ALL_CLINICAL_RULES];
  }

  /**
   * Primary Evaluation Method
   */
  public evaluatePatient(
    patient: Patient,
    customVitals?: Partial<Vitals>
  ): GuidelineEngineResult {
    const activeVitals = { ...patient.vitals, ...customVitals };

    // 1. Evaluate Rule Sets
    const evaluatedRules: GuidelineRuleResult[] = this.customRules.map((rule) => {
      const triggered = rule.evaluateCondition(patient, activeVitals);
      return {
        rule,
        triggered,
        approvalStatus: 'Pending',
      };
    });

    const triggeredRules = evaluatedRules.filter((r) => r.triggered);

    // 2. Execute Sub-Engines
    const missingInvestigations = this.evaluateMissingInvestigations(patient, activeVitals, triggeredRules);
    const referrals = this.evaluateReferrals(patient, activeVitals, triggeredRules);
    const followUpSchedules = this.evaluateFollowUpSchedules(patient, activeVitals, triggeredRules);
    const alerts = this.evaluateAlerts(patient, activeVitals, triggeredRules);

    // 3. Summarize Disease Risks
    const diseaseCategories: DiseaseCategory[] = ['Diabetes', 'Hypertension', 'CKD', 'Cardiovascular', 'Stroke'];
    const diseaseRiskSummaries: DiseaseRiskSummary[] = diseaseCategories.map((cat) => {
      const catTriggered = triggeredRules.filter((r) => r.rule.disease === cat);
      let riskLevel: 'Normal' | 'Attention' | 'High' | 'Critical' = 'Normal';

      if (catTriggered.some((r) => r.rule.priority === 'Urgent')) {
        riskLevel = 'Critical';
      } else if (catTriggered.some((r) => r.rule.priority === 'High')) {
        riskLevel = 'High';
      } else if (catTriggered.length > 0) {
        riskLevel = 'Attention';
      }

      let summary = `${catTriggered.length} guideline rule(s) triggered.`;
      if (riskLevel === 'Critical') {
        summary = `Urgent clinical attention required for ${cat} management.`;
      } else if (riskLevel === 'High') {
        summary = `High risk identified for ${cat}; evidence-based treatment optimization indicated.`;
      } else if (riskLevel === 'Attention') {
        summary = `Routine screening / monitoring recommendations active for ${cat}.`;
      } else {
        summary = `No active risk triggers flagged for ${cat}. Standard preventive care applies.`;
      }

      return {
        disease: cat,
        riskLevel,
        summary,
        triggeredRulesCount: catTriggered.length,
      };
    });

    return {
      patientId: patient.id,
      evaluatedAt: new Date().toISOString(),
      allRulesEvaluated: evaluatedRules,
      triggeredRules,
      missingInvestigations,
      referrals,
      followUpSchedules,
      alerts,
      diseaseRiskSummaries,
    };
  }

  /**
   * SUB-ENGINE 1: Missing Investigation Engine
   */
  private evaluateMissingInvestigations(
    patient: Patient,
    vitals: Vitals,
    triggeredRules: GuidelineRuleResult[]
  ): MissingInvestigation[] {
    const list: MissingInvestigation[] = [];

    // HbA1c
    if (vitals.hba1c >= 6.0 || patient.conditions.some((c) => c.toLowerCase().includes('diabet'))) {
      list.push({
        id: 'mi-hba1c',
        investigation: 'HbA1c (Glycated Hemoglobin)',
        reason: 'Essential to evaluate 3-month average glycemic control and therapeutic efficacy.',
        clinicalImportance: vitals.hba1c >= 8.0 ? 'Critical' : 'High',
        priority: vitals.hba1c >= 8.0 ? 'Urgent' : 'High',
        status: vitals.hba1c >= 8.0 ? 'Overdue' : 'Recommended',
        diseaseOrigin: 'Diabetes',
      });
    }

    // Lipid Profile
    if (vitals.ldl >= 130 || vitals.bpSystolic >= 135 || patient.age >= 40) {
      list.push({
        id: 'mi-lipid',
        investigation: 'Fasting Lipid Profile (Total, HDL, LDL, Triglycerides)',
        reason: 'Required to calculate ASCVD 10-year risk and establish statin dosing targets.',
        clinicalImportance: vitals.ldl >= 160 ? 'Critical' : 'High',
        priority: vitals.ldl >= 160 ? 'Urgent' : 'High',
        status: 'Recommended',
        diseaseOrigin: 'Cardiovascular',
      });
    }

    // Urine Albumin-to-Creatinine Ratio (UACR)
    if (vitals.hba1c >= 6.5 || vitals.bpSystolic >= 135) {
      list.push({
        id: 'mi-uacr',
        investigation: 'Urine Albumin-to-Creatinine Ratio (UACR)',
        reason: 'Earliest marker of microvascular renal target organ damage prior to eGFR drop.',
        clinicalImportance: 'High',
        priority: 'High',
        status: 'Recommended',
        diseaseOrigin: 'CKD',
      });
    }

    // 12-Lead ECG
    if (vitals.bpSystolic >= 140 || patient.riskScore >= 60 || patient.age >= 50) {
      list.push({
        id: 'mi-ecg',
        investigation: '12-Lead Electrocardiogram (ECG)',
        reason: 'Screening for left ventricular hypertrophy (LVH), arrhythmias, and silent ischemia.',
        clinicalImportance: 'High',
        priority: 'High',
        status: 'Recommended',
        diseaseOrigin: 'Hypertension',
      });
    }

    // eGFR & Serum Creatinine
    if (vitals.bpSystolic >= 140 || vitals.hba1c >= 7.5 || patient.riskScore >= 70) {
      list.push({
        id: 'mi-egfr',
        investigation: 'eGFR & Serum Creatinine',
        reason: 'Assessment of baseline glomerular filtration rate and staging of renal function.',
        clinicalImportance: 'Critical',
        priority: 'Urgent',
        status: 'Overdue',
        diseaseOrigin: 'CKD',
      });
    }

    // Fundus Examination
    if (vitals.hba1c >= 6.5) {
      list.push({
        id: 'mi-fundus',
        investigation: 'Dilated Fundus Examination / Digital Retinal Imaging',
        reason: 'Annual screening for diabetic microaneurysms and proliferative retinopathy.',
        clinicalImportance: 'Moderate',
        priority: 'Medium',
        status: 'Recommended',
        diseaseOrigin: 'Diabetes',
      });
    }

    // CBC & LFT
    list.push({
      id: 'mi-cbc',
      investigation: 'Complete Blood Count (CBC) & Liver Function Test (LFT)',
      reason: 'Rule out occult anemia and baseline transaminase evaluation prior to statin/metformin optimization.',
      clinicalImportance: 'Moderate',
      priority: 'Low',
      status: 'Optional',
      diseaseOrigin: 'Cardiovascular',
    });

    return list;
  }

  /**
   * SUB-ENGINE 2: Referral Engine
   */
  private evaluateReferrals(
    patient: Patient,
    vitals: Vitals,
    triggeredRules: GuidelineRuleResult[]
  ): ReferralRecommendation[] {
    const list: ReferralRecommendation[] = [];

    // Endocrinologist
    if (vitals.hba1c >= 8.0 || triggeredRules.some((r) => r.rule.disease === 'Diabetes' && r.rule.priority === 'Urgent')) {
      list.push({
        id: 'ref-endo',
        specialist: 'Endocrinologist',
        reason: 'Uncontrolled glycemic targets (HbA1c ≥ 8.0%) requiring complex regimen intensification or CGM evaluation.',
        priority: 'Urgent',
        suggestedTimeline: 'Within 1-2 Weeks',
        referralSummary: 'Consultation for uncontrolled T2D, evaluation of GLP-1 RA / SGLT2i dual therapy, and insulin initiation assessment.',
        diseaseOrigin: 'Diabetes',
      });
    }

    // Nephrologist
    if (patient.riskScore >= 75 || triggeredRules.some((r) => r.rule.disease === 'CKD' && r.rule.priority === 'Urgent')) {
      list.push({
        id: 'ref-nephro',
        specialist: 'Nephrologist',
        reason: 'High CKD progression risk with concurrent hypertension and persistent proteinuria concern.',
        priority: 'Urgent',
        suggestedTimeline: 'Within 1-2 Weeks',
        referralSummary: 'Nephrology co-management for renal preservation, eGFR trajectory monitoring, and K+ titration.',
        diseaseOrigin: 'CKD',
      });
    }

    // Cardiologist
    if (vitals.bpSystolic >= 145 || vitals.ldl >= 150 || patient.riskScore >= 70) {
      list.push({
        id: 'ref-cardio',
        specialist: 'Cardiologist',
        reason: 'Stage 2 Hypertension with elevated LDL-C and clustering ASCVD risk factors.',
        priority: 'High',
        suggestedTimeline: 'Within 1 Month',
        referralSummary: 'Comprehensive cardiac assessment, 24-hr ABPM review, and echocardiogram consideration.',
        diseaseOrigin: 'Cardiovascular',
      });
    }

    // Neurologist
    if (vitals.bpSystolic >= 155 || patient.age >= 60) {
      list.push({
        id: 'ref-neuro',
        specialist: 'Neurologist',
        reason: 'Severe systolic hypertension with elevated stroke vulnerability and vascular TIA risk.',
        priority: 'High',
        suggestedTimeline: 'Within 1 Month',
        referralSummary: 'Cerebrovascular risk assessment, carotid duplex ultrasound evaluation, and FAST red flag education.',
        diseaseOrigin: 'Stroke',
      });
    }

    // Nutritionist
    if (vitals.bmi >= 28 || vitals.hba1c >= 6.0) {
      list.push({
        id: 'ref-nutri',
        specialist: 'Nutritionist',
        reason: 'Metabolic body mass index (BMI ≥ 28 kg/m²) requiring structured medical nutrition therapy.',
        priority: 'Medium',
        suggestedTimeline: 'Routine (3 Months)',
        referralSummary: 'Personalized low-sodium DASH diet plan, glycemic index education, and calorie deficit counseling.',
        diseaseOrigin: 'Diabetes',
      });
    }

    // General Physician (Baseline Co-ordinator)
    if (list.length === 0) {
      list.push({
        id: 'ref-gp',
        specialist: 'General Physician',
        reason: 'Routine health maintenance and primary care lifestyle risk factor review.',
        priority: 'Low',
        suggestedTimeline: 'Routine (3 Months)',
        referralSummary: 'Annual comprehensive health check, vital signs tracking, and routine blood screening.',
        diseaseOrigin: 'Hypertension',
      });
    }

    return list;
  }

  /**
   * SUB-ENGINE 3: Follow-Up Engine
   */
  private evaluateFollowUpSchedules(
    patient: Patient,
    vitals: Vitals,
    triggeredRules: GuidelineRuleResult[]
  ): FollowUpSchedule[] {
    const list: FollowUpSchedule[] = [];

    const hasUrgent = triggeredRules.some((r) => r.rule.priority === 'Urgent') || vitals.bpSystolic >= 150 || vitals.hba1c >= 8.5;
    const hasHigh = triggeredRules.some((r) => r.rule.priority === 'High') || vitals.bpSystolic >= 140 || vitals.hba1c >= 7.5;

    if (hasUrgent) {
      list.push({
        id: 'fu-2w',
        interval: '2 weeks',
        title: 'Urgent Clinical & Medication Response Review',
        reason: 'Short-term follow-up required to verify early BP reduction, tolerability of newly introduced antihypertensives/antidiabetic agents, and acute safety parameters.',
        focusArea: 'Repeat BP check, medication side-effect review, basic metabolic panel (K+, Creatinine).',
        recommendedTests: ['Repeat Blood Pressure Log', 'Serum Electrolytes', 'Blood Glucose Log'],
      });
    }

    if (hasHigh || hasUrgent) {
      list.push({
        id: 'fu-1m',
        interval: '1 month',
        title: 'Therapeutic Dose Titration & Biomarker Re-evaluation',
        reason: '1-month interval aligns with steady-state pharmacological effects of ACEi/ARB and statin titration.',
        focusArea: 'Assess home BP log, fasting plasma glucose, and adherence to dietary modifications.',
        recommendedTests: ['Home BP 7-Day Average', 'Fasting Plasma Glucose', 'Renal Function Panel'],
      });
    }

    list.push({
      id: 'fu-3m',
      interval: '3 months',
      title: 'Quarterly Glycemic & Metabolic Target Audit',
      reason: 'Standard 90-day cycle matches erythrocyte turnover for accurate HbA1c repeat measurement.',
      focusArea: 'HbA1c repeat, lipid profile monitoring, lifestyle habit reinforcement.',
      recommendedTests: ['HbA1c', 'Lipid Profile', 'Urine Albumin-to-Creatinine Ratio'],
    });

    list.push({
      id: 'fu-6m',
      interval: '6 months',
      title: 'Bi-Annual Target Organ Protection Audit',
      reason: 'Comprehensive multi-system check to ensure non-progression of CKD, microvascular disease, and ASCVD risk.',
      focusArea: 'Full cardiovascular physical exam, peripheral pulse review, eGFR trend analysis.',
      recommendedTests: ['Complete Metabolic Panel', 'eGFR Trend', 'Monofilament Foot Exam'],
    });

    list.push({
      id: 'fu-annual',
      interval: 'Annual',
      title: 'Comprehensive Annual Guideline Preventive Examination',
      reason: 'Mandated annual screening for diabetic retinopathy, vascular imaging, and overall ASCVD score re-calculation.',
      focusArea: 'Dilated eye exam, 12-lead ECG, vaccination update, and comprehensive wellness assessment.',
      recommendedTests: ['Dilated Eye Exam', '12-Lead ECG', 'Annual Preventive Lab Battery'],
    });

    return list;
  }

  /**
   * SUB-ENGINE 4: Alert Engine
   */
  private evaluateAlerts(
    patient: Patient,
    vitals: Vitals,
    triggeredRules: GuidelineRuleResult[]
  ): ClinicalAlert[] {
    const list: ClinicalAlert[] = [];

    // Emergency Referral / Hypertensive Crisis
    if (vitals.bpSystolic >= 180 || vitals.bpDiastolic >= 110) {
      list.push({
        id: 'alt-emergency',
        alertLevel: 'Emergency Referral',
        title: 'CRITICAL ALERT: Severe Hypertensive Urgency (SBP ≥ 180 mmHg)',
        reason: 'Imminent threat of acute end-organ stroke, myocardial ischemia, or aortic dissection.',
        supportingFindings: [`BP ${vitals.bpSystolic}/${vitals.bpDiastolic} mmHg`, 'Severe vascular strain'],
        recommendedAction: 'Immediate physician bedside evaluation, acute oral BP reduction, and ER transfer if symptomatic.',
      });
    }

    // Urgent Review / Severe Uncontrolled Diabetes
    if (vitals.hba1c >= 8.5 || vitals.glucose >= 220) {
      list.push({
        id: 'alt-urgent',
        alertLevel: 'Urgent Review',
        title: 'URGENT ALERT: Severe Uncontrolled Glycemia (HbA1c ≥ 8.5%)',
        reason: 'Markedly elevated HbA1c with high risk of metabolic complications and microvascular injury.',
        supportingFindings: [`HbA1c ${vitals.hba1c}%`, `Blood Glucose ${vitals.glucose} mg/dL`],
        recommendedAction: 'Schedule priority physician consultation within 48 hours for immediate therapeutic escalation.',
      });
    }

    // High Risk / Stage 2 HTN or CKD progression
    if (vitals.bpSystolic >= 140 || patient.riskScore >= 70) {
      list.push({
        id: 'alt-highrisk',
        alertLevel: 'High Risk',
        title: 'HIGH RISK ALERT: Multi-Factorial Vascular Risk Accumulation',
        reason: 'Combined Stage 2 HTN and high overall risk score (Risk Score: ' + patient.riskScore + '/100).',
        supportingFindings: [
          `BP ${vitals.bpSystolic}/${vitals.bpDiastolic} mmHg`,
          `Overall CDSS Risk Score: ${patient.riskScore}%`,
        ],
        recommendedAction: 'Order baseline 12-lead ECG, eGFR, UACR, and schedule 2-week follow-up.',
      });
    }

    // Attention Needed / Pre-diabetes or Stage 1 HTN
    if ((vitals.hba1c >= 5.7 && vitals.hba1c < 6.5) || (vitals.bpSystolic >= 130 && vitals.bpSystolic < 140)) {
      list.push({
        id: 'alt-attention',
        alertLevel: 'Attention Needed',
        title: 'ATTENTION NEEDED: Early Cardiometabolic Sub-Clinical Deviation',
        reason: 'Stage 1 HTN or Pre-diabetes markers flagged by guideline algorithms.',
        supportingFindings: [`HbA1c ${vitals.hba1c}%`, `BP ${vitals.bpSystolic} mmHg`],
        recommendedAction: 'Provide DASH diet and exercise counseling. Re-evaluate in 30 days.',
      });
    }

    // Normal Alert fallback if clear
    if (list.length === 0) {
      list.push({
        id: 'alt-normal',
        alertLevel: 'Normal',
        title: 'CLINICAL STATUS: Within Guideline Target Tolerances',
        reason: 'No critical or urgent guideline violations detected during this evaluation.',
        supportingFindings: ['Vitals within expected target range', 'Routine preventive status'],
        recommendedAction: 'Maintain current health regimen and schedule routine annual checkup.',
      });
    }

    return list;
  }

  /**
   * DOCTOR APPROVAL & PATIENT CARE PLAN GENERATOR
   * Converts approved clinical rules and physician notes into simple plain language
   */
  public generatePatientCarePlan(
    result: GuidelineEngineResult,
    approvedRuleIds: string[],
    doctorModifications: Record<string, string>,
    doctorNotes: Record<string, string>,
    doctorName: string = 'Dr. Arthur Pendelton, MD'
  ): PatientCarePlan {
    const approvedRules = result.triggeredRules.filter((r) =>
      approvedRuleIds.includes(r.rule.ruleId)
    );

    // Build plain language summary
    const summaryParts: string[] = [];
    if (approvedRules.length === 0) {
      summaryParts.push(
        'Your health assessment shows your key measurements are stable. Your doctor recommends staying on track with routine healthy habits and regular checkups.'
      );
    } else {
      summaryParts.push(
        `Your doctor, ${doctorName}, reviewed your health results and created a personalized health plan to help protect your heart, kidneys, and energy levels.`
      );
    }

    // Next Tests
    const nextTests = result.missingInvestigations.map((mi) => ({
      name: mi.investigation,
      reason: mi.reason,
      timeframe: mi.priority === 'Urgent' ? 'In the next 1-2 weeks' : 'Within the next month',
    }));

    // Lifestyle Advice
    const lifestyleAdvice = [
      {
        category: 'Heart-Healthy Nutrition',
        advice:
          'Follow a DASH or Mediterranean style diet. Limit salt/sodium intake to less than 1,500 mg per day and choose whole grains, fresh vegetables, and lean proteins.',
      },
      {
        category: 'Physical Activity',
        advice:
          'Aim for at least 150 minutes of moderate activity per week (such as brisk walking for 30 minutes, 5 days a week).',
      },
      {
        category: 'Blood Pressure & Sugar Tracking',
        advice:
          'Keep a daily log of your morning blood pressure and blood sugar readings to share at your next appointment.',
      },
    ];

    // Referrals
    const referralDetails = result.referrals.map((ref) => ({
      specialist: ref.specialist,
      purpose: ref.referralSummary,
      timeline: ref.suggestedTimeline,
    }));

    // Medication Reminders
    const medicationReminders = approvedRules.map((r) => {
      const customMod = doctorModifications[r.rule.ruleId];
      return {
        name: r.rule.ruleName,
        instruction: customMod || r.rule.recommendation,
      };
    });

    // Follow-Up Date
    const primaryFollowUp = result.followUpSchedules[0] || {
      interval: '1 month',
      reason: 'Routine health review',
    };

    return {
      patientName: 'Johnathan Doe', // active patient default
      patientMrn: 'MRN-884920',
      generatedDate: new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      plainLanguageSummary: summaryParts.join(' '),
      nextTests,
      lifestyleAdvice,
      medicationReminders,
      referralDetails,
      followUpDate: primaryFollowUp.interval,
      doctorApprovedBy: doctorName,
    };
  }
}
