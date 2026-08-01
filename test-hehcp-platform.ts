// ============================================================================
// HEHCP – Enterprise Hospital Connectivity Platform
// Comprehensive Automated Test Suite
// ============================================================================

import { hehcp, EnterpriseEventPayload } from '../packages/hehcp/src';

const sampleEvent: EnterpriseEventPayload = {
  eventId: 'evt-hehcp-10001',
  eventType: 'ADMISSION',
  sourceSystem: 'EHR',
  patientId: 'pt-hehcp-9001',
  encounterId: 'enc-hehcp-501',
  data: {
    systolicBp: 144,
    diastolicBp: 88,
    symptoms: ['shortness of breath', 'chest tightness'],
    laboratoryResults: [{ test: 'HbA1c', value: 7.8, unit: '%' }],
    currentMedicationsCount: 2,
    age: 64,
    sex: 'M',
  },
  timestamp: new Date(),
  idempotencyKey: 'idemp-key-9001-admission',
};

function assert(condition: boolean, testName: string, details?: string): void {
  if (condition) {
    console.log(`  ✓ ${testName}`);
  } else {
    console.log(`  ✗ FAILED: ${testName}${details ? ' — ' + details : ''}`);
    process.exitCode = 1;
  }
}

async function runHEHCPTestSuite() {
  console.log('================================================================');
  console.log('HEALTHSENSE ENTERPRISE HOSPITAL CONNECTIVITY PLATFORM (HEHCP)');
  console.log('COMPREHENSIVE AUTOMATED TEST SUITE');
  console.log('================================================================');

  let passed = 0;
  let failed = 0;

  function track(condition: boolean, name: string, details?: string) {
    assert(condition, name, details);
    condition ? passed++ : failed++;
  }

  // ── Full Processing Pipeline ──
  const startMs = performance.now();
  const result = await hehcp.processEnterpriseEvent(sampleEvent);
  const elapsed = performance.now() - startMs;

  console.log(`\nEvent ID: ${result.eventId}`);
  console.log(`Patient ID: ${sampleEvent.patientId}`);
  console.log(`Total Processing Latency: ${elapsed.toFixed(3)}ms`);

  // ── TEST 1: Enterprise Connector Framework ──
  console.log('\n[TEST 1] Enterprise Connector Framework');
  const connectors = hehcp.getConnectorFramework().getAllConnectors();
  track(
    connectors.length === 9,
    `Registered ${connectors.length} connectors across all 9 hospital system types (EHR, HIS, LIS, RIS, PACS, Pharmacy, Scheduling, Billing, Notification)`
  );

  const ehrHealth = hehcp.getConnectorFramework().pingHealth('conn-ehr-01');
  track(
    ehrHealth.state === 'CONNECTED' && ehrHealth.latencyMs < 20,
    `EHR Connector health check: ${ehrHealth.state} (${ehrHealth.latencyMs}ms latency)`
  );

  // ── TEST 2: Synchronization Engine & Idempotency ──
  console.log('\n[TEST 2] Synchronization Engine & Idempotency');
  track(
    result.syncRecord.status === 'IN_SYNC' && result.syncRecord.syncId.startsWith('sync-'),
    `Entity synchronized: ${result.syncRecord.entityType} (Sync ID: ${result.syncRecord.syncId})`
  );

  const duplicateCheck = hehcp.getSynchronizationEngine().synchronizeEntity('pt-hehcp-9001', 'PATIENT', 'v1.0.0', 'idemp-key-9001-admission');
  track(
    duplicateCheck.isDuplicate === true,
    `Idempotency guard successfully identified duplicate event processing`
  );

  // ── TEST 3: Event Orchestration (AIR + HCOP Integration) ──
  console.log('\n[TEST 3] Event Orchestration Platform');
  track(
    result.orchestrationResult.status === 'ORCHESTRATED',
    `Orchestrated event: ${sampleEvent.eventType} → Workflow: ${result.orchestrationResult.workflowInitiated}`
  );
  track(
    result.orchestrationResult.hcopExecutionId !== undefined,
    `HCOP workflow executed (Execution ID: ${result.orchestrationResult.hcopExecutionId})`
  );

  // ── TEST 4: Connectivity Resilience & Circuit Breaker ──
  console.log('\n[TEST 4] Connectivity Resilience & Circuit Breaker');
  const resilience = hehcp.getResilienceServices();
  const cb = resilience.getCircuitBreaker('conn-ehr-01');
  track(
    cb.state === 'CLOSED' && cb.failureCount === 0,
    `Circuit breaker status: ${cb.state} (Failure count: ${cb.failureCount})`
  );

  resilience.recordFailure('conn-lis-03', 3);
  resilience.recordFailure('conn-lis-03', 3);
  const cbOpen = resilience.recordFailure('conn-lis-03', 3);
  track(
    cbOpen.state === 'OPEN',
    `Circuit breaker tripped to OPEN state after 3 consecutive failures`
  );

  // ── TEST 5: Resource Reconciliation Framework ──
  console.log('\n[TEST 5] Resource Reconciliation Framework');
  track(
    result.reconciliationReport.reconciliationId.startsWith('rec-'),
    `Reconciliation report generated: ${result.reconciliationReport.reconciliationId}`
  );
  track(
    result.reconciliationReport.conflicts.length >= 1,
    `Detected ${result.reconciliationReport.conflicts.length} conflict(s) between external EHR reading and internal domain`
  );

  // ── TEST 6: Enterprise Workflow Trigger Engine ──
  console.log('\n[TEST 6] Enterprise Workflow Trigger Engine');
  track(
    result.workflowTriggerResult.triggeredModule === 'ACDSS',
    `Enterprise ADMISSION event successfully triggered clinical intelligence module: ${result.workflowTriggerResult.triggeredModule}`
  );
  track(
    result.workflowTriggerResult.executionResult.differentialDiagnoses.length > 0,
    `Clinical decision support generated ${result.workflowTriggerResult.executionResult.differentialDiagnoses.length} differential diagnoses`
  );

  // ── TEST 7: Operational Dashboard Backend ──
  console.log('\n[TEST 7] Operational Dashboard Backend');
  const metrics = result.dashboardMetrics;
  track(
    metrics.activeConnectorsCount === 9,
    `Active connectors tracked: ${metrics.activeConnectorsCount}`
  );
  track(
    metrics.eventThroughputPerMinute > 0 && metrics.retrySuccessRatePercent > 90,
    `Throughput: ${metrics.eventThroughputPerMinute} ev/min, Retry success: ${metrics.retrySuccessRatePercent}%`
  );

  // ── TEST 8: End-to-End Workflow & Performance ──
  console.log('\n[TEST 8] End-to-End Workflow & Performance');
  track(
    result.telemetryPublished === true,
    `Telemetry published to HOIP: ${result.telemetryPublished}`
  );
  track(
    result.latencyMs < 50,
    `HEHCP Processing Latency: ${result.latencyMs}ms (target <50ms)`
  );

  const telemetry = hehcp.getTelemetry();
  track(
    telemetry.totalEventsReceived >= 1,
    `HOIP Telemetry: ${telemetry.totalEventsReceived} events processed, avg ${telemetry.averageLatencyMs}ms`
  );

  // ── Summary ──
  console.log('\n================================================================');
  console.log(
    `Total HEHCP Tests: ${passed + failed} | PASSED: ${passed} (${(
      (passed / (passed + failed)) *
      100
    ).toFixed(0)}%) | FAILED: ${failed}`
  );
  console.log('================================================================');

  if (failed > 0) {
    console.log('\n⚠ Some tests failed. Review output above.');
  } else {
    console.log('\n✓ ALL QUALITY GATES PASSED — STAGE 4 PHASE 18 COMPLETE');
  }
}

runHEHCPTestSuite().catch(console.error);
