// ============================================================================
// ACDSS – Advanced Clinical Decision Support System
// Comprehensive Automated Test Suite
// ============================================================================

import { acdss, ACDSSPatientCase } from '../packages/acdss/src';

// ── Test Patient Case: Multi-morbid patient with medication interactions ──

const testPatientCase: ACDSSPatientCase = {
  patientId: 'pt-acdss-2001',
  symptoms: ['headache', 'fatigue', 'shortness of breath'],
  vitalSigns: [
    { metric: 'Systolic BP', value: 162, unit: 'mmHg' },
    { metric: 'Diastolic BP', value: 95, unit: 'mmHg' },
    { metric: 'Heart Rate', value: 88, unit: 'bpm' },
    { metric: 'SpO2', value: 95, unit: '%' }
  ],
  laboratoryResults: [
    { test: 'HbA1c', value: 8.4, unit: '%', referenceRange: '<7.0' },
    { test: 'Fasting Glucose', value: 185, unit: 'mg/dL', referenceRange: '70-100' },
    { test: 'eGFR', value: 42, unit: 'mL/min/1.73m²', referenceRange: '>60' },
    { test: 'Creatinine', value: 1.8, unit: 'mg/dL', referenceRange: '0.7-1.3' },
    { test: 'LDL', value: 165, unit: 'mg/dL', referenceRange: '<100' },
    { test: 'Total Cholesterol', value: 245, unit: 'mg/dL', referenceRange: '<200' },
    { test: 'Potassium', value: 5.1, unit: 'mEq/L', referenceRange: '3.5-5.0' },
    { test: 'BMI', value: 34, unit: 'kg/m²', referenceRange: '18.5-24.9' }
  ],
  medications: [
    'Lisinopril 20mg',
    'Metformin 1000mg',
    'Amlodipine 10mg',
    'Simvastatin 40mg',
    'Aspirin 81mg'
  ],
  allergies: ['Penicillin', 'Sulfonamide'],
  chronicConditions: ['Hypertension', 'Type 2 Diabetes', 'CKD Stage 3b', 'Obesity'],
  age: 67,
  sex: 'M'
};

function assert(condition: boolean, testName: string, details?: string): void {
  if (condition) {
    console.log(`  ✓ ${testName}`);
  } else {
    console.log(`  ✗ FAILED: ${testName}${details ? ' — ' + details : ''}`);
    process.exitCode = 1;
  }
}

