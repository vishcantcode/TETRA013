import { hiek, createHIEKContext, HIEKEventBus, HIEKReplayEngine, HIEKPolicyRunner } from '../packages/hiek/src';

async function runHIEKTestSuite() {
  console.log('================================================================');
  console.log('HEALTHSENSE BACKEND EXCELLENCE: HIEK KERNEL TEST SUITE');
  console.log('================================================================\n');

  const tests: { name: string; success: boolean; details?: string }[] = [];

  const record = (name: string, success: boolean, details?: string) => {
    tests.push({ name, success, details });
    const symbol = success ? '✓ [PASS]' : '✗ [FAIL]';
    console.log(`${symbol} ${name}${details ? ` -> ${details}` : ''}`);
  };

  try {
    // TEST 1: Context Creation & Propagation
    const ctx = createHIEKContext({
      user: { id: 'usr-001', email: 'clinician@healthsense.ai', role: 'clinician' },
      patientId: 'pat-999',
      tenantId: 'facility-alpha'
    });

    record('HIEK Context Propagation', !!ctx.executionId && ctx.tenantId === 'facility-alpha' && ctx.user?.role === 'clinician', `Execution ID: ${ctx.executionId}`);

    // TEST 2: Kernel Execution & Lifecycle Tracking
    const execRes = await hiek.execute({
      workflowName: 'TestClinicalWorkflow',
      context: ctx,
      input: { testVal: 42 },
      handler: async (input, c) => {
        return { processed: true, inputVal: input.testVal, caller: c.user?.email };
      }
    });

    const isCompleted = execRes.status === 'COMPLETED';
    const hasHistory = execRes.lifecycleHistory.length >= 3;
    record('HIEK Execution Lifecycle & State Machine', isCompleted && hasHistory, `Status: ${execRes.status}, Lifecycle States: ${execRes.lifecycleHistory.map(h => h.state).join(' -> ')}`);

    // TEST 3: Domain Event Publication & Event Bus Subscription
    let eventReceived = false;
    const bus = HIEKEventBus.getInstance();
    bus.subscribe('AssessmentCompleted', (evt) => {
      if (evt.executionId === ctx.executionId) {
        eventReceived = true;
      }
    });

    await hiek.execute({
      workflowName: 'AssessmentEventWorkflow',
      context: ctx,
      input: {},
      eventTypeOnSuccess: 'AssessmentCompleted',
      handler: async () => ({ score: 98 })
    });

    record('HIEK Domain Event Publication & Subscriptions', eventReceived, 'Event "AssessmentCompleted" received on EventBus');

    // TEST 4: Execution Policy Retry Strategy
    let attemptCount = 0;
    const policyResult = await HIEKPolicyRunner.executeWithPolicy(
      async () => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('Simulated transient failure');
        }
        return 'success_after_retry';
      },
      { maxRetries: 3, initialBackoffMs: 10 }
    );

    record('HIEK Execution Policy Retries & Exponential Backoff', policyResult.result === 'success_after_retry' && policyResult.attempts === 3, `Succeeded on attempt ${policyResult.attempts}`);

    // TEST 5: Deterministic Replay Engine
    const replayRes = await HIEKReplayEngine.replayExecution(execRes.executionId, { dryRun: true });
    record('HIEK Deterministic Replay Engine (Dry-Run)', replayRes.success && replayRes.dryRun, `Replayed ${replayRes.replayedEventsCount} trace logs without mutating state`);

    // TEST 6: Kernel Latency & Overhead Benchmark (< 2ms Target)
    const benchStart = Date.now();
    for (let i = 0; i < 50; i++) {
      await hiek.execute({
        workflowName: 'BenchmarkWorkflow',
        context: ctx,
        input: { i },
        handler: async (inp) => inp.i * 2
      });
    }
    const avgKernelMs = (Date.now() - benchStart) / 50;
    record('HIEK Kernel Overhead Benchmark (< 2ms Target)', avgKernelMs < 2, `Average Kernel Execution Time: ${avgKernelMs.toFixed(2)}ms`);

  } catch (err: any) {
    console.error('[HIEK Suite Exception]', err);
    record('HIEK Execution Suite', false, err.message);
  } finally {
    console.log('\n================================================================');
    console.log('HIEK KERNEL ACCEPTANCE SUMMARY');
    console.log('================================================================');
    const passed = tests.filter(t => t.success).length;
    const failed = tests.filter(t => !t.success).length;
    console.log(`Total HIEK Kernel Tests: ${tests.length}`);
    console.log(`PASSED: ${passed}`);
    console.log(`FAILED: ${failed}`);

    if (failed > 0) {
      console.error('\nHIEK KERNEL SUITE FAILED!');
      process.exit(1);
    } else {
      console.log('\n★ ALL HIEK KERNEL TESTS PASSED 100% SUCCESSFULLY! ★');
      process.exit(0);
    }
  }
}

runHIEKTestSuite();
