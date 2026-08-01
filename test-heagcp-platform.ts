// ============================================================================
// HEAGCP – Enterprise Administration, Governance & Configuration Platform
// Comprehensive Automated Test Suite (STAGE 5 PHASE 24)
// ============================================================================

import { heagcp } from '../packages/heagcp/src';

function assert(condition: boolean, testName: string, details?: string): void {
  if (condition) {
    console.log(`  ✓ ${testName}`);
  } else {
    console.log(`  ✗ FAILED: ${testName}${details ? ' — ' + details : ''}`);
    process.exitCode = 1;
  }
}

async function runHEAGCPTestSuite() {
  console.log('================================================================');
  console.log('HEALTHSENSE ENTERPRISE ADMINISTRATION, GOVERNANCE & CONFIGURATION PLATFORM (HEAGCP)');
  console.log('COMPREHENSIVE AUTOMATED TEST SUITE (STAGE 5 PHASE 24)');
  console.log('================================================================');

  let passed = 0;
  let failed = 0;

  function track(condition: boolean, name: string, details?: string) {
    assert(condition, name, details);
    condition ? passed++ : failed++;
  }

  // ── Render Full Enterprise Admin Session ──
  const startMs = performance.now();
  const result = heagcp.renderAdminSession('org-metrohealth');
  const elapsed = performance.now() - startMs;

  console.log(`\nOrganization ID: ${result.organization.orgId}`);
  console.log(`Organization Name: ${result.organization.name}`);
  console.log(`Active Managed Users: ${result.users.length}`);
  console.log(`Total Admin Session Latency: ${elapsed.toFixed(3)}ms`);

  // ── TEST 1: Organization Management Center ──
  console.log('\n[TEST 1] Organization Management Center');
  track(
    result.organization.name === 'MetroHealth Integrated Hospital System' && result.organization.type === 'HOSPITAL_NETWORK',
    `Retrieved tenant organization details (${result.organization.name}, ${result.organization.facilitiesCount} facilities)`
  );

  const orgCenter = heagcp.getOrgCenter();
  const newOrg = orgCenter.registerOrganization('St. Jude Children Medical Network', 'SPECIALTY_CLINIC', '#D93535');
  track(
    newOrg.orgId.startsWith('org-') && newOrg.primaryBranding.primaryColor === '#D93535',
    `Registered new tenant organization: ${newOrg.name} (${newOrg.orgId})`
  );

  // ── TEST 2: User & Access Administration ──
  console.log('\n[TEST 2] User & Access Administration');
  track(
    result.users.length >= 2 && result.users.some(u => u.fullName === 'Dr. Sarah Jenkins'),
    `Retrieved ${result.users.length} active managed users (Delegated Admin: ${result.users[0].delegatedAdmin})`
  );

  const userAdmin = heagcp.getUserAdmin();
  const newUser = userAdmin.provisionUser('mcardoso@metrohealth.org', 'Dr. Maria Cardoso', 'SPECIALIST', 'org-metrohealth', false);
  track(
    newUser.userId.startsWith('usr-') && newUser.status === 'ACTIVE',
    `Provisioned new user: ${newUser.fullName} (${newUser.role})`
  );

  // ── TEST 3: Role, Policy & Permission Management ──
  console.log('\n[TEST 3] Role, Policy & Permission Management');
  track(
    result.policies.length >= 2 && result.policies.some(p => p.baseRole === 'PHYSICIAN'),
    `Configured ${result.policies.length} enterprise role policies (Physician Emergency Override: ${result.policies[0].emergencyOverrideAllowed})`
  );

  // ── TEST 4: Platform Configuration Center ──
  console.log('\n[TEST 4] Platform Configuration Center');
  track(
    result.configuration.featureFlags.enableAICopilot === true && result.configuration.featureFlags.enableSMARTLaunch === true,
    `Retrieved platform configuration (Feature Flags: Copilot=${result.configuration.featureFlags.enableAICopilot}, SMART=${result.configuration.featureFlags.enableSMARTLaunch})`
  );

  const configCenter = heagcp.getConfigCenter();
  const updatedConfig = configCenter.updateFeatureFlags('org-metrohealth', { enableCaregiverPortal: true });
  track(
    updatedConfig.version >= 2 && updatedConfig.featureFlags.enableCaregiverPortal === true,
    `Updated feature flags without code changes (New Config Version: ${updatedConfig.version})`
  );

  // ── TEST 5: Enterprise Governance Center ──
  console.log('\n[TEST 5] Enterprise Governance Center');
  track(
    result.governancePolicies.length >= 2 && result.governancePolicies[0].category === 'AI_SAFETY',
    `Retrieved ${result.governancePolicies.length} enterprise governance policies (${result.governancePolicies[0].title})`
  );

  const govCenter = heagcp.getGovernanceCenter();
  const govEval = govCenter.evaluateGovernanceCompliance('pt-heagcp-9001');
  track(
    govEval.qualityScore.grade === 'A',
    `HCQSG Governance Compliance Verified (Grade: ${govEval.qualityScore.grade})`
  );

  // ── TEST 6: Integration & Connector Management Console ──
  console.log('\n[TEST 6] Integration & Connector Management Console');
  track(
    result.connectors.length >= 3 && result.connectors.some(c => c.type === 'FHIR'),
    `Monitored ${result.connectors.length} interoperability connectors (FHIR Gateway: ${result.connectors[0].healthStatus})`
  );

  // ── TEST 7: Operational Administration Console ──
  console.log('\n[TEST 7] Operational Administration Console');
  track(
    result.systemHealth.systemStatus === 'ALL_SYSTEMS_OPERATIONAL' && result.systemHealth.telemetryQueueDepth >= 0,
    `System Operational Health: ${result.systemHealth.systemStatus} (Background Jobs: ${result.systemHealth.activeBackgroundJobs})`
  );

  // ── TEST 8: Platform Lifecycle Management ──
  console.log('\n[TEST 8] Platform Lifecycle Management');
  track(
    result.activeVersion.releaseTag === 'v5.24.0' && result.activeVersion.readinessScorePercent === 100,
    `Active Lifecycle Release Tag: ${result.activeVersion.releaseTag} (Readiness Score: ${result.activeVersion.readinessScorePercent}%)`
  );

  // ── TEST 9: End-to-End Workflow & Performance ──
  console.log('\n[TEST 9] End-to-End Workflow & Performance');
  track(
    result.telemetryPublished === true,
    `Telemetry published to HOIP: ${result.telemetryPublished}`
  );
  track(
    result.latencyMs < 50,
    `HEAGCP Processing Latency: ${result.latencyMs}ms (target <50ms)`
  );

  const telemetry = heagcp.getTelemetry();
  track(
    telemetry.totalAdminSessions >= 1,
    `HOIP Telemetry: ${telemetry.totalAdminSessions} admin sessions processed, avg ${telemetry.averageLatencyMs}ms`
  );

  // ── Summary ──
  console.log('\n================================================================');
  console.log(
    `Total HEAGCP Tests: ${passed + failed} | PASSED: ${passed} (${(
      (passed / (passed + failed)) *
      100
    ).toFixed(0)}%) | FAILED: ${failed}`
  );
  console.log('================================================================');

  if (failed > 0) {
    console.log('\n⚠ Some tests failed. Review output above.');
  } else {
    console.log('\n✓ ALL QUALITY GATES PASSED — STAGE 5 PHASE 24 COMPLETE');
  }
}

runHEAGCPTestSuite().catch(console.error);
