// ============================================================================
// HPOIP – Population Health & Operational Intelligence Platform
// Shared Types & Interfaces
// ============================================================================

import { HCQSGEvaluationResult } from '@healthsense/hcqsg';

export interface PopulationCohort {
  cohortId: string;
  name: string; // e.g. "Hypertension High Risk", "Type 2 Diabetes", "Heart Failure HFrEF"
  totalPatientsCount: number;
  highRiskCount: number;
  preventiveCompliancePercent: number;
  averageAge: number;
  topCareGapsCount: number;
}

export interface CareGap {
  gapId: string;
  cohortId: string;
  title: string;
  affectedPatientsCount: number;
  urgency: 'CRITICAL' | 'HIGH' | 'ROUTINE';
  recommendedAction: string;
}

export interface OperationalMetricsSummary {
  activePatientsInSystem: number;
  bedOccupancyRatePercent: number;
  appointmentUtilizationPercent: number;
  averageWaitTimeMin: number;
  bottleneckedDepartments: string[];
  clinicianWorkloadIndex: number; // 0.0 - 1.0
}

export interface EnterpriseQualityKPIs {
  preventiveScreeningRatePercent: number;
  followUpCompletionPercent: number;
  medicationAdherenceRatePercent: number;
  carePlanCompletionRatePercent: number;
  overallGovernanceGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  hcqsgGovernanceSummary?: HCQSGEvaluationResult;
}

export interface PopulationAIInsight {
  insightId: string;
  category: 'EMERGING_RISK' | 'UNDERSERVED_COHORT' | 'RESOURCE_BOTTLENECK' | 'PREVENTIVE_OPPORTUNITY';
  title: string;
  description: string;
  impactScore: number; // 0 - 100
  confidenceScore: number; // 0.0 - 1.0
  recommendedIntervention: string;
  sourceEngine: string;
}

export interface CapacityPlanningScenario {
  scenarioId: string;
  name: string;
  projectedDemandIncreasePercent: number;
  staffingAdjustmentFTE: number;
  simulatedWaitTimeMin: number;
  simulatedBedOccupancyPercent: number;
  feasible: boolean;
}

export interface ExecutiveCommandCenterView {
  organizationId: string;
  organizationName: string;
  totalPopulationManaged: number;
  activeCohortsCount: number;
  operationalMetrics: OperationalMetricsSummary;
  qualityKPIs: EnterpriseQualityKPIs;
  topInsights: PopulationAIInsight[];
  aiExecutiveSummary: string;
  generatedAt: Date;
}

export interface EnterpriseReportSnapshot {
  reportId: string;
  title: string;
  format: 'JSON' | 'CSV' | 'PDF_SUMMARY';
  generatedBy: string;
  snapshotData: Record<string, any>;
  createdAt: Date;
}
