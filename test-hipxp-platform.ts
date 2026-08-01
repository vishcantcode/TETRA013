// ============================================================================
// HIPXP – Intelligent Patient Experience Platform
// Comprehensive Automated Test Suite (STAGE 5 PHASE 21)
// ============================================================================

import { hipxp } from '../packages/hipxp/src';

function assert(condition: boolean, testName: string, details?: string): void {
  if (condition) {
    console.log(`  ✓ ${testName}`);
  } else {
    console.log(`  ✗ FAILED: ${testName}${details ? ' — ' + details : ''}`);
    process.exitCode = 1;
  }
}

async function runHIPXPTestSuite() {
  console.log('================================================================');
  console.log('HEALTHSENSE INTELLIGENT PATIENT EXPERIENCE PLATFORM (HIPXP)');
  console.log('COMPREHENSIVE AUTOMATED TEST SUITE (STAGE 5 PHASE 21)');
  console.log('================================================================');

  let passed = 0;
  let failed = 0;

  function track(condition: boolean, name: string, details?: string) {
    assert(condition, name, details);
    condition ? passed++ : failed++;
  }

  // ── Render Full Patient Session ──
  const startMs = performance.now();
  const result = hipxp.renderPatientSession('pt-hipxp-9001', 'What does my HbA1c test result mean?');
  const elapsed = performance.now() - startMs;

  console.log(`\nPatient ID: ${result.commandCenterView.patientId}`);
  console.log(`Patient Name: ${result.commandCenterView.patientName}`);
  console.log(`Total Session Latency: ${elapsed.toFixed(3)}ms`);

  // ── TEST 1: Personal Health Command Center ──
  console.log('\n[TEST 1] Personal Health Command Center');
  track(
    result.commandCenterView.patientName === 'Robert Smith' && result.commandCenterView.activeMedications.length >= 1,
    `Personal Health Command Center rendered active medications (${result.commandCenterView.activeMedications[0].name} ${result.commandCenterView.activeMedications[0].dosage})`
  );
  track(
    result.commandCenterView.preventiveRecommendations !== undefined && result.commandCenterView.healthSimulationSummary !== undefined,
    `Integrated HPPHI Preventive Recommendations & HCSOF Digital Twin Simulations`
  );

  // ── TEST 2: AI Health Companion ──
  console.log('\n[TEST 2] AI Health Companion');
  track(
    result.companionResponse.answerText.includes('HbA1c is a simple blood test') && result.companionResponse.simplifiedTerms.length > 0,
    `AI Companion translated HbA1c clinical term into plain language: ${result.companionResponse.simplifiedTerms[0].plainLanguageDefinition}`
  );
  track(
    result.companionResponse.suggestedFollowUpQuestions.length > 0,
    `AI Companion suggested ${result.companionResponse.suggestedFollowUpQuestions.length} follow-up questions`
  );

  // ── TEST 3: Personalized Health Journey ──
  console.log('\n[TEST 3] Personalized Health Journey');
  track(
    result.healthGoals.length >= 3 && result.healthGoals.some(g => g.category === 'BLOOD_PRESSURE'),
    `Retrieved ${result.healthGoals.length} dynamic health goals (Blood Pressure target: ${result.healthGoals[0].targetValue})`
  );

  // ── TEST 4: Remote Care Support Services ──
  console.log('\n[TEST 4] Remote Care Support Services');
  const remoteCare = hipxp.getRemoteCareServices();
  const vitalLog = remoteCare.logHomeVital('pt-hipxp-9001', 'Systolic BP', 134, 'mmHg');
  track(
    vitalLog.logId.startsWith('vtl-') && vitalLog.value === 134,
    `Logged home BP measurement: ${vitalLog.value} ${vitalLog.unit}`
  );

  const msg = remoteCare.sendMessage('pt-hipxp-9001', 'PATIENT', 'Hello Dr. Jenkins, I logged my morning blood pressure.');
  track(
    msg.messageId.startsWith('msg-') && msg.sender === 'PATIENT',
    `Sent secure patient message: ${msg.messageId}`
  );

  // ── TEST 5: Health Insights Dashboard ──
  console.log('\n[TEST 5] Health Insights Dashboard');
  track(
    result.healthInsights.headline.includes('5-Year Cardiovascular') && result.healthInsights.keyTakeaways.length > 0,
    `Generated patient-friendly Health Insights: ${result.healthInsights.headline}`
  );

  // ── TEST 6: Accessibility & Inclusivity Engine ──
  console.log('\n[TEST 6] Accessibility & Inclusivity Engine');
  track(
    result.accessibilityConfig.language === 'en' && result.accessibilityConfig.screenReaderOptimized === true,
    `Accessibility configured (Language: ${result.accessibilityConfig.language}, Screen Reader Optimized: ${result.accessibilityConfig.screenReaderOptimized})`
  );

  // ── TEST 7: Engagement & Gamification Engine ──
  console.log('\n[TEST 7] Engagement & Gamification Engine');
  track(
    result.achievements.length >= 3 && result.achievements[0].badgeName === 'Medication Master',
    `Retrieved patient achievements (${result.achievements.length} badges unlocked: ${result.achievements[0].badgeName})`
  );

  // ── TEST 8: End-to-End Workflow & Performance ──
  console.log('\n[TEST 8] End-to-End Workflow & Performance');
  track(
    result.telemetryPublished === true,
    `Telemetry published to HOIP: ${result.telemetryPublished}`
  );
  track(
    result.latencyMs < 50,
    `HIPXP Processing Latency: ${result.latencyMs}ms (target <50ms)`
  );

  const telemetry = hipxp.getTelemetry();
  track(
    telemetry.totalPatientSessions >= 1,
    `HOIP Telemetry: ${telemetry.totalPatientSessions} patient sessions processed, avg ${telemetry.averageLatencyMs}ms`
  );

  // ── Summary ──
  console.log('\n================================================================');
  console.log(
    `Total HIPXP Tests: ${passed + failed} | PASSED: ${passed} (${(
      (passed / (passed + failed)) *
      100
    ).toFixed(0)}%) | FAILED: ${failed}`
  );
  console.log('================================================================');

  if (failed > 0) {
    console.log('\n⚠ Some tests failed. Review output above.');
  } else {
    console.log('\n✓ ALL QUALITY GATES PASSED — STAGE 5 PHASE 21 COMPLETE');
  }
}

runHIPXPTestSuite().catch(console.error);
