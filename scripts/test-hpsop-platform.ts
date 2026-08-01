// ============================================================================
// HPSOP – Performance, Scalability & Optimization Platform
// Comprehensive Automated Test Suite (STAGE 6 PHASE 27)
// ============================================================================

import { hpsop } from '../packages/hpsop/src';

function assert(condition: boolean, testName: string, details?: string): void {
  if (condition) {
    console.log(`  ✓ ${testName}`);
  } else {
    console.log(`  ✗ FAILED: ${testName}${details ? ' — ' + details : ''}`);
    process.exitCode = 1;
  }
}

async function runHPSOPTestSuite() {
  console.log('================================================================');
  console.log('HEALTHSENSE PERFORMANCE, SCALABILITY & OPTIMIZATION PLATFORM (HPSOP)');
  console.log('COMPREHENSIVE AUTOMATED TEST SUITE (STAGE 6 PHASE 27)');
  console.log('================================================================');

  let passed = 0;
  let failed = 0;

  function track(condition: boolean, name: string, details?: string) {
    assert(condition, name, details);
    condition ? passed++ : failed++;
  }

  // ── Execute Full Performance Session ──
  const startMs = performance.now();
  const result = hpsop.executePerformanceSession();
  const elapsed = performance.now() - startMs;

  console.log(`\nPlatform Scalability Score: ${result.performanceDashboard.scalabilityScore}/100`);
  console.log(`Total System Throughput: ${result.performanceDashboard.totalRequestsPerSecond} RPS`);
  console.log(`System Latency: P50=${result.performanceDashboard.systemPercentiles.p50Ms}ms, P95=${result.performanceDashboard.systemPercentiles.p95Ms}ms, P99=${result.performanceDashboard.systemPercentiles.p99Ms}ms`);
  console.log(`Total Session Latency: ${elapsed.toFixed(3)}ms`);

  // ── TEST 1: Performance Profiling Framework ──
  console.log('\n[TEST 1] Performance Profiling Framework');
  track(
    result.subsystemProfiles.length >= 4 && result.subsystemProfiles.every(p => p.status === 'OPTIMAL'),
    `Generated performance profiles for ${result.subsystemProfiles.length} major subsystems (All OPTIMAL)`
  );

  // ── TEST 2: Data & Query Optimization Layer ──
  console.log('\n[TEST 2] Data & Query Optimization Layer');
  track(
    result.batchOptimization.batchId.startsWith('batch-opt-') && result.batchOptimization.throughputPerSec > 10000,
    `Executed batch query optimization (${result.batchOptimization.batchSize} entities at ${result.batchOptimization.throughputPerSec} RPS)`
  );

  // ── TEST 3: Scalability Framework ──
  console.log('\n[TEST 3] Scalability Framework');
  track(
    result.partitioningConfig.totalPartitions === 32 && result.partitioningConfig.workloadDistributionPercent > 99,
    `Configured 32-partition workload distribution (${result.partitioningConfig.workloadDistributionPercent}% uniform distribution across ${result.partitioningConfig.activeNodes} nodes)`
  );

  // ── TEST 4: Resource Optimization Engine ──
  console.log('\n[TEST 4] Resource Optimization Engine');
  track(
    result.resourceMetrics.cpuUsagePercent < 50 && result.resourceMetrics.cacheHitRatePercent > 95,
    `Monitored resource utilization (CPU: ${result.resourceMetrics.cpuUsagePercent}%, Cache Hit Ratio: ${result.resourceMetrics.cacheHitRatePercent}%)`
  );

  // ── TEST 5: Frontend & UX Optimization Suite ──
  console.log('\n[TEST 5] Frontend & UX Optimization Suite');
  track(
    result.frontendReport.initialBundleSizeKb < 200 && result.frontendReport.lazyLoadingEnabled === true,
    `Frontend bundle size optimized (${result.frontendReport.initialBundleSizeKb} KB initial, FCP: ${result.frontendReport.firstContentfulPaintMs}ms)`
  );

  // ── TEST 6: Load & Stress Testing Framework ──
  console.log('\n[TEST 6] Load & Stress Testing Framework');
  track(
    result.loadTestResult.achievedRPS === 5000 && result.loadTestResult.passedQualityGate === true,
    `Simulated high-concurrency load test (10,000 VUs, 5,000 RPS achieved, P95: ${result.loadTestResult.latencyP95Ms}ms)`
  );

  // ── TEST 7: Performance Dashboard & Scalability Score Engine ──
  console.log('\n[TEST 7] Performance Dashboard & Scalability Score Engine');
  track(
    result.performanceDashboard.scalabilityScore >= 95 && result.performanceDashboard.totalRequestsPerSecond > 6000,
    `Rendered Performance Dashboard (Scalability Score: ${result.performanceDashboard.scalabilityScore}/100, Throughput: ${result.performanceDashboard.totalRequestsPerSecond} RPS)`
  );

  // ── TEST 8: End-to-End Workflow & Performance ──
  console.log('\n[TEST 8] End-to-End Workflow & Performance');
  track(
    result.telemetryPublished === true,
    `Telemetry published to HOIP: ${result.telemetryPublished}`
  );
  track(
    result.latencyMs < 50,
    `HPSOP Processing Latency: ${result.latencyMs}ms (target <50ms)`
  );

  const telemetry = hpsop.getTelemetry();
  track(
    telemetry.totalDashboardsRendered >= 1,
    `HOIP Telemetry: ${telemetry.totalDashboardsRendered} performance sessions processed, avg ${telemetry.averageLatencyMs}ms`
  );

  // ── Summary ──
  console.log('\n================================================================');
  console.log(
    `Total HPSOP Tests: ${passed + failed} | PASSED: ${passed} (${(
      (passed / (passed + failed)) *
      100
    ).toFixed(0)}%) | FAILED: ${failed}`
  );
  console.log('================================================================');

  if (failed > 0) {
    console.log('\n⚠ Some tests failed. Review output above.');
  } else {
    console.log('\n✓ ALL QUALITY GATES PASSED — STAGE 6 PHASE 27 COMPLETE');
  }
}

runHPSOPTestSuite().catch(console.error);
