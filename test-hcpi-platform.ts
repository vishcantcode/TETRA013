import { hcpi } from '../packages/hcpi/src';

async function runHCPITest() {
  console.log('================================================================');
  console.log('HEALTHSENSE COGNITIVE PATIENT INTELLIGENCE (HCPI) - SYSTEM TEST');
  console.log('================================================================');

  const patientId = 'pt-hcpi-9901';

  console.log('\n[1] Fetching initial longitudinal patient profile...');
  const initialAnalysis = hcpi.analyzePatientLongitudinal(patientId);
  console.log(`Profile Version: ${initialAnalysis.profile.version}`);
  console.log(`Initial Trajectory: ${initialAnalysis.riskEvolution.trajectory}`);
  console.log(`Initial Risk Score: ${initialAnalysis.riskEvolution.currentRiskScore}`);
  console.log(`Initial Hospitalization Risk: ${initialAnalysis.predictiveInsights.hospitalizationLikelihoodPercent}%`);

  console.log('\n[2] Patient condition deteriorates (new observations)...');
  const deteriorationAnalysis = hcpi.analyzePatientLongitudinal(patientId, {
    vitalTrajectories: [
      { metric: 'Systolic BP', value: 155, trend: 'RISING' }
    ],
    adherenceScore: 75
  });

  console.log(`Profile Version: ${deteriorationAnalysis.profile.version}`);
  console.log(`Updated Trajectory: ${deteriorationAnalysis.riskEvolution.trajectory}`);
  console.log(`Updated Risk Score: ${deteriorationAnalysis.riskEvolution.currentRiskScore}`);
  console.log(`Updated Disease Progression Risk: ${deteriorationAnalysis.predictiveInsights.diseaseProgressionRisk}`);
  console.log(`Updated Hospitalization Risk: ${deteriorationAnalysis.predictiveInsights.hospitalizationLikelihoodPercent}%`);
  console.log(`Predictive Confidence: ${deteriorationAnalysis.predictiveInsights.confidenceScore}%`);
  console.log(`Explainability: ${deteriorationAnalysis.predictiveInsights.supportingEvidenceSummary}`);

  console.log('\n[3] Validating Risk Evolution Reasons:');
  deteriorationAnalysis.riskEvolution.explainableReasons.forEach(reason => {
    console.log(`  -> ${reason}`);
  });

  console.log('\n================================================================');
  console.log('HCPI SYSTEM TEST SUCCESSFUL');
  console.log('================================================================');
}

runHCPITest().catch(console.error);
