// ============================================================================
// HCSOF – Capability 3 & 7: Risk Comparison Dashboard Backend
// ============================================================================

import { StrategySimulationResult, SideBySideComparison } from './types';

export class HCSOFRiskDashboardEngine {
  /**
   * Build side-by-side comparison matrix and ranking for simulated care strategies.
   */
  public generateComparison(
    results: StrategySimulationResult[]
  ): SideBySideComparison {
    if (results.length === 0) {
      return {
        strategiesCompared: [],
        recommendedStrategyId: '',
        rankingRationale: 'No strategies provided for comparison.',
        tradeOffSummary: [],
      };
    }

    // Sort by suitability score descending
    const sorted = [...results].sort(
      (a, b) => b.patientSuitabilityScore - a.patientSuitabilityScore
    );
    const recommended = sorted[0];

    const tradeOffSummary: string[] = [];
    for (const res of results) {
      const expForecast = res.forecasts.find(f => f.scenario === 'EXPECTED');
      tradeOffSummary.push(
        `${res.strategyName}: Suitability ${res.patientSuitabilityScore}/100. Expected BP ${expForecast?.predictedBpSystolic} mmHg, HbA1c ${expForecast?.predictedHbA1c}%.`
      );
    }

    const rankingRationale =
      `Recommended "${recommended.strategyName}" (Suitability Score: ${recommended.patientSuitabilityScore}/100) ` +
      `due to superior alignment with patient preferences, adherence profile, and evidence strength (${recommended.evidenceStrength}).`;

    return {
      strategiesCompared: sorted,
      recommendedStrategyId: recommended.strategyId,
      rankingRationale,
      tradeOffSummary,
    };
  }
}
