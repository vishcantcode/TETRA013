// ============================================================================
// HPRRP – Platform Orchestrator
//
// Single entry point orchestrating Platform Health Management, Failure Management,
// Self-Healing Framework, Resilience Simulator, Enterprise Caching Layer,
// Operational Playbooks, Resilience Dashboard, and HOIP telemetry.
// ============================================================================

import {
  ReadinessCheckResult,
  FallbackStrategy,
  SelfHealingAction,
  FaultInjectionResult,
  IncidentRecord,
  ResilienceDashboardView,
  FailureClass,
  ServiceHealthStatus,
  CacheEntry,
} from './types';
import { HPRRPPlatformHealthManager } from './platform-health';
import { HPRRPFailureManagementFramework } from './failure-management';
import { HPRRPSelfHealingFramework } from './self-healing';
import { HPRRPResilienceTestingSimulator } from './resilience-testing';
import { HPRRPEnterpriseCachingLayer } from './enterprise-caching';
import { HPRRPOperationalPlaybooksEngine } from './operational-playbooks';
import { HPRRPResilienceDashboardEngine } from './resilience-dashboard';

/** Concrete return shape of HPRRPPlatformHealthManager.evaluatePlatformHealth(). */
interface PlatformHealthEvaluation {
  overallStatus: ServiceHealthStatus;
  readinessChecks: ReadinessCheckResult[];
  healthyCount: number;
  degradedCount: number;
}

/** Full result of a resilience evaluation session. */
export interface ResilienceEvaluationResult {
  resilienceDashboard: ResilienceDashboardView;
  healthEvaluation: PlatformHealthEvaluation;
  faultSimulation: FaultInjectionResult;
  selfHealingAction: SelfHealingAction;
  playbookExecuted: IncidentRecord;
  cacheTestEntry: CacheEntry;
  telemetryPublished: boolean;
  latencyMs: number;
}

export class HPRRPPlatform {
  private healthManager = new HPRRPPlatformHealthManager();
  private failureFramework = new HPRRPFailureManagementFramework();
  private selfHealingFramework = new HPRRPSelfHealingFramework();
  private simulator = new HPRRPResilienceTestingSimulator();
  private cachingLayer = new HPRRPEnterpriseCachingLayer();
  private playbooksEngine = new HPRRPOperationalPlaybooksEngine();
  private dashboardEngine = new HPRRPResilienceDashboardEngine();

  // Internal telemetry
  private telemetry = {
    totalHealthChecks: 0,
    totalFailuresHandled: 0,
    totalSelfHealingActions: 0,
    totalFaultSimulations: 0,
    totalPlaybooksExecuted: 0,
    totalLatencyMs: 0,
  };

  /**
   * Execute complete Production Reliability & Resilience Evaluation Session.
   */
  public executeResilienceEvaluationSession(): ResilienceEvaluationResult {
    const start = performance.now();

    // 1. Evaluate Platform Health
    const healthEvaluation = this.healthManager.evaluatePlatformHealth();

    // 2. Build Resilience Dashboard
    const resilienceDashboard = this.dashboardEngine.buildResilienceDashboardView();

    // 3. Simulate Controlled Fault Injection
    const faultSimulation = this.simulator.simulateFaultInjection(
      'Simulated EHR Connector Disruption Test',
      'HEHCP Enterprise Connector',
      'CONNECTOR'
    );

    // 4. Trigger Self-Healing Recovery Workflow
    const selfHealingAction = this.selfHealingFramework.triggerSelfHealing(
      'HEHCP Enterprise Connector',
      'RESTART_CONNECTOR'
    );

    // 5. Execute Operational Playbook
    const playbookExecuted = this.playbooksEngine.executePlaybook(
      'HEHCP Enterprise Connector',
      'EHR Connector Latency Mitigation',
      'PLAYBOOK-CONNECTOR-RESTART-01',
      'MEDIUM'
    );

    // 6. Test Caching Layer
    const cacheTestEntry = this.cachingLayer.set(
      'fhir-metadata-schema-v4',
      'FHIR_METADATA',
      { resourceType: 'Patient', version: '4.0.1' },
      600
    );

    const latencyMs = parseFloat((performance.now() - start).toFixed(3));

    // 7. Update Telemetry
    this.updateTelemetry(healthEvaluation.readinessChecks.length, 1, 1, 1, 1, latencyMs);

    return {
      resilienceDashboard,
      healthEvaluation,
      faultSimulation,
      selfHealingAction,
      playbookExecuted,
      cacheTestEntry,
      telemetryPublished: true,
      latencyMs,
    };
  }

  public getHealthManager(): HPRRPPlatformHealthManager {
    return this.healthManager;
  }

  public getFailureFramework(): HPRRPFailureManagementFramework {
    return this.failureFramework;
  }

  public getSelfHealingFramework(): HPRRPSelfHealingFramework {
    return this.selfHealingFramework;
  }

  public getSimulator(): HPRRPResilienceTestingSimulator {
    return this.simulator;
  }

  public getCachingLayer(): HPRRPEnterpriseCachingLayer {
    return this.cachingLayer;
  }

  public getPlaybooksEngine(): HPRRPOperationalPlaybooksEngine {
    return this.playbooksEngine;
  }

  public getDashboardEngine(): HPRRPResilienceDashboardEngine {
    return this.dashboardEngine;
  }

  private updateTelemetry(
    checksCount: number,
    failCount: number,
    healCount: number,
    simCount: number,
    playbookCount: number,
    latency: number
  ): void {
    this.telemetry.totalHealthChecks += checksCount;
    this.telemetry.totalFailuresHandled += failCount;
    this.telemetry.totalSelfHealingActions += healCount;
    this.telemetry.totalFaultSimulations += simCount;
    this.telemetry.totalPlaybooksExecuted += playbookCount;
    this.telemetry.totalLatencyMs += latency;
  }

  public getTelemetry() {
    return {
      ...this.telemetry,
      averageLatencyMs:
        this.telemetry.totalFaultSimulations > 0
          ? parseFloat((this.telemetry.totalLatencyMs / this.telemetry.totalFaultSimulations).toFixed(3))
          : 0,
    };
  }
}

export const hprrp = new HPRRPPlatform();
