// ============================================================================
// HHIF – Healthcare Interoperability Foundation
// Comprehensive Automated Test Suite
// ============================================================================

import { hhif, FHIRPatient, FHIRObservation } from '../packages/hhif/src';
import { HPPMCareProfileEngine } from '../packages/hppm/src/care-profile';

// Build test profile via HPPM
const careProfileEngine = new HPPMCareProfileEngine();
const testProfile = careProfileEngine.buildProfile({
  patientId: 'pt-hhif-8001',
  demographics: { age: 58, sex: 'M' },
  chronicConditions: ['Essential Hypertension', 'Type 2 Diabetes', 'Obesity'],
  allergies: ['Penicillin'],
  currentMedications: ['Lisinopril 20mg', 'Metformin 1000mg'],
  vitalSigns: [
    { metric: 'Systolic BP', value: 142, unit: 'mmHg' },
    { metric: 'Diastolic BP', value: 88, unit: 'mmHg' },
  ],
  laboratoryResults: [
    { test: 'HbA1c', value: 7.6, unit: '%' },
    { test: 'LDL', value: 140, unit: 'mg/dL' },
  ],
});

function assert(condition: boolean, testName: string, details?: string): void {
  if (condition) {
    console.log(`  ✓ ${testName}`);
  } else {
    console.log(`  ✗ FAILED: ${testName}${details ? ' — ' + details : ''}`);
    process.exitCode = 1;
  }
}

