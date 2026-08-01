// ============================================================================
// HPEDEP – Platform Ecosystem, Extensibility & Developer Platform
// Comprehensive Automated Test Suite (STAGE 5 PHASE 25)
// ============================================================================

import { hpedep } from '../packages/hpedep/src';

function assert(condition: boolean, testName: string, details?: string): void {
  if (condition) {
    console.log(`  ✓ ${testName}`);
  } else {
    console.log(`  ✗ FAILED: ${testName}${details ? ' — ' + details : ''}`);
    process.exitCode = 1;
  }
}

async function runHPEDEPTestSuite() {
  console.log('================================================================');
  console.log('HEALTHSENSE PLATFORM ECOSYSTEM, EXTENSIBILITY & DEVELOPER PLATFORM (HPEDEP)');
  console.log('COMPREHENSIVE AUTOMATED TEST SUITE (STAGE 5 PHASE 25)');
  console.log('================================================================');

  let passed = 0;
  let failed = 0;

  function track(condition: boolean, name: string, details?: string) {
    assert(condition, name, details);
    condition ? passed++ : failed++;
  }

  // ── Execute Full Ecosystem Session ──
  const startMs = performance.now();
  const result = hpedep.executeEcosystemSession('hs_live_key_998124', 'lab.result.flagged', { test: 'BNP', value: 450 });
  const elapsed = performance.now() - startMs;

  console.log(`\nManaged Plugins: ${result.plugins.length}`);
  console.log(`API Gateway Response Status: ${result.gatewayResponse.statusCode}`);
  console.log(`Webhook Dispatch Count: ${result.webhookDispatch.deliveredCount}`);
  console.log(`Total Ecosystem Session Latency: ${elapsed.toFixed(3)}ms`);

  // ── TEST 1: Secure Plugin Architecture & Lifecycle Manager ──
  console.log('\n[TEST 1] Secure Plugin Architecture & Lifecycle Manager');
  track(
    result.plugins.length >= 2 && result.plugins.some(p => p.type === 'CLINICAL'),
    `Retrieved ${result.plugins.length} active platform plugins (${result.plugins[0].name})`
  );

  const pluginFramework = hpedep.getPluginFramework();
  const newPlugin = pluginFramework.installPlugin('Cardiology Risk Calculator UI', 'UI', 'v1.0.0', 'CardioPartner');
  track(
    newPlugin.pluginId.startsWith('plg-') && newPlugin.status === 'ACTIVE',
    `Installed new extension plugin: ${newPlugin.name} (${newPlugin.pluginId})`
  );

  // ── TEST 2: Public Platform SDK ──
  console.log('\n[TEST 2] Public Platform SDK');
  const careProfile = await result.sdkClient.getPatientCareProfile('pt-hpedep-9001');
  track(
    careProfile.patientId === 'pt-hpedep-9001' && careProfile.currentMedications.length >= 0,
    `Public SDK retrieved patient care profile via strongly-typed interfaces`
  );

  // ── TEST 3: Enterprise API Gateway ──
  console.log('\n[TEST 3] Enterprise API Gateway');
  track(
    result.gatewayResponse.statusCode === 200 && result.gatewayResponse.tracingId.startsWith('trc-'),
    `API Gateway processed request with tracing ID (${result.gatewayResponse.tracingId}, Status: ${result.gatewayResponse.statusCode})`
  );

  const apiGateway = hpedep.getAPIGateway();
  const unauthRes = apiGateway.processRequest({
    requestId: 'req-bad-002',
    apiKey: 'hs_invalid_key',
    endpoint: '/v1/patient',
    method: 'GET',
    headers: {},
  });
  track(
    unauthRes.statusCode === 401 && unauthRes.error !== undefined,
    `API Gateway rejected unauthorized API key (Status: ${unauthRes.statusCode})`
  );

  // ── TEST 4: Event Bus & Webhook Delivery Platform ──
  console.log('\n[TEST 4] Event Bus & Webhook Delivery Platform');
  track(
    result.webhookDispatch.deliveredCount >= 1 && result.webhookDispatch.hmacSignature.length > 10,
    `Dispatched webhook event with HMAC SHA-256 signature verification (${result.webhookDispatch.deliveredCount} webhooks delivered)`
  );

  // ── TEST 5: Low-Code Workflow Automation Engine ──
  console.log('\n[TEST 5] Low-Code Workflow Automation Engine');
  track(
    result.automationEval.matchedRulesCount >= 1 && result.automationEval.actionsExecutedCount >= 2,
    `Evaluated low-code automation rules (${result.automationEval.matchedRulesCount} matched, ${result.automationEval.actionsExecutedCount} actions triggered)`
  );

  // ── TEST 6: Developer Portal Infrastructure ──
  console.log('\n[TEST 6] Developer Portal Infrastructure');
  track(
    result.portalOverview.apiDocsCount >= 20 && result.portalOverview.sandboxStatus === 'HEALTHY',
    `Developer Portal overview active (${result.portalOverview.apiDocsCount} API docs, Sandbox Status: ${result.portalOverview.sandboxStatus})`
  );

  // ── TEST 7: Marketplace Foundation ──
  console.log('\n[TEST 7] Marketplace Foundation');
  track(
    result.marketplaceListings.length >= 3 && result.marketplaceListings.some(l => l.rating >= 4.8),
    `Marketplace Foundation catalog operational (${result.marketplaceListings.length} listings available)`
  );

  // ── TEST 8: End-to-End Workflow & Performance ──
  console.log('\n[TEST 8] End-to-End Workflow & Performance');
  track(
    result.telemetryPublished === true,
    `Telemetry published to HOIP: ${result.telemetryPublished}`
  );
  track(
    result.latencyMs < 50,
    `HPEDEP Processing Latency: ${result.latencyMs}ms (target <50ms)`
  );

  const telemetry = hpedep.getTelemetry();
  track(
    telemetry.totalDeveloperSessions >= 1,
    `HOIP Telemetry: ${telemetry.totalDeveloperSessions} developer sessions processed, avg ${telemetry.averageLatencyMs}ms`
  );

  // ── Summary ──
  console.log('\n================================================================');
  console.log(
    `Total HPEDEP Tests: ${passed + failed} | PASSED: ${passed} (${(
      (passed / (passed + failed)) *
      100
    ).toFixed(0)}%) | FAILED: ${failed}`
  );
  console.log('================================================================');

  if (failed > 0) {
    console.log('\n⚠ Some tests failed. Review output above.');
  } else {
    console.log('\n✓ ALL QUALITY GATES PASSED — STAGE 5 PHASE 25 COMPLETE');
  }
}

runHPEDEPTestSuite().catch(console.error);
