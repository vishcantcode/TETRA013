import { huse, HUSETransitionEngine } from '../packages/huse/src';
import { createHIEKContext } from '../packages/hiek/src';

async function runHUSETestSuite() {
  console.log('================================================================');
  console.log('HEALTHSENSE BACKEND EXCELLENCE: HUSE ENGINE TEST SUITE');
  console.log('================================================================\n');

  const tests: { name: string; success: boolean; details?: string }[] = [];

  const record = (name: string, success: boolean, details?: string) => {
    tests.push({ name, success, details });
    const symbol = success ? '✓ [PASS]' : '✗ [FAIL]';
    console.log(`${symbol} ${name}${details ? ` -> ${details}` : ''}`);
  };

  try {
    const engine = HUSETransitionEngine.getInstance();
    const ctx = createHIEKContext({
      user: { id: 'usr-huse-01', email: 'huse.test@healthsense.ai', role: 'clinician' },
      patientId: 'pat-huse-01'
    });

    // TEST 1: Valid State Transition Execution
    const assessmentId = 'asm-101';
    const transition1 = await engine.transition({
      entityType: 'ASSESSMENT',
      entityId: assessmentId,
      initialState: 'INITIALIZED',
      toState: 'IN_PROGRESS',
      context: ctx,
      reason: 'Patient initiated triage questionnaire'
    });

    const isStateUpdated = engine.getCurrentState('ASSESSMENT', assessmentId) === 'IN_PROGRESS';
    record('HUSE Valid State Transition Execution', isStateUpdated && transition1.fromState === 'INITIALIZED' && transition1.toState === 'IN_PROGRESS', `Assessment State: ${transition1.fromState} -> ${transition1.toState}`);

    // TEST 2: Invalid State Transition Rejection
    let errorCaught = false;
    let errorMessage = '';
    try {
      const invalidEntityId = 'asm-invalid-999';
      await engine.transition({
        entityType: 'ASSESSMENT',
        entityId: invalidEntityId,
        initialState: 'COMPLETED',
        toState: 'IN_PROGRESS',
        context: ctx
      });
    } catch (err: any) {
      errorCaught = true;
      errorMessage = err.message;
    }

    record('HUSE Invalid State Transition Rejection', errorCaught && errorMessage.includes('Cannot transition from'), `Error: ${errorMessage.substring(0, 60)}...`);

    // TEST 3: Stateful Workflow Execution (HUSE + AIR + HIEK Cohesive Platform)
    const workflowRes = await huse.executeStatefulWorkflow({
      entityType: 'CLINICAL_WORKFLOW',
      entityId: 'wf-999',
      workflowName: 'PreventiveRiskProfileWorkflow',
      initialState: 'CREATED',
      completedState: 'COMPLETED',
      context: ctx,
      handler: async () => ({ riskProfileScore: 12 })
    });

    const isCohesiveWorking = 
      workflowRes.status === 'COMPLETED' &&
      workflowRes.currentState === 'COMPLETED' &&
      workflowRes.routingDecision.strategy !== undefined &&
      workflowRes.executionId !== undefined;

    record('HUSE + AIR + HIEK Joint Cohesive Platform Execution', isCohesiveWorking, `Status: ${workflowRes.status}, Current State: ${workflowRes.currentState}, Strategy: ${workflowRes.routingDecision.strategy}`);

    // TEST 4: Transition History Audit & Inspection
    const history = engine.getHistory('ASSESSMENT', assessmentId);
    record('HUSE State Transition History Audit', history.length >= 1 && history[0].entityId === assessmentId, `History Entries: ${history.length}, Actor: ${history[0].actorId}`);

    // TEST 5: HUSE Transition Engine Overhead Benchmark (< 0.5ms Target)
    const benchStart = performance.now();
    const ITERATIONS = 500;
    for (let i = 0; i < ITERATIONS; i++) {
      const eId = `test-ent-${i}`;
      await engine.transition({
        entityType: 'NOTIFICATION',
        entityId: eId,
        initialState: 'QUEUED',
        toState: 'SENDING'
      });
    }
    const avgHuseMs = (performance.now() - benchStart) / ITERATIONS;
    record('HUSE State Transition Overhead Benchmark (< 0.5ms Target)', avgHuseMs < 0.5, `Average HUSE Transition Time: ${avgHuseMs.toFixed(3)}ms`);

  } catch (err: any) {
    console.error('[HUSE Suite Exception]', err);
    record('HUSE Engine Suite Execution', false, err.message);
  } finally {
    console.log('\n================================================================');
    console.log('HUSE ENGINE ACCEPTANCE SUMMARY');
    console.log('================================================================');
    const passed = tests.filter(t => t.success).length;
    const failed = tests.filter(t => !t.success).length;
    console.log(`Total HUSE Engine Tests: ${tests.length}`);
    console.log(`PASSED: ${passed}`);
    console.log(`FAILED: ${failed}`);

    if (failed > 0) {
      console.error('\nHUSE ENGINE SUITE FAILED!');
      process.exit(1);
    } else {
      console.log('\n★ ALL HUSE ENGINE TESTS PASSED 100% SUCCESSFULLY! ★');
      process.exit(0);
    }
  }
}

runHUSETestSuite();
