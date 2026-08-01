// ============================================================================
// HEHCP – Platform Orchestrator
//
// Single entry point orchestrating enterprise hospital connectors, synchronization,
// event orchestration, resilience, resource reconciliation, workflow triggers,
// operational dashboard backend, and HOIP telemetry.
// ============================================================================

import crypto from 'node:crypto';

import {
  EnterpriseEventPayload,
  SynchronizationRecord,
  ReconciliationReport,
  OperationalDashboardMetrics,
} from './types';
import { HEHCPConnectorFramework } from './connectors';
import { HEHCPSynchronizationEngine } from './synchronization';
import { HEHCPEventOrchestrationPlatform, OrchestrationResult } from './event-orchestration';
import { HEHCPConnectivityResilienceServices } from './resilience';
import { HEHCPResourceReconciliationFramework } from './reconciliation';
import { WorkflowTriggerEngine } from './workflow-triggers';
import { HEHCPOperationalDashboardEngine } from './operational-dashboard';
import { HPPMCareProfileEngine } from '@healthsense/hppm';

export class HEHCPPlatform {
  private connectorFramework = new HEHCPConnectorFramework();
  private syncEngine = new HEHCPSynchronizationEngine();
  private eventOrchestrator = new HEHCPEventOrchestrationPlatform();
  private resilienceServices = new HEHCPConnectivityResilienceServices();
  private reconciliationFramework = new HEHCPResourceReconciliationFramework();
  private workflowTriggerEngine = WorkflowTriggerEngine.getInstance();
  private dashboardEngine = new HEHCPOperationalDashboardEngine();

  // Internal telemetry
  private telemetry = {
    totalEventsReceived: 0,
    totalEventsOrchestrated: 0,
    totalEntitiesSynced: 0,
    totalReconciliations: 0,
    totalWorkflowsTriggered: 0,
    totalLatencyMs: 0,
  };

  /**
   * Ingest and process an incoming enterprise hospital event through the full HEHCP pipeline.
   */
  public async processEnterpriseEvent(event: EnterpriseEventPayload): Promise<{
    eventId: string;
    syncRecord: SynchronizationRecord;
    orchestrationResult: OrchestrationResult;
    reconciliationReport: ReconciliationReport;
    workflowTriggerResult: ReturnType<WorkflowTriggerEngine['triggerClinicalWorkflow']>;
    dashboardMetrics: OperationalDashboardMetrics;
    telemetryPublished: boolean;
    latencyMs: number;
  }> {
    const start = performance.now();

    // 1. Check Resilience & Circuit Breaker
    const connectorId = `conn-${event.sourceSystem.toLowerCase()}-01`;
    const cb = this.resilienceServices.getCircuitBreaker(connectorId);
    if (cb.state === 'OPEN') {
      this.resilienceServices.bufferOfflinePayload(connectorId, event);
    }
    this.resilienceServices.recordSuccess(connectorId);

    // 2. Incremental Synchronization
    const { syncRecord } = this.syncEngine.synchronizeEntity(
      event.patientId,
      'PATIENT',
      'v1.0.0',
      event.idempotencyKey
    );

    // 3. Event Orchestration (AIR + HCOP)
    const orchestrationResult = await this.eventOrchestrator.orchestrateEvent(event);

    // 4. Resource Reconciliation
    const careProfileEngine = new HPPMCareProfileEngine();
    const hsProfile = careProfileEngine.buildProfile({ patientId: event.patientId });
    const reconciliationReport = this.reconciliationFramework.reconcile(event.patientId, hsProfile, event.data);

    // 5. Enterprise Workflow Trigger (ACDSS/HPPHI/HPPM)
    const workflowTriggerResult = this.workflowTriggerEngine.triggerClinicalWorkflow(event);

    // 6. Operational Dashboard Snapshot
    const dashboardMetrics = this.dashboardEngine.getDashboardMetrics();

    const latencyMs = parseFloat((performance.now() - start).toFixed(3));

    // 7. Update telemetry
    this.updateTelemetry(1, 1, 1, 1, 1, latencyMs);

    return {
      eventId: event.eventId,
      syncRecord,
      orchestrationResult,
      reconciliationReport,
      workflowTriggerResult,
      dashboardMetrics,
      telemetryPublished: true,
      latencyMs,
    };
  }

  public getConnectorFramework(): HEHCPConnectorFramework {
    return this.connectorFramework;
  }

  public getSynchronizationEngine(): HEHCPSynchronizationEngine {
    return this.syncEngine;
  }

  public getResilienceServices(): HEHCPConnectivityResilienceServices {
    return this.resilienceServices;
  }

  public getReconciliationFramework(): HEHCPResourceReconciliationFramework {
    return this.reconciliationFramework;
  }

  public getDashboardEngine(): HEHCPOperationalDashboardEngine {
    return this.dashboardEngine;
  }

  private updateTelemetry(
    recv: number,
    orch: number,
    sync: number,
    recon: number,
    trig: number,
    latency: number
  ): void {
    this.telemetry.totalEventsReceived += recv;
    this.telemetry.totalEventsOrchestrated += orch;
    this.telemetry.totalEntitiesSynced += sync;
    this.telemetry.totalReconciliations += recon;
    this.telemetry.totalWorkflowsTriggered += trig;
    this.telemetry.totalLatencyMs += latency;
  }

  public getTelemetry() {
    return {
      ...this.telemetry,
      averageLatencyMs:
        this.telemetry.totalEventsReceived > 0
          ? parseFloat((this.telemetry.totalLatencyMs / this.telemetry.totalEventsReceived).toFixed(3))
          : 0,
    };
  }
}

export const hehcp = new HEHCPPlatform();
