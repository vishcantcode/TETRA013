// ============================================================================
// HPPHI – Preventive & Predictive Health Intelligence
// Shared Types & Interfaces
// ============================================================================

import { HCKEPEvidenceChain } from '@healthsense/hckep';

// ---------------------------------------------------------------------------
// Patient Preventive Profile Input
// ---------------------------------------------------------------------------

export interface HPPHIPatientInput {
  patientId: string;
  age: number;
  sex: 'M' | 'F';
  chronicConditions: string[];
  familyHistory: string[];
  medications: string[];
  allergies: string[];
  lifestyleFactors: {
    smokingStatus: 'NEVER' | 'FORMER' | 'CURRENT';
    alcoholUsePerWeek: number;          // standard drinks
    physicalActivityMinPerWeek: number;
    sleepHoursPerNight: number;
    stressLevel: 'LOW' | 'MODERATE' | 'HIGH';
    dietQuality: 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT';
  };
  vitalSigns: { metric: string; value: number; unit: string }[];
  laboratoryResults: { test: string; value: number; unit: string }[];
  previousScreenings: { screening: string; lastDate: Date; result: string }[];
}

// ---------------------------------------------------------------------------
// Capability 1 – Personalized Preventive Screening
// ---------------------------------------------------------------------------

export type ScreeningPriority = 'ROUTINE' | 'RECOMMENDED' | 'OVERDUE' | 'URGENT';

export interface HPPHIScreeningRecommendation {
  screening: string;
  priority: ScreeningPriority;
  rationale: string;
  suggestedFrequency: string;
  nextDueEstimate: string;
  applicableCriteria: string[];
}

// ---------------------------------------------------------------------------
// Capability 2 – Early Risk Detection
// ---------------------------------------------------------------------------

export type EmergingRiskLevel = 'MINIMAL' | 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH';

export interface HPPHIEmergingRisk {
  condition: string;
  riskLevel: EmergingRiskLevel;
  confidence: number;
  contributingFactors: string[];
  protectiveFactors: string[];
  evidenceReference: string;
}

// ---------------------------------------------------------------------------
// Capability 3 – Longitudinal Preventive Monitoring
// ---------------------------------------------------------------------------

export type MonitoringAlertType = 'BIOMARKER_WORSENING' | 'ADHERENCE_DECLINE' | 'MISSED_SCREENING' | 'RECURRING_PATTERN' | 'RISK_TREND';

export interface HPPHIMonitoringAlert {
  alertType: MonitoringAlertType;
  description: string;
  severity: 'INFO' | 'WARNING' | 'ACTION_REQUIRED';
  metric?: string;
  previousValue?: number;
  currentValue?: number;
  recommendation: string;
}

// ---------------------------------------------------------------------------
// Capability 4 – Lifestyle Optimization
// ---------------------------------------------------------------------------

export type LifestyleDomain = 'NUTRITION' | 'PHYSICAL_ACTIVITY' | 'SLEEP' | 'STRESS_MANAGEMENT' | 'SMOKING_CESSATION' | 'ALCOHOL_REDUCTION';

export interface HPPHILifestyleRecommendation {
  domain: LifestyleDomain;
  recommendation: string;
  rationale: string;
  expectedBenefit: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  evidenceReference: string;
}

// ---------------------------------------------------------------------------
// Capability 5 – Preventive Health Score
// ---------------------------------------------------------------------------

export interface HPPHIHealthScoreComponent {
  factor: string;
  score: number;     // 0-100
  weight: number;    // 0-1
  status: 'STRENGTH' | 'NEUTRAL' | 'WEAKNESS';
  improvementOpportunity?: string;
}

export interface HPPHIPreventiveHealthScore {
  overallScore: number;            // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  components: HPPHIHealthScoreComponent[];
  strengths: string[];
  weaknesses: string[];
  topImprovementActions: string[];
}

// ---------------------------------------------------------------------------
// Capability 6 – Predictive Health Trajectory
// ---------------------------------------------------------------------------

export interface HPPHITrajectoryScenario {
  scenario: 'OPTIMISTIC' | 'EXPECTED' | 'HIGH_RISK';
  description: string;
  keyAssumptions: string[];
  projectedHealthScore: number;
  projectedRisks: string[];
  confidence: number;
  timeHorizon: string;
}

export interface HPPHIPredictiveTrajectory {
  scenarios: HPPHITrajectoryScenario[];
  primaryDrivers: string[];
  mostLikelyOutcome: string;
}

// ---------------------------------------------------------------------------
// Capability 7 – Intervention Impact
// ---------------------------------------------------------------------------

export interface HPPHIInterventionEstimate {
  intervention: string;
  expectedScoreImprovement: number;
  expectedRiskReduction: string;
  assumptions: string[];
  uncertainty: string;
  timeToEffect: string;
}

// ---------------------------------------------------------------------------
// Capability 8 – Population Preventive Insights
// ---------------------------------------------------------------------------

export interface HPPHIPopulationInsight {
  metric: string;
  value: number;
  description: string;
  trend: 'IMPROVING' | 'STABLE' | 'WORSENING';
}

export interface HPPHIPopulationReport {
  totalPatients: number;
  commonPreventiveGaps: { gap: string; percentAffected: number }[];
  screeningCompliance: { screening: string; compliancePercent: number }[];
  populationRiskTrends: HPPHIPopulationInsight[];
  interventionEffectiveness: { intervention: string; successRate: number }[];
}

// ---------------------------------------------------------------------------
// Full HPPHI Evaluation Result
// ---------------------------------------------------------------------------

export interface HPPHIEvaluationResult {
  evaluationId: string;
  patientId: string;
  screeningRecommendations: HPPHIScreeningRecommendation[];
  emergingRisks: HPPHIEmergingRisk[];
  monitoringAlerts: HPPHIMonitoringAlert[];
  lifestyleRecommendations: HPPHILifestyleRecommendation[];
  preventiveHealthScore: HPPHIPreventiveHealthScore;
  predictiveTrajectory: HPPHIPredictiveTrajectory;
  interventionEstimates: HPPHIInterventionEstimate[];
  explainabilityChain: HCKEPEvidenceChain;
  telemetryPublished: boolean;
  evaluatedAt: Date;
  latencyMs: number;
}
