import { hcop, HCOPCapabilityRegistry, HCOPExecutionPlanner } from '../packages/hcop/src';
import { createHIEKContext } from '../packages/hiek/src';

async function runHCOPTestSuite() {
  console.log('================================================================');
  console.log('HEALTHSENSE BACKEND EXCELLENCE: HCOP PLATFORM TEST SUITE');
  console.log('================================================================\n');

  const tests: { name: string; success: boolean; details?: string }[] = [];

  const record = (name: string, success: boolean, details?: string) => {
    tests.push({ name, success, details });
    const symbol = success ? '✓ [PASS]' : '✗ [FAIL]';
    console.log(`${symbol} ${name}${details ? ` -> ${details}` : ''}`);
  };

  try {
    const registry = HCOPCapabilityRegistry.getInstance();
    registry.clear();

    // Register Capabilities
    registry.register({
      id: 'cap-digital-twin',
      name: 'DigitalTwinUpdate',
      category: 'DIGITAL_TWIN',
      version: '1.0.0',
      description: 'Fetches and updates patient digital twin state',
      handler: async (inp, ctx) => ({ twinVersion: 2, patientId: ctx.patientId })
    });

    registry.register({
      id: 'cap-clinical-reasoning',
      name: 'ClinicalReasoning',
      category: 'CLINICAL_REASONING',
      version: '1.0.0',
      description: 'Executes clinical triage reasoning rules',
      dependencies: ['cap-digital-twin'],
      handler: async (inp) => ({ triageRecommendation: 'Schedule PCP Visit', severity: 'MODERATE' })
    });

    registry.register({
      id: 'cap-explainability',
      name: 'Explainability',
      category: 'EXPLAINABILITY',
      version: '1.0.0',
      description: 'Synthesizes clinical evidence chain explanation',
      dependencies: ['cap-clinical-reasoning'],
      handler: async (inp) => ({ evidenceChain: ['Guideline A.1', 'Symptom matching'], confidence: 0.95 })
    });

    // TEST 1: Capability Registration & Discovery
    const discovered = registry.findByCategory('CLINICAL_REASONING');
    record('HCOP Capability Registration & Discovery', discovered.length === 1 && discovered[0].id === 'cap-clinical-reasoning', `Discovered Capability: ${discovered[0].name} (Category: ${discovered[0].category})`);

    // TEST 2: Composition Planning & Dependency DAG Resolution
    const planner = HCOPExecutionPlanner.getInstance();
    const plan = planner.constructPlan('ComposedClinicalTriageWorkflow', ['cap-explainability']);
    const stepIds = plan.executionSteps.map(s => s.id);

    const isDagCorrect = stepIds.includes('cap-digital-twin') && stepIds.includes('cap-clinical-reasoning') && stepIds.includes('cap-explainability');
    record('HCOP Composition Planning & Dependency Resolution', isDagCorrect, `Execution Step Order: ${stepIds.join(' -> ')}`);

    // TEST 3: Dynamic Composition Execution across 6-Tier Architecture (HCOP->HUSE->HPIE->AIR->HIEK->HOIP)
    const ctx = createHIEKContext({
      user: { id: 'usr-hcop-01', email: 'hcop@healthsense.ai', role: 'clinician' },
      patientId: 'pat-hcop-01'
    });

    const compRes = await hcop.executeComposition({
      workflowName: 'ComposedTriageWorkflow',
      entityType: 'CLINICAL_WORKFLOW',
      entityId: 'wf-hcop-100',
      requestedCapabilities: ['cap-explainability'],
      context: ctx,
      input: { initialSymptom: 'chest pressure' }
    });

    const isExecutionSuccessful = 
      compRes.status === 'COMPLETED' &&
      compRes.stepResults['cap-digital-twin'] !== undefined &&
      compRes.stepResults['cap-clinical-reasoning'] !== undefined &&
      compRes.stepResults['cap-explainability'] !== undefined;

    record('HCOP 6-Tier Cohesive Platform Execution (HCOP+HUSE+HPIE+AIR+HIEK+HOIP)', isExecutionSuccessful, `Status: ${compRes.status}, Total Steps Executed: ${compRes.plan.executionSteps.length}`);

    // TEST 4: Capability Reusability across Multiple Workflows
    const compRes2 = await hcop.executeComposition({
      workflowName: 'PreventiveCheckupWorkflow',
      entityType: 'ASSESSMENT',
      entityId: 'asm-hcop-200',
      requestedCapabilities: ['cap-digital-twin'],
      context: ctx
    });

    record('HCOP Business Capability Reusability', compRes2.status === 'COMPLETED' && compRes2.stepResults['cap-digital-twin'] !== undefined, 'DigitalTwinUpdate capability reused seamlessly');

    // TEST 5: HCOP Composition Planning & Execution Overhead Benchmark (< 0.5ms Target)
    const benchStart = performance.now();
    const ITERATIONS = 100;
    for (let i = 0; i < ITERATIONS; i++) {
      planner.constructPlan('BenchWorkflow', ['cap-explainability']);
    }
    const avgHcopMs = (performance.now() - benchStart) / ITERATIONS;
    record('HCOP Composition Planning Overhead Benchmark (< 0.5ms Target)', avgHcopMs < 0.5, `Average HCOP Planning Time: ${avgHcopMs.toFixed(3)}ms`);

  } catch (err: any) {
    console.error('[HCOP Suite Exception]', err);
    record('HCOP Platform Suite Execution', false, err.message);
  } finally {
    console.log('\n================================================================');
    console.log('HCOP PLATFORM ACCEPTANCE SUMMARY');
    console.log('================================================================');
    const passed = tests.filter(t => t.success).length;
    const failed = tests.filter(t => !t.success).length;
    console.log(`Total HCOP Platform Tests: ${tests.length}`);
    console.log(`PASSED: ${passed}`);
    console.log(`FAILED: ${failed}`);

    if (failed > 0) {
      console.error('\nHCOP PLATFORM SUITE FAILED!');
      process.exit(1);
    } else {
      console.log('\n★ ALL HCOP PLATFORM TESTS PASSED 100% SUCCESSFULLY! ★');
      process.exit(0);
    }
  }
}

runHCOPTestSuite();
