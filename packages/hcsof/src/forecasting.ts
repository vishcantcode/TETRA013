// ============================================================================
// HCSOF – Capability 2 & 4: Outcome & Timeline Forecasting Module
// ============================================================================

import {
  DigitalTwinState,
  ScenarioForecast,
  MetricForecast,
  PatientTimelineForecast,
  TimelineMilestone,
  CareStrategyDefinition,
} from './types';

export class HCSOFForecastingEngine {
  /**
   * Forecast outcomes (Optimistic, Expected, Conservative) for a specific care strategy against a digital twin state.
   */
  public forecastOutcomes(
    twin: DigitalTwinState,
    strategy: CareStrategyDefinition
  ): { forecasts: ScenarioForecast[]; metricForecasts: MetricForecast[] } {
    const sysBp = twin.simulatedVitals.find(v => v.metric === 'Systolic BP')?.value ?? 135;
    const hba1c = twin.simulatedLabs.find(l => l.test === 'HbA1c')?.value ?? 7.2;
    const ldl = twin.simulatedLabs.find(l => l.test === 'LDL')?.value ?? 140;
    const bmi = twin.simulatedLabs.find(l => l.test === 'BMI')?.value ?? 28;

    // Calculate strategy intensity
    const isMedIntensive = strategy.steps.some(s => s.category === 'MEDICATION' && s.action.toLowerCase().includes('escalat'));
    const isLifestyleIntensive = strategy.steps.some(s => s.category === 'LIFESTYLE' && s.action.toLowerCase().includes('intens'));

    // Reductions
    const bpReductionBase = isMedIntensive ? 12 : isLifestyleIntensive ? 8 : 5;
    const hba1cReductionBase = isMedIntensive ? 1.0 : isLifestyleIntensive ? 0.6 : 0.3;
    const ldlReductionBase = isMedIntensive ? 35 : isLifestyleIntensive ? 15 : 8;

    const forecasts: ScenarioForecast[] = [
      {
        scenario: 'OPTIMISTIC',
        predictedBpSystolic: Math.max(115, Math.round(sysBp - bpReductionBase * 1.4)),
        predictedHbA1c: parseFloat(Math.max(5.5, hba1c - hba1cReductionBase * 1.3).toFixed(1)),
        predictedLdl: Math.max(70, Math.round(ldl - ldlReductionBase * 1.3)),
        predictedBmi: parseFloat(Math.max(22, bmi - 2.5).toFixed(1)),
        predictedCvdRiskPercent: Math.max(5, Math.round(twin.simulatedRiskScore * 0.4)),
        diseaseProgressionRisk: 'LOW',
        confidence: 0.70,
        uncertaintyDescription: 'Assumes complete patient adherence (>90%) and optimal physiological response.',
      },
      {
        scenario: 'EXPECTED',
        predictedBpSystolic: Math.max(118, Math.round(sysBp - bpReductionBase)),
        predictedHbA1c: parseFloat(Math.max(5.7, hba1c - hba1cReductionBase).toFixed(1)),
        predictedLdl: Math.max(85, Math.round(ldl - ldlReductionBase)),
        predictedBmi: parseFloat(Math.max(23, bmi - 1.2).toFixed(1)),
        predictedCvdRiskPercent: Math.max(8, Math.round(twin.simulatedRiskScore * 0.65)),
        diseaseProgressionRisk: 'LOW',
        confidence: 0.85,
        uncertaintyDescription: 'Reflects typical real-world response and moderate adherence (75-85%).',
      },
      {
        scenario: 'CONSERVATIVE',
        predictedBpSystolic: Math.max(122, Math.round(sysBp - bpReductionBase * 0.5)),
        predictedHbA1c: parseFloat(Math.max(6.0, hba1c - hba1cReductionBase * 0.4).toFixed(1)),
        predictedLdl: Math.max(100, Math.round(ldl - ldlReductionBase * 0.4)),
        predictedBmi: parseFloat(Math.max(24, bmi - 0.4).toFixed(1)),
        predictedCvdRiskPercent: Math.max(12, Math.round(twin.simulatedRiskScore * 0.85)),
        diseaseProgressionRisk: 'MODERATE',
        confidence: 0.80,
        uncertaintyDescription: 'Accounts for potential adherence gaps (<65%) or partial therapeutic resistance.',
      },
    ];

    const metricForecasts: MetricForecast[] = [
      {
        metric: 'Systolic Blood Pressure',
        baseline: sysBp,
        optimistic: forecasts[0].predictedBpSystolic,
        expected: forecasts[1].predictedBpSystolic,
        conservative: forecasts[2].predictedBpSystolic,
        unit: 'mmHg',
      },
      {
        metric: 'HbA1c',
        baseline: hba1c,
        optimistic: forecasts[0].predictedHbA1c,
        expected: forecasts[1].predictedHbA1c,
        conservative: forecasts[2].predictedHbA1c,
        unit: '%',
      },
      {
        metric: 'LDL Cholesterol',
        baseline: ldl,
        optimistic: forecasts[0].predictedLdl,
        expected: forecasts[1].predictedLdl,
        conservative: forecasts[2].predictedLdl,
        unit: 'mg/dL',
      },
    ];

    return { forecasts, metricForecasts };
  }

