// ============================================================================
// HPPHI – Preventive & Predictive Health Intelligence
// Comprehensive Automated Test Suite
// ============================================================================

import { hpphi, HPPHIPatientInput } from '../packages/hpphi/src';

// ── Test Patient: 58M, smoker, overweight, borderline diabetes, sedentary ──

const testPatient: HPPHIPatientInput = {
  patientId: 'pt-hpphi-3001',
  age: 58,
  sex: 'M',
  chronicConditions: ['Hypertension', 'Pre-diabetes'],
  familyHistory: ['Heart disease', 'Type 2 Diabetes', 'Hypertension'],
  medications: ['Lisinopril 10mg', 'Aspirin 81mg'],
  allergies: ['Penicillin'],
  lifestyleFactors: {
    smokingStatus: 'CURRENT',
    alcoholUsePerWeek: 10,
    physicalActivityMinPerWeek: 60,
    sleepHoursPerNight: 5.5,
    stressLevel: 'HIGH',
    dietQuality: 'FAIR'
  },
  vitalSigns: [
    { metric: 'Systolic BP', value: 142, unit: 'mmHg' },
    { metric: 'Diastolic BP', value: 92, unit: 'mmHg' },
    { metric: 'Heart Rate', value: 82, unit: 'bpm' }
  ],
  laboratoryResults: [
    { test: 'HbA1c', value: 6.2, unit: '%' },
    { test: 'Fasting Glucose', value: 115, unit: 'mg/dL' },
    { test: 'LDL', value: 168, unit: 'mg/dL' },
    { test: 'Total Cholesterol', value: 248, unit: 'mg/dL' },
    { test: 'BMI', value: 31, unit: 'kg/m²' },
    { test: 'eGFR', value: 72, unit: 'mL/min/1.73m²' },
    { test: 'Creatinine', value: 1.1, unit: 'mg/dL' }
  ],
  previousScreenings: [
    { screening: 'Blood Pressure', lastDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), result: 'Elevated' },
    { screening: 'Lipid Panel', lastDate: new Date(Date.now() - 800 * 24 * 60 * 60 * 1000), result: 'Borderline high' },
    { screening: 'Eye Exam', lastDate: new Date(Date.now() - 900 * 24 * 60 * 60 * 1000), result: 'Normal' }
  ]
};

function assert(condition: boolean, testName: string, details?: string): void {
  if (condition) {
    console.log(`  ✓ ${testName}`);
  } else {
    console.log(`  ✗ FAILED: ${testName}${details ? ' — ' + details : ''}`);
    process.exitCode = 1;
  }
}

