// ============================================================================
// HPPM – Platform Orchestrator
//
// Coordinates all 7 HPPM capabilities into a single evaluatePatient() call.
// Integrates with HCKEP for evidence, HCPI for longitudinal context,
// HPPHI for preventive baselines, and HOIP for operational telemetry.
// ============================================================================

import crypto from 'node:crypto';

import {
  HPPMCareProfile,
  HPPMEvaluationResult,
  HPPMFutureReadyProfile,
} from './types';
import { HPPMCareProfileEngine } from './care-profile';
import { HPPMRecommendationEngine } from './recommendations';
import { HPPMResponseLearningEngine } from './response-learning';
import { HPPMGoalEngine } from './goals';
import { HPPMAdherenceEngine } from './adherence';
import { HPPMSharedDecisionEngine } from './shared-decision';
import { HPPMFutureReadyEngine } from './future-ready';
import { hckep } from '@healthsense/hckep';

export class HPPMPlatform {
  private careProfileEngine = new HPPMCareProfileEngine();
  private recommendationEngine = new HPPMRecommendationEngine();
  private responseLearningEngine = new HPPMResponseLearningEngine();
  private goalEngine = new HPPMGoalEngine();
  private adherenceEngine = new HPPMAdherenceEngine();
  private sharedDecisionEngine = new HPPMSharedDecisionEngine();
  private futureReadyEngine = new HPPMFutureReadyEngine();

  // Internal telemetry
  private telemetry = {
    totalEvaluations: 0,
    totalRecommendationsAdapted: 0,
    totalResponseInsights: 0,
    totalGoalsGenerated: 0,
    totalAdherenceAlerts: 0,
    totalSharedDecisionReports: 0,
    totalLatencyMs: 0,
  };

  /**
   * Evaluate a single patient through all HPPM precision capabilities.
   */
  public evaluatePatient(
    patientInput: Partial<HPPMCareProfile> & { patientId: string },
    customFutureSlots?: Partial<HPPMFutureReadyProfile>
  ): HPPMEvaluationResult {
    const start = performance.now();
    const evaluationId = `hppm-${crypto.randomUUID().slice(0, 8)}`;

    // ── 1. Personalized Care Profile ──
    const careProfile = this.careProfileEngine.buildProfile(patientInput);

    // ── 2. Personalized Recommendations ──
    const personalizedRecommendations =
      this.recommendationEngine.generate(careProfile);

    // ── 3. Response Learning ──
    const responseInsights =
      this.responseLearningEngine.analyze(careProfile);

    // ── 4. Personalized Goals ──
    const personalizedGoals = this.goalEngine.generate(careProfile);

    // ── 5. Adherence Intelligence ──
    const adherenceAssessment = this.adherenceEngine.assess(careProfile);

    // ── 6. Shared Decision Support ──
    const sharedDecisionReport =
      this.sharedDecisionEngine.generate(careProfile);

    // ── 7. Future-Ready Personalization Profile ──
    const futureReadyProfile = this.futureReadyEngine.buildFutureReadyProfile(
      careProfile,
      customFutureSlots
    );

    // ── 8. Explainability via HCKEP ──
    const observations = [
      ...careProfile.vitalSigns.map((v) => ({
        metric: v.metric,
        value: v.value,
        timestamp: new Date(),
      })),
      ...careProfile.laboratoryResults.map((l) => ({
        metric: l.test,
        value: l.value,
        timestamp: new Date(),
      })),
    ];
    const explainabilityChain = hckep.createEvidenceChain(
      evaluationId,
      ['gdl-precision-01', 'gdl-shared-decision-01'],
      observations
    );

    const latencyMs = parseFloat((performance.now() - start).toFixed(3));

    // ── Publish telemetry ──
    this.updateTelemetry(
      personalizedRecommendations.length,
      responseInsights.length,
      personalizedGoals.length,
      adherenceAssessment.alerts.length,
      1,
      latencyMs
    );

    return {
      evaluationId,
      patientId: careProfile.patientId,
      careProfile,
      personalizedRecommendations,
      responseInsights,
      personalizedGoals,
      adherenceAssessment,
      sharedDecisionReport,
      futureReadyProfile,
      explainabilityChain,
      telemetryPublished: true,
      evaluatedAt: new Date(),
      latencyMs,
    };
  }

  public getCareProfileEngine(): HPPMCareProfileEngine {
    return this.careProfileEngine;
  }

  public getAdherenceEngine(): HPPMAdherenceEngine {
    return this.adherenceEngine;
  }

  private updateTelemetry(
    recs: number,
    insights: number,
    goals: number,
    alerts: number,
    sdReports: number,
    latency: number
  ): void {
    this.telemetry.totalEvaluations++;
    this.telemetry.totalRecommendationsAdapted += recs;
    this.telemetry.totalResponseInsights += insights;
    this.telemetry.totalGoalsGenerated += goals;
    this.telemetry.totalAdherenceAlerts += alerts;
    this.telemetry.totalSharedDecisionReports += sdReports;
    this.telemetry.totalLatencyMs += latency;
  }

  public getTelemetry() {
    return {
      ...this.telemetry,
      averageLatencyMs:
        this.telemetry.totalEvaluations > 0
          ? parseFloat(
              (
                this.telemetry.totalLatencyMs / this.telemetry.totalEvaluations
              ).toFixed(3)
            )
          : 0,
    };
  }
}

export const hppm = new HPPMPlatform();