async function runHHIFTestSuite() {
  console.log('================================================================');
  console.log('HEALTHSENSE HEALTHCARE INTEROPERABILITY FOUNDATION (HHIF)');
  console.log('COMPREHENSIVE AUTOMATED TEST SUITE');
  console.log('================================================================');

  let passed = 0;
  let failed = 0;

  function track(condition: boolean, name: string, details?: string) {
    assert(condition, name, details);
    condition ? passed++ : failed++;
  }

  // ── Full Evaluation ──
  const startMs = performance.now();
  const result = hhif.processInteroperability(testProfile);
  const elapsed = performance.now() - startMs;

  console.log(`\nPatient ID: ${testProfile.patientId}`);
  console.log(`FHIR Resources Generated: ${result.fhirResources.length}`);
  console.log(`Total Latency: ${elapsed.toFixed(3)}ms`);

  // ── TEST 1: FHIR Resource Serialization & Deserialization ──
  console.log('\n[TEST 1] FHIR Resource Framework & Serialization');
  const patientResource = result.fhirResources.find(r => r.resourceType === 'Patient') as FHIRPatient;
  track(
    patientResource !== undefined && patientResource.gender === 'male',
    `FHIR Patient resource generated (Gender: ${patientResource?.gender})`
  );

  const services = hhif.getServices();
  const jsonString = services.exportBundleJson(result.fhirResources);
  track(
    jsonString.includes('"resourceType": "Bundle"'),
    `Serialized resources into valid FHIR Bundle JSON payload (${jsonString.length} bytes)`
  );

  const imported = services.importPayload(jsonString);
  track(
    imported.resources.length === result.fhirResources.length,
    `Deserialized FHIR Bundle payload back into ${imported.resources.length} FHIR resources`
  );

  // ── TEST 2: Domain ↔ FHIR Bidirectional Mapping ──
  console.log('\n[TEST 2] Domain ↔ FHIR Bidirectional Mapping');
  track(
    result.roundTripResult.roundTripSuccess === true,
    `Round-trip domain ↔ FHIR mapping success: ${result.roundTripResult.roundTripSuccess}`
  );
  track(
    result.roundTripResult.semanticLossReported === false,
    `Zero semantic loss reported during round-trip conversion`
  );

  // ── TEST 3: FHIR R4 Validation ──
  console.log('\n[TEST 3] FHIR R4 Constraint & Schema Validation');
  const invalidObs: FHIRObservation = {
    resourceType: 'Observation',
    status: 'final',
    code: undefined as any, // missing required code
  };
  const invalidReport = hhif.getValidator().validate(invalidObs);
  track(
    invalidReport.isValid === false && invalidReport.errors.length > 0,
    `Validator correctly flagged missing required element "code" (${invalidReport.errors[0].message})`
  );

  const validReport = result.validationReports.find(r => r.resourceType === 'Patient');
  track(
    validReport !== undefined && validReport.isValid === true,
    `Validator confirmed FHIR Patient resource validity`
  );

  // ── TEST 4: Terminology Extension Support ──
  console.log('\n[TEST 4] Terminology Extension Support (SNOMED, LOINC, RxNorm)');
  const terminology = hhif.getTerminology();
  const loinc = terminology.lookupLOINC('Systolic BP');
  track(
    loinc.coding?.[0]?.system === 'http://loinc.org' && loinc.coding[0].code === '8480-6',
    `LOINC code lookup: "Systolic BP" → ${loinc.coding?.[0]?.system} (${loinc.coding?.[0]?.code})`
  );

  const snomed = terminology.lookupSNOMED('Essential Hypertension');
  track(
    snomed.coding?.[0]?.system === 'http://snomed.info/sct' && snomed.coding[0].code === '59621000',
    `SNOMED CT lookup: "Essential Hypertension" → SNOMED ${snomed.coding?.[0]?.code}`
  );

  const rxNorm = terminology.lookupRxNorm('Lisinopril 20mg');
  track(
    rxNorm.coding?.[0]?.system === 'http://www.nlm.nih.gov/research/umls/rxnorm' && rxNorm.coding[0].code === '314076',
    `RxNorm lookup: "Lisinopril 20mg" → RxNorm ${rxNorm.coding?.[0]?.code}`
  );

  // ── TEST 5: Version Management & Provenance ──
  console.log('\n[TEST 5] Version Management & Provenance');
  track(
    result.provenanceRecords.length === result.fhirResources.length,
    `Recorded ${result.provenanceRecords.length} provenance records for generated resources`
  );
  track(
    result.provenanceRecords[0].action === 'TRANSFORM' && result.provenanceRecords[0].agent.length > 0,
    `Provenance metadata: Action ${result.provenanceRecords[0].action} by ${result.provenanceRecords[0].agent}`
  );

  // ── TEST 6: FHIR Bundle Builder ──
  console.log('\n[TEST 6] FHIR Bundle Builder Services');
  track(
    result.bundle.resourceType === 'Bundle' && result.bundle.type === 'transaction',
    `Created FHIR Transaction Bundle with ${result.bundle.total} entries`
  );

  // ── TEST 7: Clinical Intelligence Integration ──
  console.log('\n[TEST 7] Clinical Intelligence Integration (ACDSS on FHIR Data)');
  track(
    result.acdssEvaluation.caseId !== undefined,
    `ACDSS clinical decision support evaluated over FHIR-mapped data (Case ID: ${result.acdssEvaluation.caseId})`
  );
  track(
    result.acdssEvaluation.differentialDiagnoses.length > 0,
    `Generated ${result.acdssEvaluation.differentialDiagnoses.length} differential diagnoses from mapped FHIR payload`
  );

  // ── TEST 8: End-to-End Workflow & Performance ──
  console.log('\n[TEST 8] End-to-End Workflow & Performance');
  track(
    result.telemetryPublished === true,
    `Telemetry published to HOIP: ${result.telemetryPublished}`
  );
  track(
    result.latencyMs < 50,
    `HHIF Latency: ${result.latencyMs}ms (target <50ms)`
  );

  const telemetry = hhif.getTelemetry();
  track(
    telemetry.totalImports >= 1,
    `Telemetry: ${telemetry.totalImports} imports, avg ${telemetry.averageLatencyMs}ms`
  );

  // ── Summary ──
  console.log('\n================================================================');
  console.log(
    `Total HHIF Tests: ${passed + failed} | PASSED: ${passed} (${(
      (passed / (passed + failed)) *
      100
    ).toFixed(0)}%) | FAILED: ${failed}`
  );
  console.log('================================================================');

  if (failed > 0) {
    console.log('\n⚠ Some tests failed. Review output above.');
  } else {
    console.log('\n✓ ALL QUALITY GATES PASSED — STAGE 4 PHASE 15 COMPLETE');
  }
}

runHHIFTestSuite().catch(console.error);