async function runHPPHITestSuite() {
  console.log('================================================================');
  console.log('HEALTHSENSE PREVENTIVE & PREDICTIVE HEALTH INTELLIGENCE (HPPHI)');
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
  const result = hpphi.evaluatePatient(testPatient);
  const elapsed = performance.now() - startMs;

  console.log(`\nEvaluation ID: ${result.evaluationId}`);
  console.log(`Patient: ${result.patientId}`);
  console.log(`Total Latency: ${elapsed.toFixed(3)}ms`);

  // ── TEST 1: Personalized Preventive Screening ──
  console.log('\n[TEST 1] Personalized Preventive Screening');
  track(
    result.screeningRecommendations.length >= 6,
    `Generated ${result.screeningRecommendations.length} screening recommendations (expected ≥6)`
  );

  const overdueScreenings = result.screeningRecommendations.filter(s => s.priority === 'OVERDUE');
  track(
    overdueScreenings.length >= 1,
    `Detected ${overdueScreenings.length} overdue screening(s)`
  );

  const diabetesScreening = result.screeningRecommendations.find(s => s.screening.toLowerCase().includes('diabetes') || s.screening.toLowerCase().includes('hba1c'));
  track(
    diabetesScreening !== undefined,
    `Diabetes screening recommended: ${diabetesScreening?.priority || 'NOT FOUND'}`
  );

  for (const s of result.screeningRecommendations.slice(0, 5)) {
    console.log(`    → [${s.priority}] ${s.screening} — ${s.suggestedFrequency}`);
  }
  if (result.screeningRecommendations.length > 5) {
    console.log(`    → ... and ${result.screeningRecommendations.length - 5} more`);
  }

  // ── TEST 2: Early Risk Detection ──
  console.log('\n[TEST 2] Early Risk Detection');
  track(
    result.emergingRisks.length >= 2,
    `Detected ${result.emergingRisks.length} emerging risk(s) (expected ≥2)`
  );

  const cvdRisk = result.emergingRisks.find(r => r.condition === 'Cardiovascular Disease');
  track(
    cvdRisk !== undefined && (cvdRisk.riskLevel === 'ELEVATED' || cvdRisk.riskLevel === 'HIGH'),
    `CVD risk: ${cvdRisk?.riskLevel || 'N/A'} (confidence: ${((cvdRisk?.confidence ?? 0) * 100).toFixed(1)}%)`
  );

  const diabetesRisk = result.emergingRisks.find(r => r.condition === 'Type 2 Diabetes');
  track(
    diabetesRisk !== undefined,
    `Diabetes risk detected: ${diabetesRisk?.riskLevel || 'N/A'} (${diabetesRisk?.contributingFactors.length ?? 0} contributing factors)`
  );

  for (const r of result.emergingRisks) {
    console.log(`    → [${r.riskLevel}] ${r.condition}: ${(r.confidence * 100).toFixed(1)}% — ${r.contributingFactors.slice(0, 2).join('; ')}...`);
  }

  // ── TEST 3: Preventive Health Score ──
  console.log('\n[TEST 3] Preventive Health Score');
  track(
    result.preventiveHealthScore.overallScore > 0 && result.preventiveHealthScore.overallScore <= 100,
    `Overall score: ${result.preventiveHealthScore.overallScore}/100 (Grade: ${result.preventiveHealthScore.grade})`
  );
  track(
    result.preventiveHealthScore.components.length >= 8,
    `Score components: ${result.preventiveHealthScore.components.length} factors evaluated`
  );
  track(
    result.preventiveHealthScore.weaknesses.length >= 2,
    `Weaknesses identified: ${result.preventiveHealthScore.weaknesses.join(', ')}`
  );
  track(
    result.preventiveHealthScore.topImprovementActions.length > 0,
    `Top improvement actions: ${result.preventiveHealthScore.topImprovementActions.length}`
  );

  for (const c of result.preventiveHealthScore.components) {
    const bar = '█'.repeat(Math.round(c.score / 10)) + '░'.repeat(10 - Math.round(c.score / 10));
    console.log(`    ${bar} ${c.score}/100 [${c.status}] ${c.factor}`);
  }

  // ── TEST 4: Lifestyle Recommendations ──
  console.log('\n[TEST 4] Lifestyle Recommendations');
  track(
    result.lifestyleRecommendations.length >= 4,
    `Generated ${result.lifestyleRecommendations.length} lifestyle recommendations (expected ≥4)`
  );

  const smokingRec = result.lifestyleRecommendations.find(l => l.domain === 'SMOKING_CESSATION');
  track(
    smokingRec !== undefined && smokingRec.priority === 'HIGH',
    `Smoking cessation recommended: ${smokingRec?.priority || 'N/A'}`
  );

  const exerciseRec = result.lifestyleRecommendations.find(l => l.domain === 'PHYSICAL_ACTIVITY');
  track(
    exerciseRec !== undefined,
    `Physical activity recommendation present: ${exerciseRec?.priority || 'N/A'}`
  );

  for (const l of result.lifestyleRecommendations.slice(0, 5)) {
    console.log(`    → [${l.priority}] ${l.domain}: ${l.recommendation.slice(0, 70)}...`);
  }

  // ── TEST 5: Predictive Trajectory ──
  console.log('\n[TEST 5] Predictive Health Trajectory');
  track(
    result.predictiveTrajectory.scenarios.length === 3,
    `Generated 3 scenarios: ${result.predictiveTrajectory.scenarios.map(s => s.scenario).join(', ')}`
  );

  const optimistic = result.predictiveTrajectory.scenarios.find(s => s.scenario === 'OPTIMISTIC');
  const expected = result.predictiveTrajectory.scenarios.find(s => s.scenario === 'EXPECTED');
  const highRisk = result.predictiveTrajectory.scenarios.find(s => s.scenario === 'HIGH_RISK');

  track(
    optimistic !== undefined && expected !== undefined && highRisk !== undefined,
    `All scenarios present with projected scores`
  );

  track(
    (optimistic?.projectedHealthScore ?? 0) > (highRisk?.projectedHealthScore ?? 100),
    `Optimistic (${optimistic?.projectedHealthScore}) > High-Risk (${highRisk?.projectedHealthScore}) scores are logically ordered`
  );

  for (const s of result.predictiveTrajectory.scenarios) {
    console.log(`    → [${s.scenario}] Score: ${s.projectedHealthScore}/100 (confidence: ${(s.confidence * 100).toFixed(0)}%) — ${s.description.slice(0, 60)}...`);
  }

  // ── TEST 6: Monitoring Alerts ──
  console.log('\n[TEST 6] Longitudinal Preventive Monitoring');
  track(
    result.monitoringAlerts.length >= 2,
    `Generated ${result.monitoringAlerts.length} monitoring alert(s) (expected ≥2)`
  );

  const smokingAlert = result.monitoringAlerts.find(a => a.alertType === 'RECURRING_PATTERN' && a.description.toLowerCase().includes('smoking'));
  track(
    smokingAlert !== undefined,
    `Active smoking pattern alert detected`
  );

  for (const a of result.monitoringAlerts) {
    console.log(`    → [${a.severity}] ${a.alertType}: ${a.description.slice(0, 70)}...`);
  }

  // ── TEST 7: Intervention Impact ──
  console.log('\n[TEST 7] Intervention Impact Estimation');
  track(
    result.interventionEstimates.length >= 4,
    `Generated ${result.interventionEstimates.length} intervention estimate(s) (expected ≥4)`
  );

  const smokingCessation = result.interventionEstimates.find(i => i.intervention.toLowerCase().includes('smoking'));
  track(
    smokingCessation !== undefined && smokingCessation.expectedScoreImprovement > 0,
    `Smoking cessation impact: +${smokingCessation?.expectedScoreImprovement} points`
  );

  for (const i of result.interventionEstimates.slice(0, 4)) {
    console.log(`    → +${i.expectedScoreImprovement} pts: ${i.intervention} (${i.timeToEffect})`);
  }

  // ── TEST 8: Population Analytics ──
  console.log('\n[TEST 8] Population Preventive Analytics');

  // Create a small population for testing
  const healthScore = hpphi.getHealthScoreEngine().compute(testPatient);
  const populationReport = hpphi.getPopulationEngine().analyze([
    { patient: testPatient, healthScore },
    { patient: { ...testPatient, patientId: 'pt-2', lifestyleFactors: { ...testPatient.lifestyleFactors, smokingStatus: 'NEVER', physicalActivityMinPerWeek: 200 } }, healthScore: { ...healthScore, overallScore: 78, components: healthScore.components, strengths: ['Physical Activity'], weaknesses: [], grade: 'B', topImprovementActions: [] } },
    { patient: { ...testPatient, patientId: 'pt-3' }, healthScore }
  ]);

  track(
    populationReport.totalPatients === 3,
    `Population size: ${populationReport.totalPatients} patients`
  );
  track(
    populationReport.commonPreventiveGaps.length > 0,
    `Common gaps identified: ${populationReport.commonPreventiveGaps.map(g => `${g.gap} (${g.percentAffected}%)`).slice(0, 3).join(', ')}`
  );
  track(
    populationReport.populationRiskTrends.length >= 3,
    `Population risk trends: ${populationReport.populationRiskTrends.length} metrics`
  );
  track(
    populationReport.interventionEffectiveness.length > 0,
    `Intervention effectiveness data: ${populationReport.interventionEffectiveness.length} interventions`
  );

  for (const trend of populationReport.populationRiskTrends) {
    console.log(`    → [${trend.trend}] ${trend.metric}: ${trend.value}`);
  }

  // ── TEST 9: End-to-End & Performance ──
  console.log('\n[TEST 9] End-to-End Workflow & Performance');
  track(
    result.evaluationId.startsWith('hpphi-'),
    `Evaluation ID format: ${result.evaluationId}`
  );
  track(
    result.telemetryPublished === true,
    `Telemetry published: ${result.telemetryPublished}`
  );
  track(
    result.latencyMs < 50,
    `HPPHI Latency: ${result.latencyMs}ms (target <50ms)`
  );
  track(
    result.explainabilityChain !== undefined && result.explainabilityChain.confidenceScore > 0,
    `HCKEP evidence chain: confidence ${(result.explainabilityChain.confidenceScore * 100).toFixed(1)}%`
  );

  const telemetry = hpphi.getTelemetry();
  track(
    telemetry.totalEvaluations >= 1,
    `Telemetry: ${telemetry.totalEvaluations} evaluations, avg ${telemetry.averageLatencyMs}ms`
  );

  // ── Summary ──
  console.log('\n================================================================');
  console.log(`Total HPPHI Tests: ${passed + failed} | PASSED: ${passed} (${((passed / (passed + failed)) * 100).toFixed(0)}%) | FAILED: ${failed}`);
  console.log('================================================================');

  if (failed > 0) {
    console.log('\n⚠ Some tests failed. Review output above.');
  } else {
    console.log('\n✓ ALL QUALITY GATES PASSED');
  }
}

runHPPHITestSuite().catch(console.error);
