// ============================================================================
// HECIT – Capability 1: Decision Trace Engine
// ============================================================================

import crypto from 'node:crypto';
import { HECITDecisionTrace, HECITReasoningStep } from './types';
import { HPPMCareProfile } from '@healthsense/hppm';

export class HECITDecisionTraceEngine {

  public generateTrace(
    profile: HPPMCareProfile,
    primaryRecommendation: string
  ): HECITDecisionTrace {
    const traceId = `trace-${crypto.randomUUID().slice(0, 8)}`;

    const patientFindings = [
      `Age: ${profile.demographics.age}, Sex: ${profile.demographics.sex}`,
      `Chronic Conditions: ${profile.chronicConditions.join(', ')}`,
      ...profile.vitalSigns.map(v => `${v.metric}: ${v.value} ${v.unit}`),
      ...profile.laboratoryResults.map(l => `${l.test}: ${l.value} ${l.unit}`),
    ];

    const derivedObservations: string[] = [];
    const sysBp = profile.vitalSigns.find(v => v.metric === 'Systolic BP')?.value;
    if (sysBp && sysBp >= 140) derivedObservations.push('Stage 2 Hypertension BP criteria met (≥140 mmHg)');
    const hba1c = profile.laboratoryResults.find(l => l.test === 'HbA1c')?.value;
    if (hba1c && hba1c >= 7.0) derivedObservations.push('Suboptimal Glycemic Control criteria met (HbA1c ≥7.0%)');
    if (profile.adherenceHistory.medicationAdherencePercent < 80) derivedObservations.push('Suboptimal Medication Adherence (<80%)');

    const rulesApplied = [
      'RULE_HTN_BP_STAGE2_TIER1',
      'RULE_DM_GLYCEMIC_TARGET_AGE_ADJUSTED',
      'RULE_PREFERENCE_ONCE_DAILY_DOSING',
      'RULE_ADHERENCE_BARRIER_SIMPLIFICATION',
    ];

    const evidenceReferences = [
      'AHA/ACC 2017 Hypertension Guidelines (v2.1.0)',
      'ADA 2024 Standards of Care in Diabetes (v4.0.0)',
      'WHO Medication Adherence Guideline (v1.2.0)',
    ];

    const guidelineVersions = ['AHA/ACC 2017 v2.1.0', 'ADA 2024 v4.0.0', 'KDIGO 2024 v1.0.0'];

    const reasoningSequence: HECITReasoningStep[] = [
      {
        stepIndex: 1,
        phase: 'Data Ingestion & Derivation',
        findingOrObservation: patientFindings.slice(0, 2).join('; '),
        ruleApplied: 'RULE_DATA_INGEST',
        evidenceRef: 'HealthSense Platform Foundation (HUSE)',
        guidelineVersion: 'v1.0.0',
      },
      {
        stepIndex: 2,
        phase: 'Clinical Rule Pattern Matching',
        findingOrObservation: derivedObservations.join('; '),
        ruleApplied: rulesApplied[0],
        evidenceRef: evidenceReferences[0],
        guidelineVersion: guidelineVersions[0],
      },
      {
        stepIndex: 3,
        phase: 'Personalization & Preference Adaptation',
        findingOrObservation: `Patient prefers once-daily dosing (${profile.preferences.preferOnceDailyDosing}) and avoiding injections (${profile.preferences.avoidInjections})`,
        ruleApplied: rulesApplied[2],
        evidenceRef: evidenceReferences[2],
        guidelineVersion: 'v1.2.0',
      },
      {
        stepIndex: 4,
        phase: 'Recommendation Synthesis & Verification',
        findingOrObservation: `Primary output synthesized: "${primaryRecommendation}"`,
        ruleApplied: 'RULE_SYNTHESIS_FINAL',
        evidenceRef: evidenceReferences[1],
        guidelineVersion: guidelineVersions[1],
      },
    ];

    return {
      traceId,
      patientId: profile.patientId,
      primaryRecommendation,
      patientFindings,
      derivedObservations,
      rulesApplied,
      evidenceReferences,
      guidelineVersions,
      reasoningSequence,
    };
  }
}
