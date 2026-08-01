// ============================================================================
// HPOIP – Platform Orchestrator
//
// Single entry point orchestrating Population Health Dashboards, Operational Intelligence,
// Quality & Performance Analytics, AI Insight Engine, Resource & Capacity Planning,
// Executive Command Center, Enterprise Reporting, and HOIP telemetry.
// ============================================================================

import {
  PopulationCohort,
  OperationalMetricsSummary,
  EnterpriseQualityKPIs,
  PopulationAIInsight,
  CapacityPlanningScenario,
  ExecutiveCommandCenterView,
  EnterpriseReportSnapshot,
} from './types';
import { HPOIPPopulationDashboardFramework } from './population-dashboards';
import { HPOIPOperationalIntelligenceEngine } from './operational-intel';
import { HPOIPQualityAnalyticsEngine } from './quality-analytics';
import { HPOIPAIInsightEngine } from './ai-insight-engine';
import { HPOIPCapacityPlanningEngine } from './capacity-planning';
import { HPOIPExecutiveCommandCenterEngine } from './executive-command-center';
import { HPOIPEnterpriseReportingFramework } from './enterprise-reporting';

export class HPOIPPlatform {
  private populationFramework = new HPOIPPopulationDashboardFramework();
  private operationalEngine = new HPOIPOperationalIntelligenceEngine();
  private qualityEngine = new HPOIPQualityAnalyticsEngine();
  private aiInsightEngine = new HPOIPAIInsightEngine();
  private capacityEngine = new HPOIPCapacityPlanningEngine();
  private executiveEngine = new HPOIPExecutiveCommandCenterEngine();
  private reportingFramework = new HPOIPEnterpriseReportingFramework();

  // Internal telemetry
  private telemetry = {
    totalCohortsProcessed: 0,
    totalOperationalMetricsGenerated: 0,
    totalAIInsightsGenerated: 0,
    totalSimulationsRun: 0,
    totalExecutiveViewsRendered: 0,
    totalReportsCreated: 0,
    totalLatencyMs: 0,
  };

  /**
   * Execute full organization-wide population health & operational intelligence analytics session.
   */
  public executeOrganizationAnalyticsSession(
    organizationId = 'org-healthsystem-main',
    organizationName = 'HealthSense Integrated Health Network'
  ): {
    executiveView: ExecutiveCommandCenterView;
    cohorts: PopulationCohort[];
    operationalMetrics: OperationalMetricsSummary;
    qualityKPIs: EnterpriseQualityKPIs;
    aiInsights: PopulationAIInsight[];
    capacityScenario: CapacityPlanningScenario;
    reportSnapshot: EnterpriseReportSnapshot;
    telemetryPublished: boolean;
    latencyMs: number;
  } {
    const start = performance.now();

    // 1. Build Executive Command Center View
    const executiveView = this.executiveEngine.buildExecutiveCommandCenterView(organizationId, organizationName);

    // 2. Population Health Cohorts
    const cohorts = this.populationFramework.getCohorts();

    // 3. Operational Intelligence Metrics
    const operationalMetrics = this.operationalEngine.getOperationalMetrics();

    // 4. Quality & Governance KPIs
    const qualityKPIs = this.qualityEngine.getQualityKPIs();

    // 5. AI Insight Engine
    const aiInsights = this.aiInsightEngine.generatePopulationInsights();

    // 6. Capacity Planning Simulation
    const capacityScenario = this.capacityEngine.runCapacitySimulation(15, 2.0);

    // 7. Enterprise Report Snapshot
    const reportSnapshot = this.reportingFramework.createReportSnapshot(
      'Q3 Enterprise Population Health & Operational Quality Report',
      'PDF_SUMMARY',
      'C-Suite Analytics'
    );

    const latencyMs = parseFloat((performance.now() - start).toFixed(3));

    // 8. Update Telemetry
    this.updateTelemetry(cohorts.length, 1, aiInsights.length, 1, 1, 1, latencyMs);

    return {
      executiveView,
      cohorts,
      operationalMetrics,
      qualityKPIs,
      aiInsights,
      capacityScenario,
      reportSnapshot,
      telemetryPublished: true,
      latencyMs,
    };
  }

  public getPopulationFramework(): HPOIPPopulationDashboardFramework {
    return this.populationFramework;
  }

  public getOperationalEngine(): HPOIPOperationalIntelligenceEngine {
    return this.operationalEngine;
  }

  public getQualityEngine(): HPOIPQualityAnalyticsEngine {
    return this.qualityEngine;
  }

  public getAIInsightEngine(): HPOIPAIInsightEngine {
    return this.aiInsightEngine;
  }

  public getCapacityEngine(): HPOIPCapacityPlanningEngine {
    return this.capacityEngine;
  }

  public getExecutiveEngine(): HPOIPExecutiveCommandCenterEngine {
    return this.executiveEngine;
  }

  public getReportingFramework(): HPOIPEnterpriseReportingFramework {
    return this.reportingFramework;
  }

  private updateTelemetry(
    cohortsCount: number,
    opCount: number,
    insightsCount: number,
    simCount: number,
    execCount: number,
    reportsCount: number,
    latency: number
  ): void {
    this.telemetry.totalCohortsProcessed += cohortsCount;
    this.telemetry.totalOperationalMetricsGenerated += opCount;
    this.telemetry.totalAIInsightsGenerated += insightsCount;
    this.telemetry.totalSimulationsRun += simCount;
    this.telemetry.totalExecutiveViewsRendered += execCount;
    this.telemetry.totalReportsCreated += reportsCount;
    this.telemetry.totalLatencyMs += latency;
  }

  public getTelemetry() {
    return {
      ...this.telemetry,
      averageLatencyMs:
        this.telemetry.totalExecutiveViewsRendered > 0
          ? parseFloat((this.telemetry.totalLatencyMs / this.telemetry.totalExecutiveViewsRendered).toFixed(3))
          : 0,
    };
  }
}

export const hpoip = new HPOIPPlatform();
