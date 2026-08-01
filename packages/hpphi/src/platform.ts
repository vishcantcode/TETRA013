// ============================================================================
// HPPHI – Platform Orchestrator
//
// Coordinates all 8 HPPHI capabilities into a single evaluatePatient() call.
// Integrates with HCKEP for evidence, HCPI for longitudinal context,
// and HOIP for operational telemetry.
// ============================================================================

import crypto from 'node:crypto';

import { HPPHIPatientInput, HPPHIEvaluationResult } from './types';
import { HPPHIScreeningEngine } from './screening';
import { HPPHIRiskDetectionEngine } from './risk-detection';
import { HPPHIMonitoringEngine } from './monitoring';
import { HPPHILifestyleEngine } from './lifestyle';
import { HPPHIHealthScoreEngine } from './health-score';
import { HPPHITrajectoryEngine } from './trajectory';
import { HPPHIInterventionEngine } from './intervention';
import { HPPHIPopulationEngine } from './population';
import { hckep } from '@healthsense/hckep';

export class HPPHIPlatform {
  private screeningEngine = new HPPHIScreeningEngine();
  private riskDetectionEngine = new HPPHIRiskDetectionEngine();
  private monitoringEngine = new HPPHIMonitoringEngine();
  private lifestyleEngine = new HPPHILifestyleEngine();
  private healthScoreEngine = new HPPHIHealthScoreEngine();
  private trajectoryEngine = new HPPHITrajectoryEngine();
  private interventionEngine = new HPPHIInterventionEngine();
  private populationEngine = new HPPHIPopulationEngine();

  // Internal telemetry
  private telemetry = {
    totalEvaluations: 0,
    totalScreeningsRecommended: 0,
    totalRisksDetected: 0,
    totalAlertsGenerated: 0,
    totalLifestyleRecommendations: 0,
    totalInterventionsEstimated: 0,
    totalLatencyMs: 0
  };

  /**
   * Evaluate a single patient through all HPPHI preventive capabilities.
   */
  public evaluatePatient(patient: HPPHIPatientInput): HPPHIEvaluationResult {
    const start = performance.now();
    const evaluationId = `hpphi-${crypto.randomUUID().slice(0, 8)}`;

    // ── 1. Personalized Preventive Screening ──
    const screeningRecommendations = this.screeningEngine.evaluate(patient);

    // ── 2. Early Risk Detection ──
    const emergingRisks = this.riskDetectionEngine.evaluate(patient);

    // ── 3. Longitudinal Preventive Monitoring (uses HCPI) ──
    const monitoringAlerts = this.monitoringEngine.evaluate(patient);

    // ── 4. Lifestyle Optimization ──
    const lifestyleRecommendations = this.lifestyleEngine.evaluate(patient);

    // ── 5. Preventive Health Score ──
    const preventiveHealthScore = this.healthScoreEngine.compute(patient);

    // ── 6. Predictive Health Trajectory ──
    const predictiveTrajectory = this.trajectoryEngine.predict(patient, preventiveHealthScore);

    // ── 7. Intervention Impact ──
    const interventionEstimates = this.interventionEngine.estimate(patient, preventiveHealthScore);

    // ── 8. Explainability via HCKEP ──
    const observations = [
      ...patient.vitalSigns.map(v => ({ metric: v.metric, value: v.value, timestamp: new Date() })),
      ...patient.laboratoryResults.map(l => ({ metric: l.test, value: l.value, timestamp: new Date() }))
    ];
    const explainabilityChain = hckep.createEvidenceChain(
      evaluationId,
      ['gdl-htn-01', 'gdl-prev-01'],
      observations
    );

    const latencyMs = parseFloat((performance.now() - start).toFixed(3));

    // ── Publish telemetry ──
    this.updateTelemetry(
      screeningRecommendations.length,
      emergingRisks.length,
      monitoringAlerts.length,
      lifestyleRecommendations.length,
      interventionEstimates.length,
      latencyMs
    );

    return {
      evaluationId,
      patientId: patient.patientId,
      screeningRecommendations,
      emergingRisks,
      monitoringAlerts,
      lifestyleRecommendations,
      preventiveHealthScore,
      predictiveTrajectory,
      interventionEstimates,
      explainabilityChain,
      telemetryPublished: true,
      evaluatedAt: new Date(),
      latencyMs
    };
  }

  /**
   * Population-level analytics (Capability 8).
   */
  public getPopulationEngine(): HPPHIPopulationEngine {
    return this.populationEngine;
  }

  public getHealthScoreEngine(): HPPHIHealthScoreEngine {
    return this.healthScoreEngine;
  }

  private updateTelemetry(screenings: number, risks: number, alerts: number, lifestyle: number, interventions: number, latency: number): void {
    this.telemetry.totalEvaluations++;
    this.telemetry.totalScreeningsRecommended += screenings;
    this.telemetry.totalRisksDetected += risks;
    this.telemetry.totalAlertsGenerated += alerts;
    this.telemetry.totalLifestyleRecommendations += lifestyle;
    this.telemetry.totalInterventionsEstimated += interventions;
    this.telemetry.totalLatencyMs += latency;
  }

  public getTelemetry() {
    return {
      ...this.telemetry,
      averageLatencyMs: this.telemetry.totalEvaluations > 0
        ? parseFloat((this.telemetry.totalLatencyMs / this.telemetry.totalEvaluations).toFixed(3))
        : 0
    };
  }
}

export const hpphi = new HPPHIPlatform();
