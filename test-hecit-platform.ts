// ============================================================================
// HECIT – Explainable Clinical Intelligence & Trust Platform
// Comprehensive Automated Test Suite
// ============================================================================

import { hecit } from '../packages/hecit/src';
import { HPPMCareProfileEngine } from '../packages/hppm/src/care-profile';

// Build a test patient profile via HPPM
const careProfileEngine = new HPPMCareProfileEngine();
const testProfile = careProfileEngine.buildProfile({
  patientId: 'pt-hecit-6001',
  demographics: { age: 62, sex: 'M' },
  chronicConditions: ['Hypertension', 'Type 2 Diabetes', 'CKD Stage 3a'],
  allergies: ['Sulfonamides'],
  currentMedications: ['Lisinopril 20mg', 'Metformin 1000mg'],
  lifestyleSnapshot: {
    smokingStatus: 'NEVER',
    physicalActivityMinPerWeek: 90,
    sleepHoursPerNight: 6.5,
    dietQuality: 'FAIR',
  },
  adherenceHistory: {
    medicationAdherencePercent: 78,
    appointmentAdherencePercent: 85,
    screeningAdherencePercent: 65,
    lifestyleAdherencePercent: 50,
  },
  preferences: {
    preferGeneric: true,
    avoidInjections: true,
    preferOnceDailyDosing: true,
    dietaryPreference: 'NONE',
    exercisePreference: 'LOW_IMPACT',
    communicationPreference: 'TELEHEALTH',
  },
  vitalSigns: [
    { metric: 'Systolic BP', value: 142, unit: 'mmHg' },
    { metric: 'Diastolic BP', value: 88, unit: 'mmHg' },
  ],
  laboratoryResults: [
    { test: 'HbA1c', value: 7.6, unit: '%' },
    { test: 'LDL', value: 138, unit: 'mg/dL' },
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

async function runHECITTestSuite() {
  console.log('================================================================');
  console.log('HEALTHSENSE EXPLAINABLE CLINICAL INTELLIGENCE & TRUST (HECIT)');
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
  const result = hecit.evaluateTransparency(testProfile);
  const elapsed = performance.now() - startMs;

  console.log(`\nEvaluation ID: ${result.evaluationId}`);
  console.log(`Patient ID: ${result.patientId}`);
  console.log(`Total Latency: ${elapsed.toFixed(3)}ms`);

  // ── TEST 1: Decision Trace Engine ──
  console.log('\n[TEST 1] Decision Trace Engine');
  track(
    result.decisionTrace.traceId.startsWith('trace-'),
    `Trace ID generated: ${result.decisionTrace.traceId}`
  );
  track(
    result.decisionTrace.reasoningSequence.length >= 4,
    `Reasoning sequence contains ${result.decisionTrace.reasoningSequence.length} explicit steps`
  );
  track(
    result.decisionTrace.evidenceReferences.length > 0,
    `Evidence references linked: ${result.decisionTrace.evidenceReferences[0]}`
  );

  for (const step of result.decisionTrace.reasoningSequence) {
    console.log(`    → Step ${step.stepIndex} [${step.phase}]: ${step.ruleApplied} (${step.guidelineVersion})`);
  }

  // ── TEST 2: Evidence Explorer ──
  console.log('\n[TEST 2] Evidence Explorer');
  track(
    result.evidenceExploration.supportingEvidence.length >= 2,
    `Found ${result.evidenceExploration.supportingEvidence.length} supporting evidence items`
  );
  track(
    result.evidenceExploration.contradictingEvidence.length >= 1,
    `Exposed ${result.evidenceExploration.contradictingEvidence.length} contradicting evidence item(s)`
  );
  track(
    result.evidenceExploration.overallStrength === 'HIGH',
    `Overall evidence strength: ${result.evidenceExploration.overallStrength}`
  );

  // ── TEST 3: Confidence Decomposition ──
  console.log('\n[TEST 3] Confidence Decomposition');
  track(
    result.confidenceDecomposition.overallConfidenceScore > 0,
    `Overall confidence: ${result.confidenceDecomposition.confidencePercentage}`
  );
  track(
    result.confidenceDecomposition.contributingFactors.length > 0,
    `Contributing factors: ${result.confidenceDecomposition.contributingFactors.length} (+${result.confidenceDecomposition.contributingFactors[0].impactScore})`
  );
  track(
    result.confidenceDecomposition.uncertaintyFactors.length > 0,
    `Uncertainty factors: ${result.confidenceDecomposition.uncertaintyFactors.length} (${result.confidenceDecomposition.uncertaintyFactors[0].impactScore})`
  );

  // ── TEST 4: Alternative Care Pathways ──
  console.log('\n[TEST 4] Alternative Care Pathways');
  track(
    result.alternativePathways.length >= 3,
    `Generated ${result.alternativePathways.length} alternative pathways`
  );
  for (const alt of result.alternativePathways) {
    track(
      alt.reasonNotSelectedAsPrimary.length > 0,
      `Alternative "${alt.pathwayName.slice(0, 30)}...": Reason why not primary documented`
    );
    console.log(`    → ${alt.pathwayName}: Reason Not Selected: ${alt.reasonNotSelectedAsPrimary.slice(0, 60)}...`);
  }

  // ── TEST 5: Clinical Explanation Timeline ──
  console.log('\n[TEST 5] Clinical Explanation Timeline');
  track(
    result.explanationTimeline.chronologicalEvents.length >= 3,
    `Timeline contains ${result.explanationTimeline.chronologicalEvents.length} chronological events`
  );
  track(
    result.explanationTimeline.summaryTrajectory.length > 0,
    `Trajectory summary generated`
  );

  // ── TEST 6: AI Audit Logging Framework ──
  console.log('\n[TEST 6] AI Audit Logging Framework');
  track(
    result.auditRecord.auditId.startsWith('audit-'),
    `Audit ID generated: ${result.auditRecord.auditId}`
  );
  track(
    result.auditRecord.auditHash.length === 64,
    `SHA-256 integrity hash generated: ${result.auditRecord.auditHash.slice(0, 16)}...`
  );

  const retrievedAudit = hecit.getAuditLogger().getAuditRecord(result.auditRecord.auditId);
  track(
    retrievedAudit !== undefined && retrievedAudit.auditHash === result.auditRecord.auditHash,
    `Retrieved audit log matched cryptographically`
  );

  // ── TEST 7: Clinician Summary Generator ──
  console.log('\n[TEST 7] Clinician Summary Generator');
  track(
    result.clinicianSummary.keyFindings.length >= 3,
    `Clinician summary key findings: ${result.clinicianSummary.keyFindings.length} items`
  );
  track(
    result.clinicianSummary.topRisks.length > 0,
    `Top risks identified: ${result.clinicianSummary.topRisks.length}`
  );
  track(
    result.clinicianSummary.recommendedActions.length > 0,
    `Recommended actions prioritized: ${result.clinicianSummary.recommendedActions.length} actions`
  );

  // ── TEST 8: Patient-Friendly Explanation Generator ──
  console.log('\n[TEST 8] Patient-Friendly Explanation Generator');
  track(
    result.patientExplanation.simpleSummary.length > 0,
    `Jargon-free simple summary generated`
  );
  track(
    result.patientExplanation.whyThisIsRecommended.length > 0,
    `"Why recommended" patient items: ${result.patientExplanation.whyThisIsRecommended.length}`
  );
  track(
    result.patientExplanation.keyQuestionsToAskYourDoctor.length > 0,
    `Doctor questions for patient: ${result.patientExplanation.keyQuestionsToAskYourDoctor.length}`
  );

  // ── TEST 9: End-to-End Workflow & Performance ──
  console.log('\n[TEST 9] End-to-End Workflow & Performance');
  track(
    result.evaluationId.startsWith('hecit-'),
    `Evaluation ID format: ${result.evaluationId}`
  );
  track(
    result.telemetryPublished === true,
    `Telemetry published: ${result.telemetryPublished}`
  );
  track(
    result.latencyMs < 50,
    `HECIT Latency: ${result.latencyMs}ms (target <50ms)`
  );

  const telemetry = hecit.getTelemetry();
  track(
    telemetry.totalExplanationsGenerated >= 1,
    `Telemetry: ${telemetry.totalExplanationsGenerated} explanations, avg ${telemetry.averageLatencyMs}ms`
  );

  // ── Summary ──
  console.log('\n================================================================');
  console.log(
    `Total HECIT Tests: ${passed + failed} | PASSED: ${passed} (${(
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

runHECITTestSuite().catch(console.error);
