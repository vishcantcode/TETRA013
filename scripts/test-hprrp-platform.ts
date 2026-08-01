// ============================================================================
// HPRRP – Production Reliability & Resilience Platform
// Comprehensive Automated Test Suite (STAGE 6 PHASE 26)
// ============================================================================

import { hprrp } from '../packages/hprrp/src';

function assert(condition: boolean, testName: string, details?: string): void {
  if (condition) {
    console.log(`  ✓ ${testName}`);
  } else {
    console.log(`  ✗ FAILED: ${testName}${details ? ' — ' + details : ''}`);
    process.exitCode = 1;
  }
}

async function runHPRRPTestSuite() {
  console.log('================================================================');
  console.log('HEALTHSENSE PRODUCTION RELIABILITY & RESILIENCE PLATFORM (HPRRP)');
  console.log('COMPREHENSIVE AUTOMATED TEST SUITE (STAGE 6 PHASE 26)');
  console.log('================================================================');

  let passed = 0;
  let failed = 0;

  function track(condition: boolean, name: string, details?: string) {
    assert(condition, name, details);
    condition ? passed++ : failed++;
  }

  // ── Execute Full Resilience Evaluation Session ──
  const startMs = performance.now();
  const result = hprrp.executeResilienceEvaluationSession();
  const elapsed = performance.now() - startMs;

  console.log(`\nOverall System Health: ${result.resilienceDashboard.overallHealth}`);
  console.log(`Platform Resilience Score: ${result.resilienceDashboard.resilienceScore}/100`);
  console.log(`Healthy Subsystems: ${result.healthEvaluation.healthyCount}/${result.healthEvaluation.readinessChecks.length}`);
  console.log(`Total Session Latency: ${elapsed.toFixed(3)}ms`);

  // ── TEST 1: Platform Health Management ──
  console.log('\n[TEST 1] Platform Health Management');
  track(
    result.healthEvaluation.readinessChecks.length === 17 && result.healthEvaluation.overallStatus === 'HEALTHY',
    `Evaluated readiness & liveness checks across 17 major platform subsystems (${result.healthEvaluation.healthyCount} HEALTHY)`
  );

  // ── TEST 2: Failure Management Framework ──
  console.log('\n[TEST 2] Failure Management Framework');
  const failureFramework = hprrp.getFailureFramework();
  const resilientRes = await failureFramework.executeWithResilience(
    'Failing Database Operation Test',
    async () => { throw new Error('Simulated DB Timeout'); },
    () => ({ status: 'DEGRADED_FALLBACK', data: 'Cached Baseline Profile' }),
    2
  );
  track(
    resilientRes.fallbackUsed === true && resilientRes.result.status === 'DEGRADED_FALLBACK',
    `Handled execution failure with exponential retries and graceful fallback provider`
  );

  // ── TEST 3: Self-Healing Framework ──
  console.log('\n[TEST 3] Self-Healing Framework');
  track(
    result.selfHealingAction.actionId.startsWith('heal-') && result.selfHealingAction.success === true,
    `Triggered automated self-healing recovery (${result.selfHealingAction.executedAction} on ${result.selfHealingAction.subsystem})`
  );

  // ── TEST 4: Resilience Testing & Fault Injection Simulator ──
  console.log('\n[TEST 4] Resilience Testing & Fault Injection Simulator');
  track(
    result.faultSimulation.recoveryVerified === true && result.faultSimulation.mttrSeconds < 5.0,
    `Simulated controlled fault injection (${result.faultSimulation.targetSubsystem} MTTR: ${result.faultSimulation.mttrSeconds}s)`
  );

  // ── TEST 5: Enterprise Caching Layer ──
  console.log('\n[TEST 5] Enterprise Caching Layer');
  const cachingLayer = hprrp.getCachingLayer();
  const cachedVal = cachingLayer.get<any>(result.cacheTestEntry.key);
  track(
    cachedVal !== undefined && cachedVal.resourceType === 'Patient',
    `Enterprise Caching Layer hit verified (${result.cacheTestEntry.key}, TTL: ${result.cacheTestEntry.ttlSeconds}s)`
  );

  // ── TEST 6: Operational Playbooks & Incident Management ──
  console.log('\n[TEST 6] Operational Playbooks & Incident Management');
  track(
    result.playbookExecuted.incidentId.startsWith('inc-') && result.playbookExecuted.status === 'RESOLVED',
    `Executed operational playbook (${result.playbookExecuted.playbookExecuted}, Status: ${result.playbookExecuted.status})`
  );

  // ── TEST 7: Platform Resilience Dashboard ──
  console.log('\n[TEST 7] Platform Resilience Dashboard');
  track(
    result.resilienceDashboard.resilienceScore >= 90 && result.resilienceDashboard.availabilityPercent >= 99.9,
    `Rendered Platform Resilience Dashboard (Score: ${result.resilienceDashboard.resilienceScore}/100, Availability: ${result.resilienceDashboard.availabilityPercent}%)`
  );

  // ── TEST 8: End-to-End Workflow & Performance ──
  console.log('\n[TEST 8] End-to-End Workflow & Performance');
  track(
    result.telemetryPublished === true,
    `Telemetry published to HOIP: ${result.telemetryPublished}`
  );
  track(
    result.latencyMs < 50,
    `HPRRP Processing Latency: ${result.latencyMs}ms (target <50ms)`
  );

  const telemetry = hprrp.getTelemetry();
  track(
    telemetry.totalFaultSimulations >= 1,
    `HOIP Telemetry: ${telemetry.totalFaultSimulations} fault simulations processed, avg ${telemetry.averageLatencyMs}ms`
  );

  // ── Summary ──
  console.log('\n================================================================');
  console.log(
    `Total HPRRP Tests: ${passed + failed} | PASSED: ${passed} (${(
      (passed / (passed + failed)) *
      100
    ).toFixed(0)}%) | FAILED: ${failed}`
  );
  console.log('================================================================');

  if (failed > 0) {
    console.log('\n⚠ Some tests failed. Review output above.');
  } else {
    console.log('\n✓ ALL QUALITY GATES PASSED — STAGE 6 PHASE 26 COMPLETE');
  }
}

runHPRRPTestSuite().catch(console.error);
