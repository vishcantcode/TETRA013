// ============================================================================
// HICSDEP – Identity, Consent & Secure Data Exchange Platform
// Comprehensive Automated Test Suite (STAGE 4 COMPLETE)
// ============================================================================

import { hicsdep } from '../packages/hicsdep/src';

function assert(condition: boolean, testName: string, details?: string): void {
  if (condition) {
    console.log(`  ✓ ${testName}`);
  } else {
    console.log(`  ✗ FAILED: ${testName}${details ? ' — ' + details : ''}`);
    process.exitCode = 1;
  }
}

async function runHICSDEPTestSuite() {
  console.log('================================================================');
  console.log('HEALTHSENSE IDENTITY, CONSENT & SECURE DATA EXCHANGE PLATFORM');
  console.log('COMPREHENSIVE AUTOMATED TEST SUITE (STAGE 4 PHASE 19)');
  console.log('================================================================');

  let passed = 0;
  let failed = 0;

  function track(condition: boolean, name: string, details?: string) {
    assert(condition, name, details);
    condition ? passed++ : failed++;
  }

  // ── Full Secure Exchange Workflow ──
  const startMs = performance.now();
  const result = await hicsdep.processSecureExchangeWorkflow(
    'org-city-hospital',
    'org-metro-lab',
    'prac-dr-smith',
    { family: 'Smith', given: ['Robert'] },
    'MRN-887766',
    '{"observation": "Blood Glucose 118 mg/dL", "status": "final"}'
  );
  const elapsed = performance.now() - startMs;

  console.log(`\nMaster Patient ID: ${result.masterIdentity.masterPatientId}`);
  console.log(`Exchange ID: ${result.secureExchange.exchangeId}`);
  console.log(`Total Latency: ${elapsed.toFixed(3)}ms`);

  // ── TEST 1: Patient Identity Resolution & MPI ──
  console.log('\n[TEST 1] Patient Identity Resolution & MPI');
  track(
    result.masterIdentity.masterPatientId.startsWith('mpi-'),
    `Resolved Master Patient Identity: ${result.masterIdentity.masterPatientId}`
  );
  track(
    result.masterIdentity.linkedIdentifiers.some(i => i.value === 'MRN-887766'),
    `Linked MRN-887766 to Master Patient record (${result.masterIdentity.reconciliationHistory.length} reconciliation log entry)`
  );

  // ── TEST 2: Consent Management Engine ──
  console.log('\n[TEST 2] Consent Management Engine');
  track(
    result.consent.status === 'ACTIVE' && result.consent.scope === 'TREATMENT',
    `Created active TREATMENT consent policy: ${result.consent.consentId}`
  );

  const consentEngine = hicsdep.getConsentEngine();
  const evalRes = consentEngine.evaluateConsent(result.masterIdentity.masterPatientId, 'TREATMENT');
  track(
    evalRes.granted === true,
    `Consent evaluation granted access for active scope TREATMENT`
  );

  const revoked = consentEngine.revokeConsent(result.consent.consentId, 'Patient withdrew consent');
  track(
    revoked.status === 'REVOKED' && revoked.revokedReason !== undefined,
    `Revoked consent policy: ${revoked.consentId} (Status: ${revoked.status})`
  );

  // ── TEST 3: Fine-Grained Healthcare Authorization ──
  console.log('\n[TEST 3] Fine-Grained Healthcare Authorization (HPIE Extension)');
  track(
    result.authorization.authorized === true,
    `Authorization evaluation passed: ${result.authorization.reason}`
  );
  track(
    result.authorization.evaluatedPolicy.includes('HPIE_Policy'),
    `Evaluated security policy from HPIE: ${result.authorization.evaluatedPolicy}`
  );

  // ── TEST 4: Secure Data Exchange Framework ──
  console.log('\n[TEST 4] Secure Data Exchange Framework');
  track(
    result.secureExchange.algorithm === 'AES-256-GCM' && result.secureExchange.encryptedContent.length > 0,
    `Payload encrypted using AES-256 (Ciphertext: ${result.secureExchange.encryptedContent.slice(0, 20)}...)`
  );

  const exchangeFramework = hicsdep.getExchangeFramework();
  const decryptRes = exchangeFramework.verifyAndDecryptPayload(result.secureExchange);
  track(
    decryptRes.success === true && decryptRes.decryptedContent?.includes('Blood Glucose'),
    `Verified digital signature and decrypted payload successfully`
  );

  // ── TEST 5: Data Provenance & Lineage Services ──
  console.log('\n[TEST 5] Data Provenance & Lineage Services');
  track(
    result.provenance.provenanceId.startsWith('prov-') && result.provenance.digitalSignature.length === 64,
    `Generated Data Provenance record with SHA-256 digital signature: ${result.provenance.digitalSignature.slice(0, 16)}...`
  );
  track(
    result.provenance.transformationHistory.length === 3,
    `Tracked lineage transformations: ${result.provenance.transformationHistory.join(' → ')}`
  );

  // ── TEST 6: Privacy Governance & Break-Glass Overrides ──
  console.log('\n[TEST 6] Privacy Governance & Break-Glass Overrides');
  track(
    result.maskedData.ssn === 'XXX-XX-6789',
    `Masked sensitive SSN value according to minimum necessary access rules: ${result.maskedData.ssn}`
  );

  const privacyFramework = hicsdep.getPrivacyFramework();
  const bgOverride = privacyFramework.executeBreakGlass(result.masterIdentity.masterPatientId, 'prac-dr-smith', 'Acute ICU emergency');
  track(
    bgOverride.active === true && bgOverride.overrideId.startsWith('bg-'),
    `Executed Break-Glass emergency override: ${bgOverride.overrideId} (Reason: ${bgOverride.reason})`
  );

  // ── TEST 7: Cross-Organization Trust & Registry ──
  console.log('\n[TEST 7] Cross-Organization Trust Services');
  track(
    result.isTrusted === true,
    `Verified trust relationship for organization ${result.secureExchange.senderOrganizationId}: VERIFIED_TRUSTED`
  );

  // ── TEST 8: Immutable Enterprise Audit Framework ──
  console.log('\n[TEST 8] Immutable Enterprise Audit Framework');
  track(
    result.auditRecord.auditId.startsWith('aud-') && result.auditRecord.outcome === 'SUCCESS',
    `Logged ATNA/FHIR immutable audit record: ${result.auditRecord.auditId} (${result.auditRecord.action})`
  );

  const auditTrail = hicsdep.getAuditFramework().getAuditTrail(result.masterIdentity.masterPatientId);
  track(
    auditTrail.length >= 1,
    `Audit trail query returned ${auditTrail.length} records for patient ${result.masterIdentity.masterPatientId}`
  );

  // ── TEST 9: Clinical Intelligence Integration (ACDSS) ──
  console.log('\n[TEST 9] Clinical Intelligence Integration (ACDSS)');
  track(
    result.acdssEvaluation !== undefined && result.acdssEvaluation.differentialDiagnoses.length > 0,
    `ACDSS decision support executed for authorized & consented patient (${result.acdssEvaluation?.differentialDiagnoses.length} differentials)`
  );

  // ── TEST 10: End-to-End Workflow & Performance ──
  console.log('\n[TEST 10] End-to-End Workflow & Performance');
  track(
    result.telemetryPublished === true,
    `Telemetry published to HOIP: ${result.telemetryPublished}`
  );
  track(
    result.latencyMs < 50,
    `HICSDEP Processing Latency: ${result.latencyMs}ms (target <50ms)`
  );

  const telemetry = hicsdep.getTelemetry();
  track(
    telemetry.totalIdentitiesResolved >= 1,
    `HOIP Telemetry: ${telemetry.totalIdentitiesResolved} identities resolved, avg ${telemetry.averageLatencyMs}ms`
  );

  // ── Summary ──
  console.log('\n================================================================');
  console.log(
    `Total HICSDEP Tests: ${passed + failed} | PASSED: ${passed} (${(
      (passed / (passed + failed)) *
      100
    ).toFixed(0)}%) | FAILED: ${failed}`
  );
  console.log('================================================================');

  if (failed > 0) {
    console.log('\n⚠ Some tests failed. Review output above.');
  } else {
    console.log('\n✓ ALL QUALITY GATES PASSED — STAGE 4 COMPLETE');
  }
}

runHICSDEPTestSuite().catch(console.error);
