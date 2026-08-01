// ============================================================================
// HPOIP – Population Health & Operational Intelligence Platform
// Comprehensive Automated Test Suite (STAGE 5 PHASE 23)
// ============================================================================

import { hpoip } from '../packages/hpoip/src';

function assert(condition: boolean, testName: string, details?: string): void {
  if (condition) {
    console.log(`  ✓ ${testName}`);
  } else {
    console.log(`  ✗ FAILED: ${testName}${details ? ' — ' + details : ''}`);
    process.exitCode = 1;
  }
}

async function runHPOIPTestSuite() {
  console.log('================================================================');
  console.log('HEALTHSENSE POPULATION HEALTH & OPERATIONAL INTELLIGENCE PLATFORM (HPOIP)');
  console.log('COMPREHENSIVE AUTOMATED TEST SUITE (STAGE 5 PHASE 23)');
  console.log('================================================================');

  let passed = 0;
  let failed = 0;

  function track(condition: boolean, name: string, details?: string) {
    assert(condition, name, details);
    condition ? passed++ : failed++;
  }

  // ── Execute Full Organization Analytics Session ──
  const startMs = performance.now();
  const result = hpoip.executeOrganizationAnalyticsSession('org-healthsystem-main', 'HealthSense Integrated Health Network');
  const elapsed = performance.now() - startMs;

  console.log(`\nOrganization ID: ${result.executiveView.organizationId}`);
  console.log(`Organization Name: ${result.executiveView.organizationName}`);
  console.log(`Total Population Managed: ${result.executiveView.totalPopulationManaged}`);
  console.log(`Total Session Latency: ${elapsed.toFixed(3)}ms`);

  // ── TEST 1: Population Health Dashboard Framework ──
  console.log('\n[TEST 1] Population Health Dashboard Framework');
  track(
    result.cohorts.length >= 3 && result.cohorts.some(c => c.name.includes('Hypertension')),
    `Retrieved ${result.cohorts.length} population cohorts (Hypertension, Diabetes, Heart Failure)`
  );

  const popFramework = hpoip.getPopulationFramework();
  const gaps = popFramework.getCareGaps('coh-htn-01');
  track(
    gaps.length >= 2 && gaps[0].urgency === 'HIGH',
    `Identified ${gaps.length} care gaps for Hypertension cohort (${gaps[0].title})`
  );

  // ── TEST 2: Operational Intelligence Engine ──
  console.log('\n[TEST 2] Operational Intelligence Engine');
  track(
    result.operationalMetrics.bedOccupancyRatePercent === 84.5 && result.operationalMetrics.bottleneckedDepartments.length >= 2,
    `Aggregated operational metrics (Bed Occupancy: ${result.operationalMetrics.bedOccupancyRatePercent}%, Wait Time: ${result.operationalMetrics.averageWaitTimeMin} min)`
  );

  // ── TEST 3: Quality & Performance Analytics ──
  console.log('\n[TEST 3] Quality & Performance Analytics');
  track(
    result.qualityKPIs.preventiveScreeningRatePercent === 88.5 && result.qualityKPIs.overallGovernanceGrade === 'A',
    `Surfaced enterprise quality KPIs (Screening Rate: ${result.qualityKPIs.preventiveScreeningRatePercent}%, HCQSG Governance Grade: ${result.qualityKPIs.overallGovernanceGrade})`
  );

  // ── TEST 4: AI Insight Engine ──
  console.log('\n[TEST 4] AI Insight Engine');
  track(
    result.aiInsights.length >= 3 && result.aiInsights.some(i => i.category === 'EMERGING_RISK'),
    `Generated ${result.aiInsights.length} AI-assisted population insights (${result.aiInsights[0].title})`
  );

  // ── TEST 5: Resource & Capacity Planning Tools ──
  console.log('\n[TEST 5] Resource & Capacity Planning Tools');
  track(
    result.capacityScenario.simulatedWaitTimeMin !== undefined && result.capacityScenario.feasible === true,
    `Executed what-if capacity simulation (+15% Demand, +2 FTE Staffing => Simulated Wait Time: ${result.capacityScenario.simulatedWaitTimeMin} min, Feasible: ${result.capacityScenario.feasible})`
  );

  // ── TEST 6: Executive Command Center ──
  console.log('\n[TEST 6] Executive Command Center');
  track(
    result.executiveView.aiExecutiveSummary.includes('Executive Summary') && result.executiveView.topInsights.length > 0,
    `Rendered Executive Command Center with AI Executive Summary`
  );

  // ── TEST 7: Enterprise Reporting & Export Framework ──
  console.log('\n[TEST 7] Enterprise Reporting & Export Framework');
  track(
    result.reportSnapshot.reportId.startsWith('rpt-') && result.reportSnapshot.format === 'PDF_SUMMARY',
    `Created audit-ready report snapshot: ${result.reportSnapshot.title} (${result.reportSnapshot.reportId})`
  );

  // ── TEST 8: End-to-End Workflow & Performance ──
  console.log('\n[TEST 8] End-to-End Workflow & Performance');
  track(
    result.telemetryPublished === true,
    `Telemetry published to HOIP: ${result.telemetryPublished}`
  );
  track(
    result.latencyMs < 50,
    `HPOIP Processing Latency: ${result.latencyMs}ms (target <50ms)`
  );

  const telemetry = hpoip.getTelemetry();
  track(
    telemetry.totalExecutiveViewsRendered >= 1,
    `HOIP Telemetry: ${telemetry.totalExecutiveViewsRendered} organization analytics sessions processed, avg ${telemetry.averageLatencyMs}ms`
  );

  // ── Summary ──
  console.log('\n================================================================');
  console.log(
    `Total HPOIP Tests: ${passed + failed} | PASSED: ${passed} (${(
      (passed / (passed + failed)) *
      100
    ).toFixed(0)}%) | FAILED: ${failed}`
  );
  console.log('================================================================');

  if (failed > 0) {
    console.log('\n⚠ Some tests failed. Review output above.');
  } else {
    console.log('\n✓ ALL QUALITY GATES PASSED — STAGE 5 PHASE 23 COMPLETE');
  }
}

runHPOIPTestSuite().catch(console.error);