  /**
   * Generate 30d, 90d, 6m, 12m milestone timeline forecasts.
   */
  public generateTimeline(
    twin: DigitalTwinState,
    forecasts: ScenarioForecast[]
  ): PatientTimelineForecast {
    const expected = forecasts.find(f => f.scenario === 'EXPECTED') || forecasts[0];

    const sysBp = twin.simulatedVitals.find(v => v.metric === 'Systolic BP')?.value ?? 135;
    const hba1c = twin.simulatedLabs.find(l => l.test === 'HbA1c')?.value ?? 7.2;

    const milestones: TimelineMilestone[] = [
      {
        timeframe: '30_DAYS',
        label: 'Initial Response Check',
        expectedBiomarkers: [
          { metric: 'Systolic BP', expectedValue: Math.round(sysBp - (sysBp - expected.predictedBpSystolic) * 0.4), unit: 'mmHg' },
        ],
        recommendedClinicalActions: [
          'Verify medication tolerability and home BP logs',
          'Review early lifestyle adjustments',
        ],
        reviewPoints: ['Check for side effects', 'Confirm medication fill status'],
      },
      {
        timeframe: '90_DAYS',
        label: 'Quarterly Efficacy Assessment',
        expectedBiomarkers: [
          { metric: 'Systolic BP', expectedValue: expected.predictedBpSystolic, unit: 'mmHg' },
          { metric: 'HbA1c', expectedValue: parseFloat((hba1c - (hba1c - expected.predictedHbA1c) * 0.6).toFixed(1)), unit: '%' },
        ],
        recommendedClinicalActions: [
          'Re-check laboratory panel (HbA1c, eGFR)',
          'Evaluate adherence metrics and adjust dosage if needed',
        ],
        reviewPoints: ['Glycemic trajectory evaluation', 'Renal safety check'],
      },
      {
        timeframe: '6_MONTHS',
        label: 'Mid-Year Comprehensive Evaluation',
        expectedBiomarkers: [
          { metric: 'Systolic BP', expectedValue: expected.predictedBpSystolic, unit: 'mmHg' },
          { metric: 'HbA1c', expectedValue: expected.predictedHbA1c, unit: '%' },
          { metric: 'LDL', expectedValue: expected.predictedLdl, unit: 'mg/dL' },
        ],
        recommendedClinicalActions: [
          'Complete metabolic & lipid panel',
          'Assess chronic disease progression markers',
        ],
        reviewPoints: ['ASCVD risk score update', 'Lifestyle sustainability check'],
      },
      {
        timeframe: '12_MONTHS',
        label: 'Annual Outcomes & Pathway Review',
        expectedBiomarkers: [
          { metric: 'Systolic BP', expectedValue: expected.predictedBpSystolic, unit: 'mmHg' },
          { metric: 'HbA1c', expectedValue: expected.predictedHbA1c, unit: '%' },
          { metric: 'BMI', expectedValue: expected.predictedBmi, unit: 'kg/m²' },
        ],
        recommendedClinicalActions: [
          'Annual preventive screening suite',
          'Longitudinal care strategy update',
        ],
        reviewPoints: ['1-year target goal achievement check', 'Preventive health score re-calculation'],
      },
    ];

    return {
      timeHorizon: '12 months',
      milestones,
    };
  }
}
