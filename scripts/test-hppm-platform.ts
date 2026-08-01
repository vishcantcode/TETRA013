// ============================================================================
// HPPM – Precision & Personalized Medicine Platform
// Comprehensive Automated Test Suite
// ============================================================================

import { hppm, HPPMCareProfile } from '../packages/hppm/src';

const testPatientInput: Partial<HPPMCareProfile> & { patientId: string } = {
  patientId: 'pt-hppm-4001',
  demographics: { age: 62, sex: 'M' },
  chronicConditions: ['Hypertension', 'Type 2 Diabetes', 'CKD Stage 3a'],
  allergies: ['Sulfonamides'],
  currentMedications: ['Lisinopril 20mg', 'Metformin 1000mg', 'Amlodipine 5mg'],
  treatmentHistory: [
    {
      medication: 'Lisinopril 20mg',
      startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      response: 'GOOD',
      notes: 'BP stabilized at 134/84 mmHg',
    },
    {
      medication: 'Metformin 1000mg',
      startDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      response: 'PARTIAL',
      notes: 'HbA1c lowered to 7.4%, mild GI discomfort',
    },
  ],
  lifestyleSnapshot: {
    smokingStatus: 'FORMER',
    physicalActivityMinPerWeek: 90,
    sleepHoursPerNight: 6.0,
    dietQuality: 'FAIR',
  },
  adherenceHistory: {
    medicationAdherencePercent: 78,
    appointmentAdherencePercent: 85,
    screeningAdherencePercent: 65,
    lifestyleAdherencePercent: 50,
  },
  preferences: {
    preferGeneric: true,
    avoidInjections: true,
    preferOnceDailyDosing: true,
    dietaryPreference: 'LOW_IMPACT' as any,
    exercisePreference: 'LOW_IMPACT',
    communicationPreference: 'TELEHEALTH',
  },
  previousInterventions: [
    {
      intervention: 'Walking program',
      outcome: 'SUCCESS',
      date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    },
    {
      intervention: 'Strict low-carbohydrate diet',
      outcome: 'FAILURE',
      date: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
    },
  ],
  vitalSigns: [
    { metric: 'Systolic BP', value: 138, unit: 'mmHg' },
    { metric: 'Diastolic BP', value: 86, unit: 'mmHg' },
  ],
  laboratoryResults: [
    { test: 'HbA1c', value: 7.4, unit: '%' },
    { test: 'BMI', value: 29.5, unit: 'kg/m²' },
    { test: 'LDL', value: 145, unit: 'mg/dL' },
  ],
};

function assert(condition: boolean, testName: string, details?: string): void {
  if (condition) {
    console.log(`  ✓ ${testName}`);
  } else {
    console.log(`  ✗ FAILED: ${testName}${details ? ' — ' + details : ''}`);
    process.exitCode = 1;
  }
}

