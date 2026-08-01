// ============================================================================
// HCSOF – Clinical Simulation & Outcome Forecasting Platform
// Comprehensive Automated Test Suite
// ============================================================================

import { hcsof } from '../packages/hcsof/src';
import { HPPMCareProfileEngine } from '../packages/hppm/src/care-profile';

// Build a test patient profile via HPPM
const careProfileEngine = new HPPMCareProfileEngine();
const testProfile = careProfileEngine.buildProfile({
  patientId: 'pt-hcsof-5001',
  demographics: { age: 64, sex: 'M' },
  chronicConditions: ['Essential Hypertension', 'Type 2 Diabetes', 'CKD Stage 3a'],
  allergies: ['Penicillin'],
  currentMedications: ['Lisinopril 20mg', 'Metformin 1000mg', 'Simvastatin 20mg'],
  lifestyleSnapshot: {
    smokingStatus: 'FORMER',
    physicalActivityMinPerWeek: 80,
    sleepHoursPerNight: 6.2,
    dietQuality: 'FAIR',
  },
  adherenceHistory: {
    medicationAdherencePercent: 75,
    appointmentAdherencePercent: 85,
    screeningAdherencePercent: 70,
    lifestyleAdherencePercent: 55,
  },
  preferences: {
    preferGeneric: true,
    avoidInjections: true,
    preferOnceDailyDosing: true,
    dietaryPreference: 'NONE',
    exercisePreference: 'LOW_IMPACT',
    communicationPreference: 'EITHER',
  },
  vitalSigns: [
    { metric: 'Systolic BP', value: 144, unit: 'mmHg' },
    { metric: 'Diastolic BP', value: 88, unit: 'mmHg' },
  ],
  laboratoryResults: [
    { test: 'HbA1c', value: 7.8, unit: '%' },
    { test: 'LDL', value: 135, unit: 'mg/dL' },
    { test: 'BMI', value: 29.2, unit: 'kg/m²' },
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

async function runHCSOFTestSuite() {
  console.log('================================================================');
  console.log('HEALTHSENSE CLINICAL SIMULATION & OUTCOME FORECASTING (HCSOF)');
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
  const result = hcsof.simulatePatient(testProfile);
  const elapsed = performance.now() - startMs;

  console.log(`\nEvaluation ID: ${result.evaluationId}`);
  console.log(`Patient ID: ${result.patientId}`);
  console.log(`Total Latency: ${elapsed.toFixed(3)}ms`);

  // ── TEST 1: Digital Twin State Isolation ──
  console.log('\n[TEST 1] Digital Twin State Isolation');
  track(
    result.baseDigitalTwin.isIsolated === true,
    `Digital Twin isIsolated guard: ${result.baseDigitalTwin.isIsolated}`
  );
  track(
    result.baseDigitalTwin.simulatedVitals.length >= 2,
    `Digital Twin snapshot vitals: ${result.baseDigitalTwin.simulatedVitals.length} metrics`
  );
  track(
    testProfile.vitalSigns[0].value === 144,
    `Real patient record preserved (original Sys BP: ${testProfile.vitalSigns[0].value} mmHg)`
  );

  // ── TEST 2: Multi-Strategy Simulation ──
  console.log('\n[TEST 2] Multi-Strategy Simulation');
  track(
    result.simulatedStrategies.length >= 2,
    `Simulated ${result.simulatedStrategies.length} comparative care strategies`
  );
  const stratA = result.simulatedStrategies[0];
  track(
    stratA.forecasts.length === 3,
    `Strategy A scenarios generated: ${stratA.forecasts.map(f => f.scenario).join(', ')}`
  );
  track(
    stratA.patientSuitabilityScore > 0,
    `Strategy A suitability score: ${stratA.patientSuitabilityScore}/100`
  );

  for (const strat of result.simulatedStrategies) {
    const expected = strat.forecasts.find(f => f.scenario === 'EXPECTED');
    console.log(`    → [${strat.strategyName.slice(0, 45)}...] Suitability: ${strat.patientSuitabilityScore}/100 | Exp BP: ${expected?.predictedBpSystolic} mmHg, HbA1c: ${expected?.predictedHbA1c}%`);
  }

  // ── TEST 3: Outcome Forecasting ──
  console.log('\n[TEST 3] Outcome Forecasting (Scenarios)');
  const opt = stratA.forecasts.find(f => f.scenario === 'OPTIMISTIC');
  const exp = stratA.forecasts.find(f => f.scenario === 'EXPECTED');
  const cons = stratA.forecasts.find(f => f.scenario === 'CONSERVATIVE');

  track(
    opt !== undefined && exp !== undefined && cons !== undefined,
    `All 3 scenarios (Optimistic/Expected/Conservative) generated`
  );
  track(
    (opt?.predictedBpSystolic ?? 0) < (cons?.predictedBpSystolic ?? 200),
    `Optimistic BP (${opt?.predictedBpSystolic}) < Conservative BP (${cons?.predictedBpSystolic}) logically ordered`
  );
  track(
    exp?.uncertaintyDescription !== undefined && exp.uncertaintyDescription.length > 0,
    `Uncertainty documented: "${exp?.uncertaintyDescription.slice(0, 50)}..."`
  );

  // ── TEST 4: Timeline Forecasting ──
  console.log('\n[TEST 4] Timeline Forecasting');
  track(
    stratA.timeline.milestones.length === 4,
    `Generated ${stratA.timeline.milestones.length} milestones (30d, 90d, 6m, 12m)`
  );
  for (const m of stratA.timeline.milestones) {
    console.log(`    → [${m.timeframe}] ${m.label}: ${m.recommendedClinicalActions[0]}`);
  }

  // ── TEST 5: What-If Analysis Engine ──
  console.log('\n[TEST 5] What-If Analysis Engine');
  track(
    result.whatIfScenarios.length >= 3,
    `Ran ${result.whatIfScenarios.length} what-if scenarios`
  );

  const adherenceWhatIf = result.whatIfScenarios.find(w => w.scenarioName.includes('Adherence'));
  track(
    adherenceWhatIf !== undefined && adherenceWhatIf.predictedImpact.bpChangeSystolic < 0,
    `Adherence scenario impact: Sys BP ${adherenceWhatIf?.predictedImpact.bpChangeSystolic} mmHg, score delta +${adherenceWhatIf?.predictedImpact.overallScoreDelta}`
  );

  for (const w of result.whatIfScenarios) {
    console.log(`    → [${w.scenarioName}] BP: ${w.predictedImpact.bpChangeSystolic} mmHg, HbA1c: ${w.predictedImpact.hba1cChangePercent}%, Score Δ: ${w.predictedImpact.overallScoreDelta}`);
  }

  // ── TEST 6: Risk Comparison Dashboard Backend ──
  console.log('\n[TEST 6] Risk Comparison Dashboard Backend');
  track(
    result.dashboardComparison.strategiesCompared.length >= 2,
    `Dashboard contains ${result.dashboardComparison.strategiesCompared.length} strategies side-by-side`
  );
  track(
    result.dashboardComparison.recommendedStrategyId.length > 0,
    `Recommended strategy ID: ${result.dashboardComparison.recommendedStrategyId}`
  );
  track(
    result.dashboardComparison.tradeOffSummary.length >= 2,
    `Trade-off summary items: ${result.dashboardComparison.tradeOffSummary.length}`
  );

  // ── TEST 7: Explainability & Evidence Chain ──
  console.log('\n[TEST 7] Explainability & Evidence Chain');
  track(
    result.explainabilityChain !== undefined && result.explainabilityChain.confidenceScore > 0,
    `HCKEP evidence chain generated: ${(result.explainabilityChain.confidenceScore * 100).toFixed(1)}% confidence`
  );

  // ── TEST 8: End-to-End & Performance ──
  console.log('\n[TEST 8] End-to-End Workflow & Performance');
  track(
    result.evaluationId.startsWith('hcsof-'),
    `Evaluation ID format: ${result.evaluationId}`
  );
  track(
    result.telemetryPublished === true,
    `Telemetry published: ${result.telemetryPublished}`
  );
  track(
    result.latencyMs < 50,
    `HCSOF Latency: ${result.latencyMs}ms (target <50ms)`
  );

  const telemetry = hcsof.getTelemetry();
  track(
    telemetry.totalSimulations >= 1,
    `Telemetry: ${telemetry.totalSimulations} simulations, avg ${telemetry.averageLatencyMs}ms`
  );

  // ── Summary ──
  console.log('\n================================================================');
  console.log(
    `Total HCSOF Tests: ${passed + failed} | PASSED: ${passed} (${(
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

runHCSOFTestSuite().catch(console.error);
