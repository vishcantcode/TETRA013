// ============================================================================
// HCSOF – Clinical Simulation & Outcome Forecasting Platform
// Shared Types & Interfaces
// ============================================================================

import { HCKEPEvidenceChain } from '@healthsense/hckep';
import { HPPMCareProfile } from '@healthsense/hppm';

// ---------------------------------------------------------------------------
// Capability 5 – Digital Twin State
// ---------------------------------------------------------------------------

export interface DigitalTwinState {
  twinId: string;
  patientId: string;
  isIsolated: boolean; // Must always be true to prevent mutating real patient record
  simulatedVitals: { metric: string; value: number; unit: string }[];
  simulatedLabs: { test: string; value: number; unit: string }[];
  simulatedLifestyle: {
    adherencePercent: number;
    physicalActivityMinPerWeek: number;
    smokingStatus: 'NEVER' | 'FORMER' | 'CURRENT';
    dietQuality: 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT';
    sleepHoursPerNight: number;
  };
  simulatedMedications: string[];
  simulatedRiskScore: number;
  snapshotTimestamp: Date;
}

// ---------------------------------------------------------------------------
// Capability 6 – What-If Analysis
// ---------------------------------------------------------------------------

export interface WhatIfParameters {
  adherenceChangePercent?: number;       // e.g. +20 or -15
  physicalActivityChangeMin?: number;    // e.g. +60
  weightChangeKg?: number;               // e.g. -5
  smokingCessation?: boolean;            // true
  addedMedication?: string;
  discontinuedMedication?: string;
}

export interface WhatIfResult {
  scenarioName: string;
  parametersApplied: WhatIfParameters;
  simulatedTwinState: DigitalTwinState;
  predictedImpact: {
    bpChangeSystolic: number;
    hba1cChangePercent: number;
    ldlChangeMgDl: number;
    cvdRiskChangePercent: number;
    overallScoreDelta: number;
  };
  confidence: number;
  explanation: string;
}

// ---------------------------------------------------------------------------
// Capability 2 – Outcome Forecasting & Trajectory
// ---------------------------------------------------------------------------

export interface ScenarioForecast {
  scenario: 'OPTIMISTIC' | 'EXPECTED' | 'CONSERVATIVE';
  predictedBpSystolic: number;
  predictedHbA1c: number;
  predictedLdl: number;
  predictedBmi: number;
  predictedCvdRiskPercent: number;
  diseaseProgressionRisk: 'LOW' | 'MODERATE' | 'HIGH';
  confidence: number;
  uncertaintyDescription: string;
}

export interface MetricForecast {
  metric: string;
  baseline: number;
  optimistic: number;
  expected: number;
  conservative: number;
  unit: string;
}

// ---------------------------------------------------------------------------
// Capability 4 – Timeline Forecasting
// ---------------------------------------------------------------------------

export interface TimelineMilestone {
  timeframe: '30_DAYS' | '90_DAYS' | '6_MONTHS' | '12_MONTHS';
  label: string;
  expectedBiomarkers: { metric: string; expectedValue: number; unit: string }[];
  recommendedClinicalActions: string[];
  reviewPoints: string[];
}

export interface PatientTimelineForecast {
  timeHorizon: string;
  milestones: TimelineMilestone[];
}

// ---------------------------------------------------------------------------
// Capability 1 & 3 – Multi-Strategy & Intervention Comparison
// ---------------------------------------------------------------------------

export interface CareStrategyStep {
  stepNumber: number;
  category: 'LIFESTYLE' | 'MEDICATION' | 'MONITORING' | 'REFERRAL';
  action: string;
  targetTimeline: string;
}

export interface CareStrategyDefinition {
  strategyId: string;
  strategyName: string;
  description: string;
  steps: CareStrategyStep[];
}

export interface StrategySimulationResult {
  strategyId: string;
  strategyName: string;
  forecasts: ScenarioForecast[];
  metricForecasts: MetricForecast[];
  timeline: PatientTimelineForecast;
  expectedBenefits: string[];
  potentialRisks: string[];
  uncertaintyScore: number; // 0-1
  evidenceStrength: 'HIGH' | 'MODERATE' | 'LOW';
  patientSuitabilityScore: number; // 0-100
  evidenceReferences: string[];
}

// ---------------------------------------------------------------------------
// Capability 7 – Risk Comparison Dashboard Backend
// ---------------------------------------------------------------------------

export interface SideBySideComparison {
  strategiesCompared: StrategySimulationResult[];
  recommendedStrategyId: string;
  rankingRationale: string;
  tradeOffSummary: string[];
}

// ---------------------------------------------------------------------------
// Full HCSOF Evaluation Result
// ---------------------------------------------------------------------------

export interface HCSOFEvaluationResult {
  evaluationId: string;
  patientId: string;
  baseDigitalTwin: DigitalTwinState;
  simulatedStrategies: StrategySimulationResult[];
  whatIfScenarios: WhatIfResult[];
  dashboardComparison: SideBySideComparison;
  explainabilityChain: HCKEPEvidenceChain;
  telemetryPublished: boolean;
  evaluatedAt: Date;
  latencyMs: number;
}
