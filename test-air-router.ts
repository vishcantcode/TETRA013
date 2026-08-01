import { air, AIRClassifier, AIRClinicalCache } from '../packages/air/src';
import { createHIEKContext } from '../packages/hiek/src';

async function runAIRTestSuite() {
  console.log('================================================================');
  console.log('HEALTHSENSE BACKEND EXCELLENCE: AIR ROUTER TEST SUITE');
  console.log('================================================================\n');

  const tests: { name: string; success: boolean; details?: string }[] = [];

  const record = (name: string, success: boolean, details?: string) => {
    tests.push({ name, success, details });
    const symbol = success ? '✓ [PASS]' : '✗ [FAIL]';
    console.log(`${symbol} ${name}${details ? ` -> ${details}` : ''}`);
  };

  try {
    // TEST 1: Request Intent Classification
    const triageClass = AIRClassifier.classify('SymptomTriageWorkflow');
    const prevClass = AIRClassifier.classify('PreventiveRiskProfileWorkflow');
    const authClass = AIRClassifier.classify('UserLoginWorkflow');

    const isClassificationCorrect = 
      triageClass.category === 'CLINICAL_REASONING' && triageClass.requiresAI &&
      prevClass.category === 'PREVENTIVE_INTELLIGENCE' && prevClass.isCacheable &&
      authClass.category === 'AUTHENTICATION' && authClass.priority === 'CRITICAL';

    record('AIR Intent & Complexity Classification', isClassificationCorrect, `Triage: ${triageClass.category} (AI: ${triageClass.requiresAI}), Preventive: ${prevClass.category} (Cacheable: ${prevClass.isCacheable})`);

    // TEST 2: AI-Assisted Strategy Routing via HIEK
    const ctx = createHIEKContext({
      user: { id: 'pat-air-01', email: 'air.test@healthsense.ai', role: 'patient' },
      patientId: 'pat-air-01'
    });

    const aiRes = await air.routeAndExecute({
      workflowName: 'SymptomTriageWorkflow',
      context: ctx,
      input: { symptom: 'fever' },
      handler: async (inp) => ({ triageDecision: 'Schedule Virtual Consult', symptom: inp.symptom })
    });

    record('AIR AI-Assisted Strategy Execution', aiRes.status === 'COMPLETED' && aiRes.routingDecision.strategy === 'AI_ASSISTED', `Strategy: ${aiRes.routingDecision.strategy}, Rationale: ${aiRes.routingDecision.rationale.substring(0, 45)}...`);

    // TEST 3: Clinical Cache Engine & Latency Savings (Miss -> Hit)
    const cacheTestWorkflow = 'PreventiveRiskProfileWorkflow';
    air.getCache().clear(); // Start fresh

    // Call 1: Cache Miss
    const call1 = await air.routeAndExecute({
      workflowName: cacheTestWorkflow,
      context: ctx,
      ttlSeconds: 60,
      handler: async () => {
        // Simulating heavy risk calculation
        await new Promise(r => setTimeout(r, 20));
        return { riskScore: 15, factors: ['smoking'] };
      }
    });

    // Call 2: Cache Hit
    const call2 = await air.routeAndExecute({
      workflowName: cacheTestWorkflow,
      context: ctx,
      ttlSeconds: 60,
      handler: async () => {
        throw new Error('Handler should NOT be called on Cache Hit!');
      }
    });

    const isCacheWorking = 
      call1.routingDecision.cacheHit === false &&
      call2.routingDecision.cacheHit === true &&
      call2.routingDecision.strategy === 'CACHED' &&
      call2.durationMs < call1.durationMs;

    record('AIR Clinical Cache & Latency Optimization', isCacheWorking, `Call 1 (Miss): ${call1.durationMs}ms -> Call 2 (Hit): ${call2.durationMs}ms (Saved ~${call2.routingDecision.estimatedLatencySavingMs}ms)`);

    // TEST 4: Patient Cache Invalidation
    air.getCache().invalidatePatient('pat-air-01');
    const postInvalidateCall = await air.routeAndExecute({
      workflowName: cacheTestWorkflow,
      context: ctx,
      ttlSeconds: 60,
      handler: async () => ({ riskScore: 25, factors: ['smoking', 'hypertension'] })
    });

    record('AIR Patient Cache Invalidation', postInvalidateCall.routingDecision.cacheHit === false, 'Cache invalidated on state mutation');

    // TEST 5: AIR Routing Overhead Benchmark (< 1ms Target)
    const benchStart = Date.now();
    for (let i = 0; i < 50; i++) {
      await air.routeAndExecute({
        workflowName: 'FastDirectWorkflow',
        context: ctx,
        input: { i },
        handler: async (inp) => inp.i * 10
      });
    }
    const avgAirMs = (Date.now() - benchStart) / 50;
    record('AIR Routing Overhead Benchmark (< 1ms Target)', avgAirMs < 1, `Average AIR Routing Execution Time: ${avgAirMs.toFixed(2)}ms`);

  } catch (err: any) {
    console.error('[AIR Suite Exception]', err);
    record('AIR Router Suite Execution', false, err.message);
  } finally {
    console.log('\n================================================================');
    console.log('AIR ROUTER ACCEPTANCE SUMMARY');
    console.log('================================================================');
    const passed = tests.filter(t => t.success).length;
    const failed = tests.filter(t => !t.success).length;
    console.log(`Total AIR Router Tests: ${tests.length}`);
    console.log(`PASSED: ${passed}`);
    console.log(`FAILED: ${failed}`);

    if (failed > 0) {
      console.error('\nAIR ROUTER SUITE FAILED!');
      process.exit(1);
    } else {
      console.log('\n★ ALL AIR ROUTER TESTS PASSED 100% SUCCESSFULLY! ★');
      process.exit(0);
    }
  }
}

runAIRTestSuite();