async function runHPPMTestSuite() {
  console.log('================================================================');
  console.log('HEALTHSENSE PRECISION & PERSONALIZED MEDICINE (HPPM)');
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
  const result = hppm.evaluatePatient(testPatientInput, {
    genomicData: {
      available: true,
      pharmacogenomicProfile: { CYP2C19: 'Normal Metabolizer' },
      geneticRiskFactors: ['Apolipoprotein E4 negative'],
    },
  });
  const elapsed = performance.now() - startMs;

  console.log(`\nEvaluation ID: ${result.evaluationId}`);
  console.log(`Patient ID: ${result.patientId}`);
  console.log(`Total Latency: ${elapsed.toFixed(3)}ms`);

  // ── TEST 1: Personalized Care Profile ──
  console.log('\n[TEST 1] Personalized Care Profile Generation');
  track(
    result.careProfile.patientId === 'pt-hppm-4001',
    `Care profile generated for patient ${result.careProfile.patientId}`
  );
  track(
    result.careProfile.treatmentHistory.length >= 2,
    `Treatment history populated: ${result.careProfile.treatmentHistory.length} records`
  );
  track(
    result.careProfile.preferences.preferOnceDailyDosing === true,
    `Patient preferences captured (Once-daily: true, Avoid injections: true)`
  );

  // ── TEST 2: Personalized Recommendation Adaptation ──
  console.log('\n[TEST 2] Personalized Recommendation Adaptation');
  track(
    result.personalizedRecommendations.length >= 4,
    `Generated ${result.personalizedRecommendations.length} adapted recommendations`
  );
  const medicationRec = result.personalizedRecommendations.find(
    (r) => r.category === 'MEDICATION'
  );
  track(
    medicationRec !== undefined && medicationRec.adaptationRationale.length > 0,
    `Medication recommendation adapted with rationale: ${medicationRec?.adaptationRationale[0]}`
  );
  const lifestyleRec = result.personalizedRecommendations.find(
    (r) => r.category === 'LIFESTYLE'
  );
  track(
    lifestyleRec !== undefined &&
      lifestyleRec.recommendation.toLowerCase().includes('walking'),
    `Lifestyle recommendation adapted to previous walking success`
  );

  // ── TEST 3: Treatment Response Learning ──
  console.log('\n[TEST 3] Treatment Response Learning');
  track(
    result.responseInsights.length >= 2,
    `Analyzed response for ${result.responseInsights.length} medications`
  );
  const lisinoprilInsight = result.responseInsights.find((i) =>
    i.medication.includes('Lisinopril')
  );
  track(
    lisinoprilInsight !== undefined && lisinoprilInsight.trend === 'IMPROVING',
    `Lisinopril response: ${lisinoprilInsight?.currentResponse} (trend: ${lisinoprilInsight?.trend})`
  );
  const metforminInsight = result.responseInsights.find((i) =>
    i.medication.includes('Metformin')
  );
  track(
    metforminInsight !== undefined && metforminInsight.currentResponse === 'PARTIAL',
    `Metformin response: ${metforminInsight?.currentResponse} — ${metforminInsight?.recommendedAction.slice(0, 50)}...`
  );

  // ── TEST 4: Personalized Goals ──
  console.log('\n[TEST 4] Personalized Goal Generation');
  track(
    result.personalizedGoals.length >= 4,
    `Generated ${result.personalizedGoals.length} personalized goals`
  );
  const bpGoal = result.personalizedGoals.find((g) => g.domain === 'Blood Pressure');
  track(
    bpGoal !== undefined && bpGoal.target.includes('<130/80'),
    `BP goal: ${bpGoal?.target} (${bpGoal?.rationale.slice(0, 50)}...)`
  );
  const hba1cGoal = result.personalizedGoals.find(
    (g) => g.domain.includes('HbA1c')
  );
  track(
    hba1cGoal !== undefined && hba1cGoal.target === '<7.0%',
    `HbA1c goal: ${hba1cGoal?.target}`
  );

  // ── TEST 5: Adherence Intelligence ──
  console.log('\n[TEST 5] Adherence Intelligence');
  track(
    result.adherenceAssessment.overallAdherenceScore > 0,
    `Overall adherence score: ${result.adherenceAssessment.overallAdherenceScore}/100`
  );
  track(
    result.adherenceAssessment.riskOfNonAdherence === 'MODERATE' ||
      result.adherenceAssessment.riskOfNonAdherence === 'HIGH',
    `Risk of non-adherence assessed: ${result.adherenceAssessment.riskOfNonAdherence}`
  );
  track(
    result.adherenceAssessment.alerts.length > 0,
    `Generated ${result.adherenceAssessment.alerts.length} adherence alert(s)`
  );

  // ── TEST 6: Shared Decision Support ──
  console.log('\n[TEST 6] Shared Decision Support');
  track(
    result.sharedDecisionReport.options.length >= 3,
    `Generated ${result.sharedDecisionReport.options.length} care options`
  );
  track(
    result.sharedDecisionReport.recommendedOption.length > 0,
    `Recommended option: ${result.sharedDecisionReport.recommendedOption}`
  );
  const topOption = result.sharedDecisionReport.options[0];
  track(
    topOption.suitabilityScore > 0 && topOption.evidenceQuality === 'HIGH',
    `Top option suitability: ${topOption.suitabilityScore}/100 (evidence quality: ${topOption.evidenceQuality})`
  );

  // ── TEST 7: Future-Ready Personalization Interfaces ──
  console.log('\n[TEST 7] Future-Ready Personalization Interfaces');
  track(
    result.futureReadyProfile.genomicData.available === true,
    `Genomic data slot active: ${result.futureReadyProfile.genomicData.pharmacogenomicProfile?.CYP2C19}`
  );
  track(
    result.futureReadyProfile.extensionPoints.length >= 5,
    `Extension points configured: ${result.futureReadyProfile.extensionPoints.length} slots`
  );

  // ── TEST 8: End-to-End Workflow & Performance ──
  console.log('\n[TEST 8] End-to-End Workflow & Performance');
  track(
    result.evaluationId.startsWith('hppm-'),
    `Evaluation ID format: ${result.evaluationId}`
  );
  track(
    result.telemetryPublished === true,
    `Telemetry published: ${result.telemetryPublished}`
  );
  track(
    result.latencyMs < 50,
    `HPPM Latency: ${result.latencyMs}ms (target <50ms)`
  );
  track(
    result.explainabilityChain !== undefined &&
      result.explainabilityChain.confidenceScore > 0,
    `HCKEP evidence chain generated: ${(result.explainabilityChain.confidenceScore * 100).toFixed(1)}% confidence`
  );

  const telemetry = hppm.getTelemetry();
  track(
    telemetry.totalEvaluations >= 1,
    `Telemetry: ${telemetry.totalEvaluations} evaluations, avg ${telemetry.averageLatencyMs}ms`
  );

  // ── Summary ──
  console.log('\n================================================================');
  console.log(
    `Total HPPM Tests: ${passed + failed} | PASSED: ${passed} (${(
      (passed / (passed + failed)) *
      100
    ).toFixed(0)}%) | FAILED: ${failed}`
  );
  console.log('================================================================');

  if (failed > 0) {
    console.log('\n⚠ Some tests failed. Review output above.');
  } else {
    console.log('\n✓ ALL QUALITY GATES PASSED');
  }
}

runHPPMTestSuite().catch(console.error);