async function runACDSSTestSuite() {
  console.log('================================================================');
  console.log('HEALTHSENSE ADVANCED CLINICAL DECISION SUPPORT SYSTEM (ACDSS)');
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
  const result = acdss.evaluateCase(testPatientCase);
  const elapsed = performance.now() - startMs;

  console.log(`\nCase ID: ${result.caseId}`);
  console.log(`Patient: ${result.patientId}`);
  console.log(`Total Latency: ${elapsed.toFixed(3)}ms`);

  // ── TEST 1: Differential Diagnosis ──
  console.log('\n[TEST 1] Differential Diagnosis Ranking');
  track(
    result.differentialDiagnoses.length >= 3,
    `Generated ${result.differentialDiagnoses.length} differential diagnoses (expected ≥3)`
  );
  const topDx = result.differentialDiagnoses[0];
  track(
    topDx !== undefined && topDx.confidence > 0,
    `Top diagnosis: ${topDx?.condition} (confidence: ${(topDx?.confidence * 100).toFixed(1)}%)`
  );
  track(
    topDx !== undefined && topDx.supportingFindings.length > 0,
    `Supporting findings present: ${topDx?.supportingFindings.length} finding(s)`
  );
  track(
    topDx !== undefined && topDx.evidenceReferences.length > 0,
    `Evidence references present: ${topDx?.evidenceReferences.join(', ')}`
  );

  // Print all differentials
  for (const dx of result.differentialDiagnoses) {
    console.log(`    → ${dx.condition}: ${(dx.confidence * 100).toFixed(1)}% [${dx.recommendationStrength}]`);
  }

  // ── TEST 2: Multi-Condition Reasoning ──
  console.log('\n[TEST 2] Multi-Condition Reasoning');
  track(
    result.multiConditionAssessment.detectedInteractions.length >= 2,
    `Detected ${result.multiConditionAssessment.detectedInteractions.length} condition interaction(s) (expected ≥2)`
  );
  track(
    result.multiConditionAssessment.combinedRiskScore > 1.0,
    `Combined risk multiplier: ${result.multiConditionAssessment.combinedRiskScore}x (expected >1.0)`
  );
  track(
    result.multiConditionAssessment.holisticRecommendations.length > 0,
    `Holistic recommendations: ${result.multiConditionAssessment.holisticRecommendations.length} recommendation(s)`
  );

  for (const interaction of result.multiConditionAssessment.detectedInteractions) {
    console.log(`    → [${interaction.interactionType}] ${interaction.conditions.join(' + ')}: ${interaction.description.slice(0, 80)}...`);
  }

  // ── TEST 3: Medication Safety ──
  console.log('\n[TEST 3] Medication Interaction Detection');
  track(
    result.medicationSafety.alerts.length >= 1,
    `Detected ${result.medicationSafety.alerts.length} medication alert(s) (expected ≥1)`
  );
  track(
    result.medicationSafety.overallSafetyStatus !== 'SAFE',
    `Overall safety status: ${result.medicationSafety.overallSafetyStatus} (expected non-SAFE)`
  );

  // Check specific interaction: simvastatin + amlodipine
  const statinAlert = result.medicationSafety.alerts.find(a =>
    a.medications.some(m => m.includes('simvastatin'))
  );
  track(
    statinAlert !== undefined,
    `Simvastatin + Amlodipine interaction detected: ${statinAlert?.severity || 'NOT FOUND'}`
  );

  // Check drug-disease interaction: metformin + CKD
  const metforminCkd = result.medicationSafety.alerts.find(a =>
    a.type === 'DISEASE_INTERACTION' && a.medications.some(m => m.includes('metformin'))
  );
  track(
    metforminCkd !== undefined,
    `Metformin + CKD disease interaction detected: ${metforminCkd?.severity || 'NOT FOUND'}`
  );

  for (const alert of result.medicationSafety.alerts) {
    console.log(`    → [${alert.severity}] ${alert.type}: ${alert.description.slice(0, 80)}...`);
  }

  // ── TEST 4: Disease Progression ──
  console.log('\n[TEST 4] Disease Progression Estimation');
  track(
    result.progressionEstimates.length >= 2,
    `Generated ${result.progressionEstimates.length} progression estimate(s) (expected ≥2)`
  );

  const htnProgression = result.progressionEstimates.find(p => p.condition.toLowerCase().includes('hypertension'));
  track(
    htnProgression !== undefined && htnProgression.trajectory === 'DETERIORATING',
    `Hypertension trajectory: ${htnProgression?.trajectory || 'N/A'} (expected DETERIORATING with SBP 162)`
  );

  for (const est of result.progressionEstimates) {
    console.log(`    → ${est.condition}: ${est.trajectory} (confidence: ${(est.confidence * 100).toFixed(0)}%) — ${est.projectedEvolution.slice(0, 70)}...`);
  }

  // ── TEST 5: Clinical Pathways ──
  console.log('\n[TEST 5] Clinical Pathway Generation');
  track(
    result.clinicalPathways.length >= 2,
    `Generated ${result.clinicalPathways.length} clinical pathway(s) (expected ≥2)`
  );

  for (const pathway of result.clinicalPathways) {
    track(
      pathway.steps.length >= 4,
      `${pathway.condition} pathway: ${pathway.steps.length} steps`
    );
    console.log(`    → ${pathway.condition}: ${pathway.steps.map(s => s.action).join(' → ')}`);
  }

  // ── TEST 6: Referral Intelligence ──
  console.log('\n[TEST 6] Referral Recommendations');
  track(
    result.referrals.length >= 1,
    `Generated ${result.referrals.length} referral(s) (expected ≥1)`
  );

  const nephroRef = result.referrals.find(r => r.specialty === 'Nephrology');
  track(
    nephroRef !== undefined,
    `Nephrology referral: ${nephroRef?.urgency || 'NOT FOUND'} (expected for eGFR 42)`
  );

  const endoRef = result.referrals.find(r => r.specialty === 'Endocrinology');
  track(
    endoRef !== undefined,
    `Endocrinology referral: ${endoRef?.urgency || 'NOT FOUND'} (expected for HbA1c 8.4)`
  );

  for (const ref of result.referrals) {
    console.log(`    → ${ref.specialty} [${ref.urgency}]: ${ref.reasoning.slice(0, 70)}...`);
  }

  // ── TEST 7: Clinical Prioritization ──
  console.log('\n[TEST 7] Clinical Prioritization');
  track(
    result.prioritization.priority !== 'ROUTINE',
    `Priority assigned: ${result.prioritization.priority} (expected non-ROUTINE for this case)`
  );
  track(
    result.prioritization.reasoning.length > 0,
    `Reasoning provided: ${result.prioritization.reasoning.length} reason(s)`
  );

  for (const reason of result.prioritization.reasoning) {
    console.log(`    → ${reason}`);
  }

  // ── TEST 8: Explainability ──
  console.log('\n[TEST 8] Explainability & Evidence Chain');
  track(
    result.explainability.evidenceChain !== undefined,
    `HCKEP evidence chain generated: ${result.explainability.evidenceChain.id.slice(0, 16)}...`
  );
  track(
    result.explainability.consultedGuidelines.length > 0,
    `Consulted guidelines: ${result.explainability.consultedGuidelines.length}`
  );
  track(
    result.explainability.confidence > 0,
    `Confidence score: ${(result.explainability.confidence * 100).toFixed(1)}%`
  );
  track(
    result.explainability.uncertainty.length > 0,
    `Uncertainty documented: ${result.explainability.uncertainty.slice(0, 80)}...`
  );
  track(
    result.explainability.recommendationRationale.length > 0,
    `Rationale: ${result.explainability.recommendationRationale.slice(0, 80)}...`
  );
  track(
    result.explainability.supportingObservations.length > 0,
    `Supporting observations: ${result.explainability.supportingObservations.length}`
  );

  // ── TEST 9: End-to-End Workflow & Performance ──
  console.log('\n[TEST 9] End-to-End Workflow & Performance');
  track(
    result.caseId.startsWith('acdss-'),
    `Case ID format valid: ${result.caseId}`
  );
  track(
    result.telemetryPublished === true,
    `Telemetry published to HOIP: ${result.telemetryPublished}`
  );
  track(
    result.latencyMs < 50,
    `ACDSS Latency: ${result.latencyMs}ms (target <50ms)`
  );

  const telemetry = acdss.getTelemetry();
  track(
    telemetry.totalEvaluations >= 1,
    `HOIP telemetry: ${telemetry.totalEvaluations} evaluation(s), avg ${telemetry.averageLatencyMs}ms`
  );

  // ── Summary ──
  console.log('\n================================================================');
  console.log(`Total ACDSS Tests: ${passed + failed} | PASSED: ${passed} (${((passed / (passed + failed)) * 100).toFixed(0)}%) | FAILED: ${failed}`);
  console.log('================================================================');

  if (failed > 0) {
    console.log('\n⚠ Some tests failed. Review output above.');
  } else {
    console.log('\n✓ ALL QUALITY GATES PASSED');
  }
}

runACDSSTestSuite().catch(console.error);
