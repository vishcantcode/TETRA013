import { hpie, HPIE_CURRENT_VERSION } from '../packages/hpie/src';
import { huse } from '../packages/huse/src';
import { createHIEKContext } from '../packages/hiek/src';

async function runHPIETestSuite() {
  console.log('================================================================');
  console.log('HEALTHSENSE BACKEND EXCELLENCE: HPIE ENGINE TEST SUITE');
  console.log('================================================================\n');

  const tests: { name: string; success: boolean; details?: string }[] = [];

  const record = (name: string, success: boolean, details?: string) => {
    tests.push({ name, success, details });
    const symbol = success ? '✓ [PASS]' : '✗ [FAIL]';
    console.log(`${symbol} ${name}${details ? ` -> ${details}` : ''}`);
  };

  try {
    const patientCtx = createHIEKContext({
      user: { id: 'usr-pat-01', email: 'patient@healthsense.ai', role: 'patient' },
      patientId: 'usr-pat-01'
    });

    const adminCtx = createHIEKContext({
      user: { id: 'usr-adm-01', email: 'admin@healthsense.ai', role: 'admin' },
      patientId: 'usr-adm-01'
    });

    // TEST 1: RBAC Policy Enforcement (ALLOW vs DENY)
    const allowRes = await hpie.evaluate(adminCtx, { requiredRole: 'admin' });
    const denyRes = await hpie.evaluate(patientCtx, { requiredRole: 'admin' });

    const isRbacWorking = allowRes.decisionOutcome === 'ALLOW' && denyRes.decisionOutcome === 'DENY';
    record('HPIE RBAC Security Policy Governance', isRbacWorking, `Admin Role: ${allowRes.decisionOutcome}, Patient Role on Admin Endpoint: ${denyRes.decisionOutcome}`);

    // TEST 2: Clinical Confidence Threshold Governance (REQUIRES_APPROVAL)
    const lowConfidenceRes = await hpie.evaluate(patientCtx, { confidenceScore: 0.72 });
    const highConfidenceRes = await hpie.evaluate(patientCtx, { confidenceScore: 0.94 });

    const isConfidenceWorking = 
      lowConfidenceRes.decisionOutcome === 'REQUIRES_APPROVAL' &&
      highConfidenceRes.decisionOutcome === 'ALLOW';

    record('HPIE Clinical Confidence Governance', isConfidenceWorking, `Score 72%: ${lowConfidenceRes.decisionOutcome} (${lowConfidenceRes.warnings[0]}), Score 94%: ${highConfidenceRes.decisionOutcome}`);

    // TEST 3: Policy Versioning & Traceability
    record('HPIE Policy Versioning Traceability', allowRes.policyVersion === HPIE_CURRENT_VERSION && allowRes.matchedPolicies.includes('SECURITY_RBAC_POLICY'), `Evaluated Policy Version: ${allowRes.policyVersion}`);

    // TEST 4: Quad-Platform Joint Execution (HUSE -> HPIE -> AIR -> HIEK)
    const quadRes = await huse.executeStatefulWorkflow({
      entityType: 'DECISION',
      entityId: 'dec-888',
      workflowName: 'ClinicalDecisionSynthesisWorkflow',
      requiredRole: 'patient',
      confidenceScore: 0.78,
      context: patientCtx,
      handler: async () => ({ decisionId: 'dec-888', draftText: 'Initiate hypertension monitoring' })
    });

    const isQuadWorking = 
      quadRes.status === 'COMPLETED' &&
      quadRes.policyEvaluation?.decisionOutcome === 'REQUIRES_APPROVAL' &&
      quadRes.requiresHumanApproval === true &&
      quadRes.routingDecision.strategy !== undefined;

    record('HPIE Quad-Platform Joint Cohesive Execution (HUSE+HPIE+AIR+HIEK)', isQuadWorking, `Outcome: ${quadRes.policyEvaluation?.decisionOutcome}, Requires Clinician Approval: ${quadRes.requiresHumanApproval}`);

    // TEST 5: HPIE Policy Evaluation Overhead Benchmark (< 0.2ms Target)
    const benchStart = performance.now();
    const ITERATIONS = 500;
    for (let i = 0; i < ITERATIONS; i++) {
      await hpie.evaluate(patientCtx, { requiredRole: 'patient', confidenceScore: 0.95 });
    }
    const avgHpieMs = (performance.now() - benchStart) / ITERATIONS;
    record('HPIE Policy Evaluation Overhead Benchmark (< 0.2ms Target)', avgHpieMs < 0.2, `Average HPIE Evaluation Time: ${avgHpieMs.toFixed(3)}ms`);

  } catch (err: any) {
    console.error('[HPIE Suite Exception]', err);
    record('HPIE Engine Suite Execution', false, err.message);
  } finally {
    console.log('\n================================================================');
    console.log('HPIE ENGINE ACCEPTANCE SUMMARY');
    console.log('================================================================');
    const passed = tests.filter(t => t.success).length;
    const failed = tests.filter(t => !t.success).length;
    console.log(`Total HPIE Engine Tests: ${tests.length}`);
    console.log(`PASSED: ${passed}`);
    console.log(`FAILED: ${failed}`);

    if (failed > 0) {
      console.error('\nHPIE ENGINE SUITE FAILED!');
      process.exit(1);
    } else {
      console.log('\n★ ALL HPIE ENGINE TESTS PASSED 100% SUCCESSFULLY! ★');
      process.exit(0);
    }
  }
}

runHPIETestSuite();
