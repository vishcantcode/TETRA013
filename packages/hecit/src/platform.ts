// ============================================================================
// HECIT – Platform Orchestrator
//
// Coordinates all 8 explainability & trust capabilities into a single
// evaluateTransparency() call.
// Integrates with HCKEP, HCPI, HPPM, HCSOF, and HOIP.
// ============================================================================

import crypto from 'node:crypto';

import { HECITEvaluationResult } from './types';
import { HECITDecisionTraceEngine } from './decision-trace';
import { HECITEvidenceExplorerEngine } from './evidence-explorer';
import { HECITConfidenceEngine } from './confidence-decomposition';
import { HECITAlternativesEngine } from './alternatives';
import { HECITTimelineExplanationEngine } from './timeline-explanation';
import { HECITAuditLoggerEngine } from './audit-logger';
import { HECITClinicianSummaryEngine } from './clinician-summary';
import { HECITPatientExplanationEngine } from './patient-explanation';
import { HPPMCareProfile } from '@healthsense/hppm';
import { hckep } from '@healthsense/hckep';

export class HECITPlatform {
  private decisionTraceEngine = new HECITDecisionTraceEngine();
  private evidenceExplorerEngine = new HECITEvidenceExplorerEngine();
  private confidenceEngine = new HECITConfidenceEngine();
  private alternativesEngine = new HECITAlternativesEngine();
  private timelineEngine = new HECITTimelineExplanationEngine();
  private auditLoggerEngine = new HECITAuditLoggerEngine();
  private clinicianSummaryEngine = new HECITClinicianSummaryEngine();
  private patientExplanationEngine = new HECITPatientExplanationEngine();

  // Internal telemetry
  private telemetry = {
    totalExplanationsGenerated: 0,
    totalTracesGenerated: 0,
    totalEvidenceSearches: 0,
    totalAuditLogsCreated: 0,
    totalClinicianSummaries: 0,
    totalPatientExplanations: 0,
    totalLatencyMs: 0,
  };

  /**
   * Synthesize full explainability & trust suite for any clinical decision / profile.
   */
  public evaluateTransparency(
    profile: HPPMCareProfile,
    primaryRecommendation?: string
  ): HECITEvaluationResult {
    const start = performance.now();
    const evaluationId = `hecit-${crypto.randomUUID().slice(0, 8)}`;
    const recText = primaryRecommendation || 'Optimize Lisinopril 20mg daily with home BP monitoring & DASH diet';

    // ── 1. Decision Trace ──
    const decisionTrace = this.decisionTraceEngine.generateTrace(profile, recText);

    // ── 2. Evidence Explorer ──
    const evidenceExploration = this.evidenceExplorerEngine.explore('Hypertension & Glycemic Management');

    // ── 3. Confidence Decomposition ──
    const confidenceDecomposition = this.confidenceEngine.decomposeConfidence(profile);

    // ── 4. Alternative Care Pathways ──
    const alternativePathways = this.alternativesEngine.exploreAlternatives(profile);

    // ── 5. Explanation Timeline ──
    const explanationTimeline = this.timelineEngine.generateTimeline(profile);

    // ── 6. AI Audit Record ──
    const auditRecord = this.auditLoggerEngine.createAuditRecord(
      profile,
      recText,
      evidenceExploration.supportingEvidence.map(e => e.title),
      decisionTrace.rulesApplied,
      1,
      ['Once-daily dosing preferred', 'Low-impact exercise preferred']
    );

    // ── 7. Clinician Summary ──
    const clinicianSummary = this.clinicianSummaryEngine.generateSummary(
      profile,
      recText,
      `Evidence Strength: ${evidenceExploration.overallStrength} (${evidenceExploration.primaryGuidelineSource})`
    );

    // ── 8. Patient-Friendly Explanation ──
    const patientExplanation = this.patientExplanationEngine.generatePatientExplanation(profile);

    // ── 9. HCKEP Evidence Chain ──
    const observations = [
      ...profile.vitalSigns.map(v => ({ metric: v.metric, value: v.value, timestamp: new Date() })),
      ...profile.laboratoryResults.map(l => ({ metric: l.test, value: l.value, timestamp: new Date() })),
    ];
    const explainabilityChain = hckep.createEvidenceChain(
      evaluationId,
      ['gdl-transparency-01', 'gdl-trust-01'],
      observations
    );

    const latencyMs = parseFloat((performance.now() - start).toFixed(3));

    // ── Publish telemetry ──
    this.updateTelemetry(1, 1, evidenceExploration.supportingEvidence.length, 1, 1, 1, latencyMs);

    return {
      evaluationId,
      patientId: profile.patientId,
      decisionTrace,
      evidenceExploration,
      confidenceDecomposition,
      alternativePathways,
      explanationTimeline,
      auditRecord,
      clinicianSummary,
      patientExplanation,
      explainabilityChain,
      telemetryPublished: true,
      evaluatedAt: new Date(),
      latencyMs,
    };
  }

  public getAuditLogger(): HECITAuditLoggerEngine {
    return this.auditLoggerEngine;
  }

  private updateTelemetry(
    explanations: number,
    traces: number,
    evidenceCount: number,
    audits: number,
    clinicianSumms: number,
    patientExps: number,
    latency: number
  ): void {
    this.telemetry.totalExplanationsGenerated += explanations;
    this.telemetry.totalTracesGenerated += traces;
    this.telemetry.totalEvidenceSearches += evidenceCount;
    this.telemetry.totalAuditLogsCreated += audits;
    this.telemetry.totalClinicianSummaries += clinicianSumms;
    this.telemetry.totalPatientExplanations += patientExps;
    this.telemetry.totalLatencyMs += latency;
  }

  public getTelemetry() {
    return {
      ...this.telemetry,
      averageLatencyMs:
        this.telemetry.totalExplanationsGenerated > 0
          ? parseFloat(
              (
                this.telemetry.totalLatencyMs /
                this.telemetry.totalExplanationsGenerated
              ).toFixed(3)
            )
          : 0,
    };
  }
}

export const hecit = new HECITPlatform();
