// ============================================================================
// HCSOF – Capability 1: Multi-Strategy Simulation Engine
// ============================================================================

import {
  DigitalTwinState,
  CareStrategyDefinition,
  StrategySimulationResult,
} from './types';
import { HCSOFForecastingEngine } from './forecasting';
import { HPPMCareProfile } from '@healthsense/hppm';

export class HCSOFMultiStrategyEngine {
  private forecastingEngine = new HCSOFForecastingEngine();

  /**
   * Generate standard comparative strategies for a patient profile.
   */
  public generateComparativeStrategies(profile: HPPMCareProfile): CareStrategyDefinition[] {
    const hasHtn = profile.chronicConditions.some(c => c.toLowerCase().includes('hypertension'));
    const hasDiabetes = profile.chronicConditions.some(c => c.toLowerCase().includes('diabetes'));

    const strategyA: CareStrategyDefinition = {
      strategyId: 'strat-a-conservative',
      strategyName: 'Strategy A: Comprehensive Lifestyle & Regimen Optimization',
      description: 'Focus on lifestyle modification (DASH/Mediterranean diet, physical activity), patient education, and adherence support before adding new agents.',
      steps: [
        { stepNumber: 1, category: 'LIFESTYLE', action: 'Initiate DASH diet and sodium restriction <2300mg/day', targetTimeline: 'Immediate' },
        { stepNumber: 2, category: 'LIFESTYLE', action: 'Increase physical activity to 150 min/week moderate-intensity', targetTimeline: '1-3 months' },
        { stepNumber: 3, category: 'MONITORING', action: 'Home BP monitoring and weekly digital log review', targetTimeline: 'Ongoing' },
        { stepNumber: 4, category: 'MEDICATION', action: 'Optimize current medication adherence to >90%', targetTimeline: '1-3 months' },
      ],
    };

    const strategyB: CareStrategyDefinition = {
      strategyId: 'strat-b-escalation',
      strategyName: 'Strategy B: Pharmacotherapy Escalation & Targeted Specialist Referral',
      description: 'Intensify pharmacotherapy immediately with dose titration / combination therapy and specialist referral.',
      steps: [
        { stepNumber: 1, category: 'MEDICATION', action: hasDiabetes ? 'Initiate SGLT2 inhibitor (Empagliflozin 10mg)' : 'Titrate Lisinopril to 40mg daily', targetTimeline: 'Immediate' },
        { stepNumber: 2, category: 'MONITORING', action: 'Repeat lab panel (eGFR, electrolyte, HbA1c) at 4-6 weeks', targetTimeline: '30-45 days' },
        { stepNumber: 3, category: 'REFERRAL', action: hasDiabetes ? 'Endocrinology co-management referral' : 'Cardiology risk evaluation', targetTimeline: '60 days' },
        { stepNumber: 4, category: 'LIFESTYLE', action: 'Basic lifestyle recommendations as adjunct', targetTimeline: 'Ongoing' },
      ],
    };

    return [strategyA, strategyB];
  }

  /**
   * Simulate a care strategy against a digital twin state.
   */
  public simulateStrategy(
    twin: DigitalTwinState,
    strategy: CareStrategyDefinition,
    profile: HPPMCareProfile
  ): StrategySimulationResult {
    const { forecasts, metricForecasts } = this.forecastingEngine.forecastOutcomes(twin, strategy);
    const timeline = this.forecastingEngine.generateTimeline(twin, forecasts);

    const isMedEscalation = strategy.steps.some(s => s.category === 'MEDICATION');
    const isLifestyle = strategy.steps.some(s => s.category === 'LIFESTYLE');

    const expectedBenefits: string[] = [];
    const potentialRisks: string[] = [];
    const evidenceReferences: string[] = [];

    if (isLifestyle) {
      expectedBenefits.push('Cardiovascular risk reduction through holistic lifestyle improvement');
      expectedBenefits.push('No risk of drug-drug interaction or medication side effects');
      evidenceReferences.push('USPSTF Lifestyle Recommendations / DASH Trial');
    }

    if (isMedEscalation) {
      expectedBenefits.push('Rapid, predictable biomarker improvement (BP/HbA1c/LDL)');
      expectedBenefits.push('Proven end-organ protection (renoprotection & CV risk reduction)');
      potentialRisks.push('Potential medication side effects and polypharmacy risk');
      evidenceReferences.push('ACC/AHA 2017 Guidelines / ADA 2024 Standards');
    }

    // Patient suitability based on preferences
    let suitabilityScore = 75;
    if (profile.preferences.preferOnceDailyDosing && isMedEscalation) suitabilityScore += 5;
    if (profile.adherenceHistory.lifestyleAdherencePercent > 70 && isLifestyle) suitabilityScore += 10;
    if (profile.adherenceHistory.lifestyleAdherencePercent < 50 && isLifestyle) suitabilityScore -= 15;

    return {
      strategyId: strategy.strategyId,
      strategyName: strategy.strategyName,
      forecasts,
      metricForecasts,
      timeline,
      expectedBenefits,
      potentialRisks,
      uncertaintyScore: 0.15,
      evidenceStrength: 'HIGH',
      patientSuitabilityScore: Math.max(0, Math.min(100, suitabilityScore)),
      evidenceReferences,
    };
  }
}
