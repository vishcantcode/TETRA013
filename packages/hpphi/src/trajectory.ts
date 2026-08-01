// ============================================================================
// HPPHI – Capability 6: Predictive Health Trajectory Module
// ============================================================================

import { HPPHIPatientInput, HPPHIPredictiveTrajectory, HPPHITrajectoryScenario, HPPHIPreventiveHealthScore } from './types';

export class HPPHITrajectoryEngine {

  public predict(patient: HPPHIPatientInput, currentScore: HPPHIPreventiveHealthScore): HPPHIPredictiveTrajectory {
    const score = currentScore.overallScore;
    const weaknesses = currentScore.weaknesses;
    const strengths = currentScore.strengths;

    // Determine primary drivers
    const primaryDrivers: string[] = [];
    if (patient.lifestyleFactors.smokingStatus === 'CURRENT') primaryDrivers.push('Active tobacco use');
    if (patient.lifestyleFactors.physicalActivityMinPerWeek < 150) primaryDrivers.push('Insufficient physical activity');
    if (patient.lifestyleFactors.dietQuality === 'POOR') primaryDrivers.push('Poor dietary quality');
    if (patient.chronicConditions.length >= 3) primaryDrivers.push('Multi-morbidity burden');
    if (patient.age >= 65) primaryDrivers.push('Advanced age');
    if (weaknesses.length > 0) primaryDrivers.push(`Weaknesses: ${weaknesses.join(', ')}`);
    if (primaryDrivers.length === 0) primaryDrivers.push('Overall stable health profile');

    // ── OPTIMISTIC Scenario ──
    const optimisticImprovement = Math.min(25, weaknesses.length * 8);
    const optimisticScore = Math.min(100, score + optimisticImprovement);
    const optimistic: HPPHITrajectoryScenario = {
      scenario: 'OPTIMISTIC',
      description: 'Patient fully adheres to all preventive recommendations, lifestyle modifications are sustained, and all screenings are completed on schedule.',
      keyAssumptions: [
        'Full medication adherence (>90%)',
        'All lifestyle recommendations adopted',
        'All overdue screenings completed',
        ...weaknesses.map(w => `${w} score improves significantly`)
      ],
      projectedHealthScore: optimisticScore,
      projectedRisks: ['Residual age-related risks', 'Non-modifiable genetic factors'],
      confidence: 0.65,
      timeHorizon: '12-24 months'
    };

    // ── EXPECTED Scenario ──
    const expectedChange = weaknesses.length > 3 ? -5 : weaknesses.length > 0 ? 0 : 3;
    const expectedScore = Math.max(0, Math.min(100, score + expectedChange));
    const expectedRisks: string[] = [];
    if (patient.lifestyleFactors.smokingStatus === 'CURRENT') expectedRisks.push('Continued smoking increases CVD and cancer risk');
    if (patient.lifestyleFactors.physicalActivityMinPerWeek < 150) expectedRisks.push('Sedentary lifestyle maintains cardiometabolic risk');
    if (patient.chronicConditions.length >= 2) expectedRisks.push('Progressive chronic disease complications');
    if (expectedRisks.length === 0) expectedRisks.push('Gradual age-related health changes');

    const expected: HPPHITrajectoryScenario = {
      scenario: 'EXPECTED',
      description: 'Patient maintains current behavior patterns with partial adherence to recommendations.',
      keyAssumptions: [
        'Partial medication adherence (70-85%)',
        'Some lifestyle modifications attempted',
        'Routine screenings mostly completed'
      ],
      projectedHealthScore: expectedScore,
      projectedRisks: expectedRisks,
      confidence: 0.80,
      timeHorizon: '12-24 months'
    };

    // ── HIGH-RISK Scenario ──
    const highRiskDecline = Math.min(30, weaknesses.length * 6 + patient.chronicConditions.length * 3);
    const highRiskScore = Math.max(0, score - highRiskDecline);
    const highRiskRisks: string[] = [
      'Uncontrolled chronic disease progression',
      'Increased hospitalization risk',
      'New comorbidity development'
    ];
    if (patient.lifestyleFactors.smokingStatus === 'CURRENT') highRiskRisks.push('Accelerated cardiovascular and pulmonary decline');
    if (patient.chronicConditions.some(c => c.toLowerCase().includes('diabetes'))) highRiskRisks.push('Diabetic complications (retinopathy, neuropathy, nephropathy)');

    const highRisk: HPPHITrajectoryScenario = {
      scenario: 'HIGH_RISK',
      description: 'Patient discontinues medications, ignores lifestyle recommendations, and misses preventive screenings.',
      keyAssumptions: [
        'Medication non-adherence (<50%)',
        'No lifestyle modifications',
        'All preventive care missed',
        'Chronic conditions unmanaged'
      ],
      projectedHealthScore: highRiskScore,
      projectedRisks: highRiskRisks,
      confidence: 0.75,
      timeHorizon: '12-24 months'
    };

    return {
      scenarios: [optimistic, expected, highRisk],
      primaryDrivers,
      mostLikelyOutcome: expected.description
    };
  }
}
