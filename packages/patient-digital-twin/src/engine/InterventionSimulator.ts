import { UnifiedRiskAssessment } from '@healthsense/clinical-intelligence';
import { SimulationInputs, SimulationResult } from '../interfaces/SimulationScenario';

export class InterventionSimulator {
  public static simulate(
    assessment: UnifiedRiskAssessment,
    inputs: SimulationInputs = { hba1cDelta: -1.0, systolicBPDelta: -10, bmiDelta: -2.0, quitSmoking: true }
  ): SimulationResult {
    const baselineScore = assessment.overallRiskScore;
    let reduction = 0;

    if (inputs.hba1cDelta) reduction += Math.abs(inputs.hba1cDelta) * 12; // -1.0% HbA1c -> -12% risk
    if (inputs.systolicBPDelta) reduction += (Math.abs(inputs.systolicBPDelta) / 10) * 8; // -10 mmHg -> -8% risk
    if (inputs.bmiDelta) reduction += (Math.abs(inputs.bmiDelta) / 2) * 5; // -2.0 BMI -> -5% risk
    if (inputs.quitSmoking) reduction += 15; // Quit smoking -> -15% risk

    const simulatedScore = Math.min(100, Math.max(5, Math.round(baselineScore - reduction)));
    const reductionPct = Math.round(((baselineScore - simulatedScore) / baselineScore) * 100);

    const getTier = (s: number) => s >= 85 ? 'severe' as const : s >= 60 ? 'high' as const : s >= 25 ? 'moderate' as const : 'low' as const;

    return {
      isSimulation: true,
      inputs,
      baselineRiskScore: baselineScore,
      simulatedRiskScore: simulatedScore,
      riskReductionPercentage: Math.max(0, reductionPct),
      baselineTier: getTier(baselineScore),
      simulatedTier: getTier(simulatedScore),
      clinicalImpactSummary: `Simulated intervention (HbA1c ${inputs.hba1cDelta ?? 0}%, BP ${inputs.systolicBPDelta ?? 0} mmHg) projects a -${reductionPct}% reduction in overall cardiovascular and metabolic risk.`
    };
  }
}
