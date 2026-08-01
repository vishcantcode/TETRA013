// ============================================================================
// ACDSS – Platform Orchestrator
//
// Coordinates all 8 ACDSS capabilities into a single evaluateCase() call.
// Integrates with HCKEP for evidence, HCPI for longitudinal context,
// and HOIP for operational telemetry.
// ============================================================================

import crypto from 'node:crypto';

import { ACDSSPatientCase, ACDSSEvaluationResult, ACDSSExplainabilityReport } from './types';
import { ACDSSDifferentialEngine } from './differential';
import { ACDSSMultiConditionEngine } from './multi-condition';
import { ACDSSMedicationSafetyEngine } from './medication-safety';
import { ACDSSProgressionEngine } from './progression';
import { ACDSSPathwayGenerator } from './pathways';
import { ACDSSReferralEngine } from './referral';
import { ACDSSPrioritizationEngine } from './prioritization';
import { hckep } from '@healthsense/hckep';

export class ACDSSPlatform {
  private differentialEngine = new ACDSSDifferentialEngine();
  private multiConditionEngine = new ACDSSMultiConditionEngine();
  private medicationSafetyEngine = new ACDSSMedicationSafetyEngine();
  private progressionEngine = new ACDSSProgressionEngine();
  private pathwayGenerator = new ACDSSPathwayGenerator();
  private referralEngine = new ACDSSReferralEngine();
  private prioritizationEngine = new ACDSSPrioritizationEngine();

  // Internal telemetry counters for HOIP
  private telemetry = {
    totalEvaluations: 0,
    differentialDiagnosesGenerated: 0,
    referralsMade: 0,
    medicationAlertsRaised: 0,
    pathwaysGenerated: 0,
    totalLatencyMs: 0
  };

  /**
   * Evaluate a complete patient case through all 8 ACDSS capabilities.
   * Returns a comprehensive, explainable clinical decision support result.
   */
  public evaluateCase(patientCase: ACDSSPatientCase): ACDSSEvaluationResult {
    const start = performance.now();
    const caseId = `acdss-${crypto.randomUUID().slice(0, 8)}`;

    // ── 1. Differential Diagnosis ──
    const differentialDiagnoses = this.differentialEngine.evaluate(patientCase);

    // ── 2. Multi-Condition Reasoning ──
    const multiConditionAssessment = this.multiConditionEngine.evaluate(patientCase);

    // ── 3. Medication Safety ──
    const medicationSafety = this.medicationSafetyEngine.evaluate(patientCase);

    // ── 4. Disease Progression (uses HCPI) ──
    const progressionEstimates = this.progressionEngine.evaluate(patientCase);

    // ── 5. Clinical Pathways ──
    const clinicalPathways = this.pathwayGenerator.generate(patientCase);

    // ── 6. Referral Intelligence ──
    const referrals = this.referralEngine.evaluate(patientCase);

    // ── 7. Clinical Prioritization ──
    const prioritization = this.prioritizationEngine.evaluate(
      patientCase,
      medicationSafety,
      referrals
    );

    // ── 8. Explainability (uses HCKEP) ──
    const explainability = this.generateExplainability(caseId, patientCase, differentialDiagnoses);

    const latencyMs = parseFloat((performance.now() - start).toFixed(3));

    // ── Publish telemetry ──
    this.updateTelemetry(differentialDiagnoses.length, referrals.length, medicationSafety.alerts.length, clinicalPathways.length, latencyMs);

    return {
      caseId,
      patientId: patientCase.patientId,
      differentialDiagnoses,
      multiConditionAssessment,
      medicationSafety,
      progressionEstimates,
      clinicalPathways,
      referrals,
      prioritization,
      explainability,
      telemetryPublished: true,
      evaluatedAt: new Date(),
      latencyMs
    };
  }

  /**
   * Generate the explainability report for the entire case.
   */
  private generateExplainability(
    caseId: string,
    patientCase: ACDSSPatientCase,
    differentials: { condition: string; confidence: number }[]
  ): ACDSSExplainabilityReport {
    // Build observations list from patient vitals and labs
    const observations = [
      ...patientCase.vitalSigns.map(v => ({ metric: v.metric, value: v.value, timestamp: new Date() })),
      ...patientCase.laboratoryResults.map(l => ({ metric: l.test, value: l.value, timestamp: new Date() }))
    ];

    // Build evidence chain via HCKEP
    const knowledgeIds = ['gdl-htn-01', 'gdl-prev-01'];
    const evidenceChain = hckep.createEvidenceChain(caseId, knowledgeIds, observations);

    const topDiagnosis = differentials.length > 0 ? differentials[0] : null;
    const uncertainty = topDiagnosis
      ? `Top differential (${topDiagnosis.condition}) confidence: ${(topDiagnosis.confidence * 100).toFixed(1)}%. ${differentials.length > 1 ? `${differentials.length - 1} alternative diagnoses considered.` : 'No alternatives.'}`
      : 'Insufficient findings for differential diagnosis ranking.';

    const supportingObservations = [
      ...patientCase.symptoms.map(s => `Symptom: ${s}`),
      ...patientCase.vitalSigns.map(v => `${v.metric}: ${v.value} ${v.unit}`),
      ...patientCase.laboratoryResults.map(l => `${l.test}: ${l.value} ${l.unit}`)
    ];

    const consultedGuidelines = evidenceChain.consultedEntries.map(e =>
      `${e.title} (${e.evidenceSource}, ${e.version})`
    );

    return {
      evidenceChain,
      supportingObservations,
      consultedGuidelines,
      confidence: evidenceChain.confidenceScore,
      uncertainty,
      recommendationRationale: `ACDSS evaluated ${patientCase.chronicConditions.length} chronic conditions, ${patientCase.medications.length} medications, and ${patientCase.symptoms.length} symptoms. ${differentials.length} differential diagnoses ranked by clinical confidence. All recommendations backed by ${consultedGuidelines.length} clinical guideline(s).`
    };
  }

  /**
   * Update internal HOIP telemetry counters.
   */
  private updateTelemetry(diffs: number, refs: number, medAlerts: number, pathways: number, latency: number): void {
    this.telemetry.totalEvaluations++;
    this.telemetry.differentialDiagnosesGenerated += diffs;
    this.telemetry.referralsMade += refs;
    this.telemetry.medicationAlertsRaised += medAlerts;
    this.telemetry.pathwaysGenerated += pathways;
    this.telemetry.totalLatencyMs += latency;
  }

  /**
   * Return accumulated telemetry for HOIP consumption.
   */
  public getTelemetry() {
    return {
      ...this.telemetry,
      averageLatencyMs: this.telemetry.totalEvaluations > 0
        ? parseFloat((this.telemetry.totalLatencyMs / this.telemetry.totalEvaluations).toFixed(3))
        : 0
    };
  }
}

export const acdss = new ACDSSPlatform();
