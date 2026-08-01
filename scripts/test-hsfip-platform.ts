// ============================================================================
// HSFIP – SMART on FHIR Integration Platform
// Comprehensive Automated Test Suite
// ============================================================================

import { hsfip } from '../packages/hsfip/src';

const sampleFHIRServerUrl = 'https://fhir.ehr-system.org/r4';

function assert(condition: boolean, testName: string, details?: string): void {
  if (condition) {
    console.log(`  ✓ ${testName}`);
  } else {
    console.log(`  ✗ FAILED: ${testName}${details ? ' — ' + details : ''}`);
    process.exitCode = 1;
  }
}

async function runHSFIPTestSuite() {
  console.log('================================================================');
  console.log('HEALTHSENSE SMART ON FHIR INTEGRATION PLATFORM (HSFIP)');
  console.log('COMPREHENSIVE AUTOMATED TEST SUITE');
  console.log('================================================================');

  let passed = 0;
  let failed = 0;

  function track(condition: boolean, name: string, details?: string) {
    assert(condition, name, details);
    condition ? passed++ : failed++;
  }

  // ── Full SMART Workflow ──
  const startMs = performance.now();
  const result = await hsfip.processSMARTWorkflow(sampleFHIRServerUrl, 'healthsense-ehr-app', 'EHR_LAUNCH');
  const elapsed = performance.now() - startMs;

  console.log(`\nSession ID: ${result.sessionId}`);
  console.log(`FHIR Server Base URL: ${result.context.fhirBaseUrl}`);
  console.log(`Total Latency: ${elapsed.toFixed(3)}ms`);

  // ── TEST 1: SMART Capability Discovery ──
  console.log('\n[TEST 1] FHIR Capability Discovery Engine');
  track(
    result.discoveryMetadata.authorization_endpoint.includes('/oauth2/authorize'),
    `Discovered authorization endpoint: ${result.discoveryMetadata.authorization_endpoint}`
  );
  track(
    result.discoveryMetadata.scopes_supported.includes('launch/patient'),
    `Discovered supported SMART scopes (${result.discoveryMetadata.scopes_supported.length} scopes)`
  );

  const capabilityStatement = hsfip.getDiscoveryEngine().parseCapabilityStatement(sampleFHIRServerUrl);
  track(
    capabilityStatement.fhirVersion === '4.0.1' && capabilityStatement.rest[0].security?.service?.[0]?.coding?.[0]?.code === 'SMART-on-FHIR',
    `Parsed FHIR CapabilityStatement (FHIR v${capabilityStatement.fhirVersion}, Security: SMART-on-FHIR)`
  );

  // ── TEST 2: SMART Application Launch Framework ──
  console.log('\n[TEST 2] SMART Application Launch Framework');
  track(
    result.launchUrl.includes('response_type=code') && result.launchUrl.includes('code_challenge='),
    `Generated EHR launch authorization URL with PKCE S256 code_challenge`
  );
  track(
    result.launchUrl.includes('launch=launch-ehr-token-123'),
    `EHR launch context token correctly appended to authorization URL`
  );

  // ── TEST 3: SMART OAuth 2.0 & PKCE Authorization ──
  console.log('\n[TEST 3] SMART OAuth 2.0 & PKCE Authorization');
  track(
    result.tokenResponse.token_type === 'Bearer' && result.tokenResponse.access_token.startsWith('smart-access-'),
    `Exchanged authorization code for Bearer access_token: ${result.tokenResponse.access_token}`
  );
  track(
    result.tokenResponse.expires_in === 3600 && result.tokenResponse.refresh_token !== undefined,
    `OAuth 2.0 token response contains 1-hour expiry and refresh_token`
  );

  // ── TEST 4: Context Management Services ──
  console.log('\n[TEST 4] Context Management Services');
  track(
    result.context.patientId === 'pt-smart-1001' && result.context.encounterId === 'enc-smart-2002',
    `Established SMART context (Patient: ${result.context.patientId}, Encounter: ${result.context.encounterId})`
  );

  const contextManager = hsfip.getContextManager();
  const hasPatientRead = contextManager.hasScope(result.context, 'patient/Observation.read');
  track(
    hasPatientRead === true,
    `Scope verification: "patient/Observation.read" granted via "patient/*.read"`
  );

  // ── TEST 5: SMART Client SDK ──
  console.log('\n[TEST 5] SMART Client SDK (Authenticated FHIR Requests)');
  const sdk = hsfip.getSDK();
  const fhirReq = sdk.executeFHIRRequest(result.context, 'Patient', result.context.patientId);
  track(
    fhirReq.success === true && fhirReq.resource?.resourceType === 'Patient',
    `SDK authenticated FHIR request returned valid Patient resource`
  );

  const refreshedTokens = sdk.refreshSession(result.context);
  track(
    refreshedTokens.access_token.startsWith('smart-access-') && refreshedTokens.access_token !== result.tokenResponse.access_token,
    `SDK refreshed token session successfully (New access_token: ${refreshedTokens.access_token})`
  );

  // ── TEST 6: Security Enforcement & Policy Integration (HPIE) ──
  console.log('\n[TEST 6] Security Enforcement & Policy Integration (HPIE)');
  track(
    result.securityPolicyResult.authorized === true,
    `Security policy evaluation passed: ${result.securityPolicyResult.reason}`
  );
  track(
    result.securityPolicyResult.evaluatedPolicy.includes('HPIE_Policy'),
    `Evaluated security policy from HPIE: ${result.securityPolicyResult.evaluatedPolicy}`
  );

  // ── TEST 7: Clinical Workflow Integration (ACDSS over SMART Patient) ──
  console.log('\n[TEST 7] Clinical Workflow Integration (ACDSS on SMART Context)');
  track(
    result.acdssEvaluation !== undefined && result.acdssEvaluation.differentialDiagnoses.length > 0,
    `ACDSS clinical decision support executed for SMART patient ${result.context.patientId} (${result.acdssEvaluation?.differentialDiagnoses.length} differentials)`
  );

  // ── TEST 8: End-to-End Workflow & Performance ──
  console.log('\n[TEST 8] End-to-End Workflow & Performance');
  track(
    result.sessionId.startsWith('smart-sess-'),
    `Session ID format verified: ${result.sessionId}`
  );
  track(
    result.telemetryPublished === true,
    `Telemetry published to HOIP: ${result.telemetryPublished}`
  );
  track(
    result.latencyMs < 50,
    `HSFIP Processing Latency: ${result.latencyMs}ms (target <50ms)`
  );

  const telemetry = hsfip.getTelemetry();
  track(
    telemetry.totalLaunchesInitiated >= 1,
    `HOIP Telemetry: ${telemetry.totalLaunchesInitiated} launches processed, avg ${telemetry.averageLatencyMs}ms`
  );

  // ── Summary ──
  console.log('\n================================================================');
  console.log(
    `Total HSFIP Tests: ${passed + failed} | PASSED: ${passed} (${(
      (passed / (passed + failed)) *
      100
    ).toFixed(0)}%) | FAILED: ${failed}`
  );
  console.log('================================================================');

  if (failed > 0) {
    console.log('\n⚠ Some tests failed. Review output above.');
  } else {
    console.log('\n✓ ALL QUALITY GATES PASSED — STAGE 4 PHASE 17 COMPLETE');
  }
}

runHSFIPTestSuite().catch(console.error);
