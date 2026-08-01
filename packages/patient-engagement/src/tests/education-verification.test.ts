import { DEMO_PATIENTS } from '@healthsense/clinical-models';
import { ClinicalEngine } from '@healthsense/clinical-intelligence';
import { ExplainabilityEngine } from '@healthsense/clinical-explainability';
import { ReferralEngine } from '@healthsense/clinical-referrals';
import { EducationEngine } from '../engine/EducationEngine';

export function runEducationVerification() {
  const clinicalEngine = new ClinicalEngine();
  const explainabilityEngine = new ExplainabilityEngine();
  const referralEngine = new ReferralEngine();
  const educationEngine = new EducationEngine();

  const results: Record<string, any> = {};

  for (const [key, bundle] of Object.entries(DEMO_PATIENTS)) {
    const assessment = clinicalEngine.evaluatePatient(
      bundle.patient,
      bundle.vitals,
      bundle.labs,
      bundle.conditions,
      [],
      []
    );

    const report = explainabilityEngine.generateReport(assessment);
    const referral = referralEngine.evaluateReferral(assessment, report);

    const planEn = educationEngine.generateEducationPlan(assessment, report, referral, 'en');
    const planHi = educationEngine.generateEducationPlan(assessment, report, referral, 'hi');
    const planGu = educationEngine.generateEducationPlan(assessment, report, referral, 'gu');

    results[key] = {
      patientId: planEn.patientId,
      dietCategory: planEn.lifestylePlan.diet.category,
      dietFocus: planEn.lifestylePlan.diet.primaryFocus,
      exerciseType: planEn.lifestylePlan.exercise.type,
      topPrioritiesCount: planEn.actionPlan.topThreePriorities.length,
      redFlagsCount: planEn.actionPlan.redFlagSymptoms.length,
      remindersCount: planEn.reminderPlan.medicationReminders.length + planEn.reminderPlan.investigationReminders.length,
      summaryEn: planEn.summary.summaryText,
      summaryHi: planHi.summary.summaryText,
      summaryGu: planGu.summary.summaryText,
      audioScriptDuration: planEn.audioGuidance.estimatedDurationSeconds,
      printableHtmlLength: planEn.printableSheetHtml.length
    };
  }

  return results;
}
