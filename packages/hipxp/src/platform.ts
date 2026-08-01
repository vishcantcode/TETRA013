// ============================================================================
// HIPXP – Platform Orchestrator
//
// Single entry point orchestrating Personal Health Command Center, AI Companion,
// Personalized Health Journey, Remote Care Support, Health Insights,
// Accessibility & Inclusivity, Engagement, and HOIP telemetry.
// ============================================================================

import {
  PersonalHealthCommandCenterView,
  CompanionResponse,
  HealthGoal,
  PatientMessage,
  AccessibilityConfig,
  PatientAchievement,
  SupportedLanguage,
} from './types';
import { HIPXPPersonalCommandCenterEngine } from './personal-command-center';
import { HIPXPAIHealthCompanionEngine } from './ai-health-companion';
import { HIPXPPersonalizedHealthJourneyEngine } from './health-journey';
import { HIPXPRemoteCareSupportServices } from './remote-care';
import { HIPXPHealthInsightsEngine } from './health-insights';
import { HIPXPAccessibilityEngine } from './accessibility';
import { HIPXPEngagementEngine } from './engagement';

export class HIPXPPlatform {
  private commandCenterEngine = new HIPXPPersonalCommandCenterEngine();
  private companionEngine = new HIPXPAIHealthCompanionEngine();
  private journeyEngine = new HIPXPPersonalizedHealthJourneyEngine();
  private remoteCareServices = new HIPXPRemoteCareSupportServices();
  private insightsEngine = new HIPXPHealthInsightsEngine();
  private accessibilityEngine = new HIPXPAccessibilityEngine();
  private engagementEngine = new HIPXPEngagementEngine();

  // Internal telemetry
  private telemetry = {
    totalPatientSessions: 0,
    totalCompanionQueries: 0,
    totalVitalsLogged: 0,
    totalMessagesSent: 0,
    totalInsightsGenerated: 0,
    totalLatencyMs: 0,
  };

  /**
   * Render complete Intelligent Patient Experience session.
   */
  public renderPatientSession(
    patientId: string,
    queryText = 'What does my HbA1c test result mean?',
    language: SupportedLanguage = 'en'
  ): {
    commandCenterView: PersonalHealthCommandCenterView;
    companionResponse: CompanionResponse;
    healthGoals: HealthGoal[];
    healthInsights: ReturnType<HIPXPHealthInsightsEngine['generateHealthInsights']>;
    accessibilityConfig: AccessibilityConfig;
    achievements: PatientAchievement[];
    telemetryPublished: boolean;
    latencyMs: number;
  } {
    const start = performance.now();

    // 1. Configure Accessibility
    const accessibilityConfig = this.accessibilityEngine.configureAccessibility(language, 'NORMAL', false);

    // 2. Build Personal Health Command Center
    const commandCenterView = this.commandCenterEngine.buildPersonalCommandCenterView(patientId);

    // 3. Query AI Health Companion
    const companionResponse = this.companionEngine.queryCompanion({ patientId, language, questionText: queryText });

    // 4. Retrieve Health Goals & Milestones
    const healthGoals = this.journeyEngine.getHealthGoals(patientId);

    // 5. Generate Health Insights
    const healthInsights = this.insightsEngine.generateHealthInsights(patientId);

    // 6. Retrieve Achievements
    const achievements = this.engagementEngine.getAchievements(patientId);

    const latencyMs = parseFloat((performance.now() - start).toFixed(3));

    // 7. Update Telemetry
    this.updateTelemetry(1, 1, 0, 0, 1, latencyMs);

    return {
      commandCenterView,
      companionResponse,
      healthGoals,
      healthInsights,
      accessibilityConfig,
      achievements,
      telemetryPublished: true,
      latencyMs,
    };
  }

  public getCommandCenterEngine(): HIPXPPersonalCommandCenterEngine {
    return this.commandCenterEngine;
  }

  public getCompanionEngine(): HIPXPAIHealthCompanionEngine {
    return this.companionEngine;
  }

  public getJourneyEngine(): HIPXPPersonalizedHealthJourneyEngine {
    return this.journeyEngine;
  }

  public getRemoteCareServices(): HIPXPRemoteCareSupportServices {
    return this.remoteCareServices;
  }

  public getInsightsEngine(): HIPXPHealthInsightsEngine {
    return this.insightsEngine;
  }

  public getAccessibilityEngine(): HIPXPAccessibilityEngine {
    return this.accessibilityEngine;
  }

  public getEngagementEngine(): HIPXPEngagementEngine {
    return this.engagementEngine;
  }

  private updateTelemetry(
    sessions: number,
    queries: number,
    vitals: number,
    msgs: number,
    insights: number,
    latency: number
  ): void {
    this.telemetry.totalPatientSessions += sessions;
    this.telemetry.totalCompanionQueries += queries;
    this.telemetry.totalVitalsLogged += vitals;
    this.telemetry.totalMessagesSent += msgs;
    this.telemetry.totalInsightsGenerated += insights;
    this.telemetry.totalLatencyMs += latency;
  }

  public getTelemetry() {
    return {
      ...this.telemetry,
      averageLatencyMs:
        this.telemetry.totalPatientSessions > 0
          ? parseFloat((this.telemetry.totalLatencyMs / this.telemetry.totalPatientSessions).toFixed(3))
          : 0,
    };
  }
}

export const hipxp = new HIPXPPlatform();
