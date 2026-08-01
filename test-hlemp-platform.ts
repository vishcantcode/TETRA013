// ============================================================================
// HLEMP – Legacy & Enterprise Messaging Platform
// Comprehensive Automated Test Suite
// ============================================================================

import { hlemp } from '../packages/hlemp/src';

// Sample HL7 v2.5 ORU^R01 message string
const sampleORUMessage = [
  'MSH|^~\\&|LIS_LAB|CITY_HOSPITAL|HEALTHSENSE|CLINIC|20260723143000||ORU^R01|ctrl-hlemp-9001|P|2.5',
  'PID|1||pt-hlemp-9001||Doe^John^M||19680415|M',
  'PV1|1|O|CLINIC1',
  'OBR|1|ORD1001|LAB2002|4548-4^HbA1c^LN|||20260723140000',
  'OBX|1|NM|HbA1c||7.8|%|4.0-6.0|H|||F',
  'OBX|2|NM|Systolic BP||142|mmHg|90-120|H|||F',
  'DG1|1||38341003^Essential Hypertension^SCT',
].join('\r') + '\r';

function assert(condition: boolean, testName: string, details?: string): void {
  if (condition) {
    console.log(`  ✓ ${testName}`);
  } else {
    console.log(`  ✗ FAILED: ${testName}${details ? ' — ' + details : ''}`);
    process.exitCode = 1;
  }
}

