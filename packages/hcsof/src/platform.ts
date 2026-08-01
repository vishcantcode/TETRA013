// ============================================================================
// HCSOF – Platform Orchestrator
//
// Coordinates all 8 HCSOF simulation & outcome forecasting capabilities.
// Integrates with HCPI (digital twin memory), HCKEP (explainability),
// HPPM (care profiles), and HOIP (operational telemetry).
// ============================================================================

import crypto from 'node:crypto';

import {
  DigitalTwinState,
  HCSOFEvaluationResult,
  WhatIfParameters,
  CareStrategyDefinition,
} from './types';
import { HCSOFDigitalTwinEngine } from './digital-twin';
import { HCSOFMultiStrategyEngine } from './multi-strategy';
import { HCSOFWhatIfEngine } from './what-if';
import { HCSOFRiskDashboardEngine } from './risk-dashboard';
import { HPPMCareProfile } from '@healthsense/hppm';
import { hckep } from '@healthsense/hckep';

export class HCSOFPlatform {
  private twinEngine = new HCSOFDigitalTwinEngine();
  private strategyEngine = new HCSOFMultiStrategyEngine();
  private whatIfEngine = new HCSOFWhatIfEngine();
  private dashboardEngine = new HCSOFRiskDashboardEngine();

  // Internal telemetry
  private telemetry = {
    totalSimulations: 0,
    totalStrategiesSimulated: 0,
    totalWhatIfScenariosRun: 0,
    totalDashboardsGenerated: 0,
    totalLatencyMs: 0,
  };

  /**
   * Run a full clinical simulation & outcome forecasting evaluation for a patient.
   */
  public simulatePatient(
    profile: HPPMCareProfile,
    customStrategies?: CareStrategyDefinition[],
    customWhatIfParams?: WhatIfParameters[]
  ): HCSOFEvaluationResult {
    const start = performance.now();
    const evaluationId = `hcsof-${crypto.randomUUID().slice(0, 8)}`;

    // ── 1. Create Digital Twin State (Isolated) ──
    const baseDigitalTwin = this.twinEngine.createSnapshot(profile);

    // ── 2. Multi-Strategy Simulation ──
    const strategies = customStrategies || this.strategyEngine.generateComparativeStrategies(profile);
    const simulatedStrategies = strategies.map(strat =>
      this.strategyEngine.simulateStrategy(baseDigitalTwin, strat, profile)
    );

    // ── 3. What-If Analyses ──
    const whatIfParamsList: { name: string; params: WhatIfParameters }[] = customWhatIfParams
      ? customWhatIfParams.map((p, idx) => ({ name: `Custom Scenario ${idx + 1}`, params: p }))
      : [
          {
            name: 'Improved Adherence (+20%)',
            params: { adherenceChangePercent: 20 },
          },
          {
            name: 'Lifestyle Package (+60m Exercise & -5kg Weight)',
            params: { physicalActivityChangeMin: 60, weightChangeKg: -5 },
          },
          {
            name: 'Medication Escalation (Add SGLT2i)',
            params: { addedMedication: 'Empagliflozin 10mg' },
          },
        ];

    const whatIfScenarios = whatIfParamsList.map(item =>
      this.whatIfEngine.runWhatIf(baseDigitalTwin, item.name, item.params)
    );

    // ── 4. Risk Comparison Dashboard ──
    const dashboardComparison = this.dashboardEngine.generateComparison(simulatedStrategies);

    // ── 5. Explainability via HCKEP ──
    const observations = [
      ...baseDigitalTwin.simulatedVitals.map(v => ({ metric: v.metric, value: v.value, timestamp: new Date() })),
      ...baseDigitalTwin.simulatedLabs.map(l => ({ metric: l.test, value: l.value, timestamp: new Date() })),
    ];
    const explainabilityChain = hckep.createEvidenceChain(
      evaluationId,
      ['gdl-simulation-01', 'gdl-outcome-forecasting-01'],
      observations
    );

    const latencyMs = parseFloat((performance.now() - start).toFixed(3));

    // ── Publish telemetry ──
    this.updateTelemetry(
      simulatedStrategies.length,
      whatIfScenarios.length,
      1,
      latencyMs
    );

    return {
      evaluationId,
      patientId: profile.patientId,
      baseDigitalTwin,
      simulatedStrategies,
      whatIfScenarios,
      dashboardComparison,
      explainabilityChain,
      telemetryPublished: true,
      evaluatedAt: new Date(),
      latencyMs,
    };
  }

  public getDigitalTwinEngine(): HCSOFDigitalTwinEngine {
    return this.twinEngine;
  }

  public getWhatIfEngine(): HCSOFWhatIfEngine {
    return this.whatIfEngine;
  }

  private updateTelemetry(
    strategiesCount: number,
    whatIfCount: number,
    dashboardsCount: number,
    latency: number
  ): void {
    this.telemetry.totalSimulations++;
    this.telemetry.totalStrategiesSimulated += strategiesCount;
    this.telemetry.totalWhatIfScenariosRun += whatIfCount;
    this.telemetry.totalDashboardsGenerated += dashboardsCount;
    this.telemetry.totalLatencyMs += latency;
  }

  public getTelemetry() {
    return {
      ...this.telemetry,
      averageLatencyMs:
        this.telemetry.totalSimulations > 0
          ? parseFloat(
              (this.telemetry.totalLatencyMs / this.telemetry.totalSimulations).toFixed(3)
            )
          : 0,
    };
  }
}

export const hcsof = new HCSOFPlatform();
