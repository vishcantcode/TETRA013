// ============================================================================
// HCQSG – Clinical Quality, Safety & Governance Platform
// Comprehensive Automated Test Suite
// ============================================================================

import { hcqsg } from '../packages/hcqsg/src';
import { HPPMCareProfileEngine } from '../packages/hppm/src/care-profile';

// Build test profile via HPPM
const careProfileEngine = new HPPMCareProfileEngine();
const testProfile = careProfileEngine.buildProfile({
  patientId: 'pt-hcqsg-7001',
  demographics: { age: 67, sex: 'F' },
  chronicConditions: ['Hypertension', 'Type 2 Diabetes', 'CKD Stage 3b', 'Osteoarthritis'],
  allergies: ['Penicillin', 'Sulfonamides'],
  currentMedications: ['Lisinopril 20mg', 'Metformin 1000mg', 'Simvastatin 20mg', 'Amlodipine 5mg'],
  lifestyleSnapshot: {
    smokingStatus: 'NEVER',
    physicalActivityMinPerWeek: 100,
    sleepHoursPerNight: 7.0,
    dietQuality: 'GOOD',
  },
  adherenceHistory: {
    medicationAdherencePercent: 88,
    appointmentAdherencePercent: 92,
    screeningAdherencePercent: 80,
    lifestyleAdherencePercent: 75,
  },
  preferences: {
    preferGeneric: true,
    avoidInjections: true,
    preferOnceDailyDosing: true,
    dietaryPreference: 'NONE',
    exercisePreference: 'LOW_IMPACT',
    communicationPreference: 'TELEHEALTH',
  },
  vitalSigns: [
    { metric: 'Systolic BP', value: 138, unit: 'mmHg' },
    { metric: 'Diastolic BP', value: 84, unit: 'mmHg' },
  ],
  laboratoryResults: [
    { test: 'HbA1c', value: 7.4, unit: '%' },
    { test: 'eGFR', value: 42, unit: 'mL/min/1.73m²' },
    { test: 'LDL', value: 110, unit: 'mg/dL' },
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

async function runHCQSGTestSuite() {
  console.log('================================================================');
  console.log('HEALTHSENSE CLINICAL QUALITY, SAFETY & GOVERNANCE (HCQSG)');
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
  const result = hcqsg.evaluateGovernance(testProfile, 'HIGH', 0.92);
  const elapsed = performance.now() - startMs;

  console.log(`\nEvaluation ID: ${result.evaluationId}`);
  console.log(`Patient ID: ${result.patientId}`);
  console.log(`Total Latency: ${elapsed.toFixed(3)}ms`);

  // ── TEST 1: Clinical Quality Scoring Engine ──
  console.log('\n[TEST 1] Clinical Quality Scoring Engine');
  track(
    result.qualityScore.overallScore >= 80,
    `Overall Quality Score: ${result.qualityScore.overallScore}/100 (Grade: ${result.qualityScore.grade})`
  );
  track(
    result.qualityScore.factors.length === 5,
    `Evaluated ${result.qualityScore.factors.length} quality factors (Evidence, Suitability, Personalization, Safety, Confidence)`
  );
  track(
    result.qualityScore.strengths.length > 0,
    `Quality strengths identified: ${result.qualityScore.strengths.join(', ')}`
  );

  for (const factor of result.qualityScore.factors) {
    console.log(`    → [${factor.status}] ${factor.factorName}: ${factor.score}/100 (weight: ${factor.weight})`);
  }

  // ── TEST 2: Guideline Compliance Validator ──
  console.log('\n[TEST 2] Guideline Compliance Validator');
  track(
    result.complianceReport.checkedGuidelinesCount >= 3,
    `Checked ${result.complianceReport.checkedGuidelinesCount} guideline domains`
  );
  track(
    result.complianceReport.overallCompliancePercent >= 60,
    `Guideline compliance rate: ${result.complianceReport.overallCompliancePercent}%`
  );

  // ── TEST 3: Safety Validation Framework ──
  console.log('\n[TEST 3] Safety Validation Framework');
  track(
    result.safetyValidation.safetyStatus !== undefined,
    `Safety Validation Status: ${result.safetyValidation.safetyStatus}`
  );
  track(
    result.safetyValidation.isSafeForExecution === true,
    `Is Safe for Execution: ${result.safetyValidation.isSafeForExecution}`
  );

  const simvaAmloAlert = result.safetyValidation.alerts.find(a => a.category === 'UNSAFE_COMBINATION');
  track(
    simvaAmloAlert !== undefined,
    `Unsafe Drug Combination Alert detected: ${simvaAmloAlert?.description.slice(0, 50)}...`
  );

  for (const alert of result.safetyValidation.alerts) {
    console.log(`    → [${alert.severity}] ${alert.category}: ${alert.description.slice(0, 65)}...`);
  }

  // ── TEST 4: Continuous Validation Services ──
  console.log('\n[TEST 4] Continuous Validation Services');
  track(
    result.continuousValidation.clinicianAcceptanceRatePercent > 90,
    `Clinician acceptance rate: ${result.continuousValidation.clinicianAcceptanceRatePercent}%`
  );
  track(
    result.continuousValidation.simulationAccuracyPercent > 90,
    `Simulation accuracy rate: ${result.continuousValidation.simulationAccuracyPercent}%`
  );

  // ── TEST 5: Governance Dashboard Backend ──
  console.log('\n[TEST 5] Governance Dashboard Backend');
  track(
    result.governanceDashboard.averageQualityScore > 90,
    `Enterprise Average Quality Score: ${result.governanceDashboard.averageQualityScore}/100`
  );
  track(
    result.governanceDashboard.totalAuditedRecommendations === 1250,
    `Total audited recommendations: ${result.governanceDashboard.totalAuditedRecommendations}`
  );
  track(
    result.governanceDashboard.recommendationDistribution.length === 4,
    `Recommendation distribution tracked across ${result.governanceDashboard.recommendationDistribution.length} categories`
  );

  // ── TEST 6: Clinical KPI Engine ──
  console.log('\n[TEST 6] Clinical KPI Engine');
  track(
    result.clinicalKPIs.overallKPIHealthScore > 80,
    `Overall Clinical KPI Health Score: ${result.clinicalKPIs.overallKPIHealthScore}/100`
  );
  track(
    result.clinicalKPIs.medicationAdherenceRatePercent === 88,
    `Medication adherence KPI: ${result.clinicalKPIs.medicationAdherenceRatePercent}%`
  );

  // ── TEST 7: Model & Knowledge Versioning ──
  console.log('\n[TEST 7] Model & Knowledge Versioning');
  track(
    result.versionMetadata.isReproducible === true,
    `Reproducibility guard active: ${result.versionMetadata.isReproducible}`
  );
  track(
    result.versionMetadata.versionHash.length === 64,
    `SHA-256 version hash generated: ${result.versionMetadata.versionHash.slice(0, 16)}...`
  );

  // ── TEST 8: Enterprise Audit Reporting ──
  console.log('\n[TEST 8] Enterprise Audit Reporting');
  track(
    result.enterpriseReport.reportId.startsWith('report-'),
    `Enterprise Report ID generated: ${result.enterpriseReport.reportId}`
  );
  track(
    result.enterpriseReport.auditTrailSummary.length > 0,
    `Audit trail summary compiled successfully`
  );

  // ── TEST 9: End-to-End Workflow & Performance ──
  console.log('\n[TEST 9] End-to-End Workflow & Performance');
  track(
    result.evaluationId.startsWith('hcqsg-'),
    `Evaluation ID format: ${result.evaluationId}`
  );
  track(
    result.telemetryPublished === true,
    `Telemetry published to HOIP: ${result.telemetryPublished}`
  );
  track(
    result.latencyMs < 50,
    `HCQSG Latency: ${result.latencyMs}ms (target <50ms)`
  );

  const telemetry = hcqsg.getTelemetry();
  track(
    telemetry.totalEvaluations >= 1,
    `Telemetry: ${telemetry.totalEvaluations} evaluations, avg ${telemetry.averageLatencyMs}ms`
  );

  // ── Summary ──
  console.log('\n================================================================');
  console.log(
    `Total HCQSG Tests: ${passed + failed} | PASSED: ${passed} (${(
      (passed / (passed + failed)) *
      100
    ).toFixed(0)}%) | FAILED: ${failed}`
  );
  console.log('================================================================');

  if (failed > 0) {
    console.log('\n⚠ Some tests failed. Review output above.');
  } else {
    console.log('\n✓ ALL QUALITY GATES PASSED — STAGE 3 COMPLETE');
  }
}

runHCQSGTestSuite().catch(console.error);
