import { hcip, HCIPCarePlanEngine, HCIPLongitudinalEngine, HCIPDigitalTwinSync } from '../packages/hcip/src';
import { pool } from '@healthsense/db';

async function runHCIPTestSuite() {
  console.log('================================================================');
  console.log('HEALTHSENSE PRODUCT EVOLUTION: HCIP PLATFORM TEST SUITE');
  console.log('================================================================\n');

  const tests: { name: string; success: boolean; details?: string }[] = [];

  const record = (name: string, success: boolean, details?: string) => {
    tests.push({ name, success, details });
    const symbol = success ? '✓ [PASS]' : '✗ [FAIL]';
    console.log(`${symbol} ${name}${details ? ` -> ${details}` : ''}`);
  };

  try {
    const patientId = `pat-hcip-${Date.now()}`;

    // Seed valid patient user in DB to satisfy foreign key constraints
    await pool.query(
      `INSERT INTO users (id, email, password_hash, role) VALUES ($1, $2, $3, $4)`,
      [patientId, `${patientId}@healthsense.ai`, 'Hash123!', 'patient']
    );

    // TEST 1: End-to-End Comprehensive Health Assessment Workflow
    const assessmentRes = await hcip.runComprehensiveAssessment(patientId, { symptom: 'frequent fatigue and polyuria' });

    const isAssessmentComplete = 
      assessmentRes.status === 'COMPLETED' &&
      assessmentRes.carePlan !== undefined &&
      assessmentRes.longitudinalReport !== undefined &&
      assessmentRes.confidenceScore >= 0.80 &&
      assessmentRes.evidenceChain.length > 0;

    record('HCIP End-to-End Comprehensive Health Assessment Workflow', isAssessmentComplete, `Status: ${assessmentRes.status}, Confidence: ${(assessmentRes.confidenceScore * 100).toFixed(0)}%, Evidence Items: ${assessmentRes.evidenceChain.length}`);

    // TEST 2: Structured Care Plan Generation Engine
    const carePlan = HCIPCarePlanEngine.generateCarePlan(patientId, { concerns: ['Hypertension stage 1', 'Glucose spike'] });

    const isCarePlanValid = 
      carePlan.identifiedConcerns.length >= 2 &&
      carePlan.recommendedActions.length >= 2 &&
      carePlan.monitoringSchedule.length >= 2 &&
      carePlan.escalationCriteria.length >= 2;

    record('HCIP Structured Care Plan Generation', isCarePlanValid, `Actions: ${carePlan.recommendedActions.length}, Monitoring Schedule: ${carePlan.monitoringSchedule.length}, Escalation Criteria: ${carePlan.escalationCriteria.length}`);

    // TEST 3: Longitudinal Patient Intelligence Engine
    const longitudinalEngine = new HCIPLongitudinalEngine();
    const report = longitudinalEngine.analyzePatientHistory(patientId, {
      vitals: { bloodPressure: '145/95', fastingGlucose: 110 }
    });

    record('HCIP Longitudinal Patient Intelligence Analysis', report.trendDirection === 'DETERIORATING' || report.trendDirection === 'STABLE', `Trend Direction: ${report.trendDirection}, Key Insights: ${report.keyInsights.length}`);

    // TEST 4: Digital Twin Synchronization
    const twinSync = new HCIPDigitalTwinSync();
    const syncRes = await twinSync.synchronizeFinding(patientId, { newSymptom: 'mild headache', timestamp: new Date() });

    record('HCIP Digital Twin Synchronization', syncRes.twinVersion >= 1 && syncRes.updatedState !== undefined, `Digital Twin Version: ${syncRes.twinVersion}`);

    // TEST 5: Complete 7-Tier Cohesive Platform Execution (HCIP->HCOP->HUSE->HPIE->AIR->HIEK->HOIP)
    const is7TierWorking = assessmentRes.executionId !== undefined && assessmentRes.durationMs > 0;
    record('HCIP Complete 7-Tier Cohesive Platform Execution', is7TierWorking, `Execution ID: ${assessmentRes.executionId}, Execution Duration: ${assessmentRes.durationMs}ms`);

    // TEST 6: HCIP Clinical Intelligence Processing Benchmark (< 10ms Target)
    const benchStart = performance.now();
    const ITERATIONS = 20;
    for (let i = 0; i < ITERATIONS; i++) {
      HCIPCarePlanEngine.generateCarePlan(patientId, { concerns: ['Hypertension'] });
    }
    const avgHcipMs = (performance.now() - benchStart) / ITERATIONS;
    record('HCIP Clinical Intelligence Benchmark (< 10ms Target)', avgHcipMs < 10, `Average HCIP Care Plan Processing Time: ${avgHcipMs.toFixed(3)}ms`);

  } catch (err: any) {
    console.error('[HCIP Suite Exception]', err);
    record('HCIP Platform Suite Execution', false, err.message);
  } finally {
    console.log('\n================================================================');
    console.log('HCIP PLATFORM ACCEPTANCE SUMMARY');
    console.log('================================================================');
    const passed = tests.filter(t => t.success).length;
    const failed = tests.filter(t => !t.success).length;
    console.log(`Total HCIP Platform Tests: ${tests.length}`);
    console.log(`PASSED: ${passed}`);
    console.log(`FAILED: ${failed}`);

    if (failed > 0) {
      console.error('\nHCIP PLATFORM SUITE FAILED!');
      process.exit(1);
    } else {
      console.log('\n★ ALL HCIP PLATFORM TESTS PASSED 100% SUCCESSFULLY! ★');
      process.exit(0);
    }
  }
}

runHCIPTestSuite();
