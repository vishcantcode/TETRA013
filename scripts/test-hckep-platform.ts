import { hckep, HCKEPKnowledgeRepository } from '../packages/hckep/src';
import { hcip } from '../packages/hcip/src';
import { pool } from '@healthsense/db';

async function runHCKEPTestSuite() {
  console.log('================================================================');
  console.log('HEALTHSENSE PRODUCT EVOLUTION: HCKEP PLATFORM TEST SUITE');
  console.log('================================================================\n');

  const tests: { name: string; success: boolean; details?: string }[] = [];

  const record = (name: string, success: boolean, details?: string) => {
    tests.push({ name, success, details });
    const symbol = success ? '✓ [PASS]' : '✗ [FAIL]';
    console.log(`${symbol} ${name}${details ? ` -> ${details}` : ''}`);
  };

  try {
    const repo = HCKEPKnowledgeRepository.getInstance();

    // TEST 1: Clinical Knowledge Retrieval by Domain
    const htnGuidelines = repo.findByDomain('CHRONIC_DISEASE');
    record('HCKEP Guideline Query by Domain', htnGuidelines.length > 0, `Discovered ${htnGuidelines.length} guidelines (Title: ${htnGuidelines[0]?.title})`);

    // TEST 2: Knowledge Versioning & Publishing
    repo.publish({
      id: 'gdl-htn-01',
      title: 'AHA/ACC Hypertension Guidelines Updated',
      domain: 'CHRONIC_DISEASE',
      version: 'v1.2.0',
      status: 'PUBLISHED',
      summary: 'Updated Stage 1 criteria with lifestyle intervention guidance.',
      evidenceSource: 'AHA 2024 Practice Update',
      criteria: { systolicThreshold: 130 },
      publishedAt: new Date()
    });

    const latest = repo.getLatest('gdl-htn-01');
    const v100 = repo.getVersion('gdl-htn-01', 'v1.0.0');
    const isVersioned = latest?.version === 'v1.2.0' && v100?.version === 'v1.0.0';
    record('HCKEP Knowledge Versioning & Historical Reproducibility', isVersioned, `Latest Version: ${latest?.version}, Historical Version: ${v100?.version}`);

    // TEST 3: Evidence Chain & Explainability Synthesis
    const evidenceChain = hckep.createEvidenceChain(
      'rec-101',
      ['gdl-htn-01'],
      [{ metric: 'Systolic BP', value: 142, timestamp: new Date() }]
    );

    const isEvidenceValid = 
      evidenceChain.consultedEntries.length === 1 &&
      evidenceChain.confidenceScore >= 0.90 &&
      evidenceChain.explainabilitySummary.includes('AHA/ACC Hypertension Guidelines');

    record('HCKEP Evidence Chain & Structured Explainability Synthesis', isEvidenceValid, `Confidence: ${(evidenceChain.confidenceScore * 100).toFixed(0)}%, Summary: ${evidenceChain.explainabilitySummary.substring(0, 60)}...`);

    // TEST 4: Complete 8-Tier Platform Execution (HCKEP->HCIP->HCOP->HUSE->HPIE->AIR->HIEK->HOIP)
    const patientId = `pat-hckep-${Date.now()}`;
    await pool.query(
      `INSERT INTO users (id, email, password_hash, role) VALUES ($1, $2, $3, $4)`,
      [patientId, `${patientId}@healthsense.ai`, 'Hash123!', 'patient']
    );

    const assessmentRes = await hcip.runComprehensiveAssessment(patientId, { symptom: 'elevated blood pressure' });
    const is8TierWorking = assessmentRes.status === 'COMPLETED' && assessmentRes.evidenceChain.length > 0;
    record('HCKEP 8-Tier Cohesive Platform Execution', is8TierWorking, `Status: ${assessmentRes.status}, Execution ID: ${assessmentRes.executionId}`);

    // TEST 5: HCKEP Evidence Processing Benchmark (< 1ms Target)
    const benchStart = performance.now();
    const ITERATIONS = 100;
    for (let i = 0; i < ITERATIONS; i++) {
      hckep.createEvidenceChain('rec-bench', ['gdl-htn-01'], [{ metric: 'BP', value: 140, timestamp: new Date() }]);
    }
    const avgHckepMs = (performance.now() - benchStart) / ITERATIONS;
    record('HCKEP Evidence Processing Benchmark (< 1ms Target)', avgHckepMs < 1, `Average HCKEP Evidence Synthesis Time: ${avgHckepMs.toFixed(3)}ms`);

  } catch (err: any) {
    console.error('[HCKEP Suite Exception]', err);
    record('HCKEP Platform Suite Execution', false, err.message);
  } finally {
    console.log('\n================================================================');
    console.log('HCKEP PLATFORM ACCEPTANCE SUMMARY');
    console.log('================================================================');
    const passed = tests.filter(t => t.success).length;
    const failed = tests.filter(t => !t.success).length;
    console.log(`Total HCKEP Platform Tests: ${tests.length}`);
    console.log(`PASSED: ${passed}`);
    console.log(`FAILED: ${failed}`);

    if (failed > 0) {
      console.error('\nHCKEP PLATFORM SUITE FAILED!');
      process.exit(1);
    } else {
      console.log('\n★ ALL HCKEP PLATFORM TESTS PASSED 100% SUCCESSFULLY! ★');
      process.exit(0);
    }
  }
}

runHCKEPTestSuite();