async function runHLEMPTestSuite() {
  console.log('================================================================');
  console.log('HEALTHSENSE LEGACY & ENTERPRISE MESSAGING PLATFORM (HLEMP)');
  console.log('COMPREHENSIVE AUTOMATED TEST SUITE');
  console.log('================================================================');

  let passed = 0;
  let failed = 0;

  function track(condition: boolean, name: string, details?: string) {
    assert(condition, name, details);
    condition ? passed++ : failed++;
  }

  // ── Full Message Processing ──
  const startMs = performance.now();
  const result = hlemp.processHL7Message(sampleORUMessage);
  const elapsed = performance.now() - startMs;

  console.log(`\nControl ID: ${result.parsedMessage.controlId}`);
  console.log(`Message Type: ${result.parsedMessage.messageType}^${result.parsedMessage.triggerEvent}`);
  console.log(`Total Latency: ${elapsed.toFixed(3)}ms`);

  // ── TEST 1: HL7 Parsing ──
  console.log('\n[TEST 1] HL7 v2 Message Parsing');
  track(
    result.parsedMessage.messageType === 'ORU' && result.parsedMessage.triggerEvent === 'R01',
    `Parsed message type: ${result.parsedMessage.messageType}^${result.parsedMessage.triggerEvent}`
  );
  track(
    result.parsedMessage.sendingApplication === 'LIS_LAB' && result.parsedMessage.sendingFacility === 'CITY_HOSPITAL',
    `Parsed MSH header: Sending App ${result.parsedMessage.sendingApplication}, Facility ${result.parsedMessage.sendingFacility}`
  );
  track(
    result.parsedMessage.segments.length === 7,
    `Parsed ${result.parsedMessage.segments.length} HL7 segments (MSH, PID, PV1, OBR, OBX, OBX, DG1)`
  );

  // ── TEST 2: HL7 Validation Framework ──
  console.log('\n[TEST 2] HL7 Message Validation Framework');
  track(
    result.validationReport.isValid === true,
    `Validation report confirmed valid HL7 ORU^R01 message`
  );
  track(
    result.validationReport.errors.length === 0,
    `Zero validation errors detected`
  );

  // ── TEST 3: HL7 ACK Generation ──
  console.log('\n[TEST 3] HL7 ACK Generation');
  track(
    result.ackMessage.ackCode === 'AA',
    `Generated ACK with MSA code ${result.ackMessage.ackCode} (Application Accept)`
  );
  track(
    result.ackMessage.rawAck.includes('MSA|AA|ctrl-hlemp-9001'),
    `RAW ACK string contains expected MSH and MSA segments`
  );

  // ── TEST 4: HL7 ↔ FHIR Transformation Engine ──
  console.log('\n[TEST 4] HL7 ↔ FHIR R4 Transformation Engine');
  track(
    result.transformationResult.conversionSuccess === true,
    `Transformation success: ${result.transformationResult.conversionSuccess}`
  );
  track(
    result.transformationResult.fhirResources.length >= 4,
    `Transformed HL7 payload into ${result.transformationResult.fhirResources.length} FHIR resources (Patient, Observations, Condition)`
  );

  const patientRes = result.transformationResult.fhirResources.find(r => r.resourceType === 'Patient');
  track(
    patientRes !== undefined,
    `Transformed HL7 PID segment into FHIR Patient resource`
  );

  const fhirToHl7Str = hlemp.getTransformer().fhirToHL7('pt-hlemp-9001', result.transformationResult.fhirResources);
  track(
    fhirToHl7Str.includes('MSH|^~\\&|HealthSense') && fhirToHl7Str.includes('PID|1||pt-hlemp-9001'),
    `Transformed FHIR resources back into standard pipe-delimited HL7 string (${fhirToHl7Str.length} bytes)`
  );

  // ── TEST 5: Message Routing Engine (AIR & Connector Integration) ──
  console.log('\n[TEST 5] Message Routing Engine (AIR & Connector Integration)');
  track(
    result.routingResult.routeStatus === 'ROUTED_SUCCESSFULLY',
    `Routing status: ${result.routingResult.routeStatus}`
  );
  track(
    result.routingResult.routedConnectors.length > 0,
    `Routed message to target connectors: ${result.routingResult.routedConnectors.join(', ')}`
  );
  track(
    result.routingResult.appliedPolicy.includes('AIR_Classification'),
    `Applied adaptive routing policy from AIR: ${result.routingResult.appliedPolicy}`
  );

  // ── TEST 6: Message Lifecycle Management & Traceability ──
  console.log('\n[TEST 6] Message Lifecycle Management & Traceability');
  track(
    result.lifecycleRecord.currentState === 'ACKNOWLEDGED',
    `Message lifecycle completed with state: ${result.lifecycleRecord.currentState}`
  );
  track(
    result.lifecycleRecord.stateHistory.length >= 5,
    `Lifecycle state transitions recorded: ${result.lifecycleRecord.stateHistory.map(s => s.state).join(' → ')}`
  );

  // ── TEST 7: Connector Framework (HIS, LIS, RIS, Pharmacy, Billing) ──
  console.log('\n[TEST 7] Connector Framework');
  const connectors = hlemp.getConnectors();
  const lisConnectors = connectors.findConnectorsBySystem('LIS');
  track(
    lisConnectors.length >= 1 && lisConnectors[0].protocol === 'MLLP',
    `Registered LIS Connector: ${lisConnectors[0].connectorName} (${lisConnectors[0].protocol} endpoint)`
  );

  // ── TEST 8: Error Recovery & Dead-Letter Queue (DLQ) ──
  console.log('\n[TEST 8] Error Recovery & Dead-Letter Queue Services');
  const malformedMsg = 'MSH|^~\\&|APP|FAC|||||ADT^A01||P|2.5\r'; // missing PID segment
  const malformedResult = hlemp.processHL7Message(malformedMsg);

  track(
    malformedResult.validationReport.isValid === false,
    `Validation correctly failed for malformed ADT message (missing PID)`
  );
  track(
    malformedResult.ackMessage.ackCode === 'AE',
    `Generated Error ACK (MSA|AE) for malformed message`
  );

  const dlqEntries = hlemp.getErrorRecovery().getDeadLetterQueue();
  track(
    dlqEntries.length >= 1,
    `Dead-Letter Queue captured failed message (Reason: ${dlqEntries[0].failureReason})`
  );

  // ── TEST 9: Clinical Intelligence Execution on HL7 Data ──
  console.log('\n[TEST 9] Clinical Intelligence Integration (ACDSS over Transformed Payload)');
  track(
    result.acdssEvaluation !== undefined && result.acdssEvaluation.differentialDiagnoses.length > 0,
    `ACDSS clinical decision support executed over transformed HL7 payload (${result.acdssEvaluation?.differentialDiagnoses.length} differentials)`
  );

  // ── TEST 10: End-to-End Workflow & Performance ──
  console.log('\n[TEST 10] End-to-End Workflow & Performance');
  track(
    result.telemetryPublished === true,
    `Telemetry published to HOIP: ${result.telemetryPublished}`
  );
  track(
    result.latencyMs < 50,
    `HLEMP Processing Latency: ${result.latencyMs}ms (target <50ms)`
  );

  const telemetry = hlemp.getTelemetry();
  track(
    telemetry.totalMessagesReceived >= 2,
    `HOIP Telemetry: ${telemetry.totalMessagesReceived} messages processed, avg ${telemetry.averageLatencyMs}ms`
  );

  // ── Summary ──
  console.log('\n================================================================');
  console.log(
    `Total HLEMP Tests: ${passed + failed} | PASSED: ${passed} (${(
      (passed / (passed + failed)) *
      100
    ).toFixed(0)}%) | FAILED: ${failed}`
  );
  console.log('================================================================');

  if (failed > 0) {
    console.log('\n⚠ Some tests failed. Review output above.');
  } else {
    console.log('\n✓ ALL QUALITY GATES PASSED — STAGE 4 PHASE 16 COMPLETE');
  }
}

runHLEMPTestSuite().catch(console.error);
