// ============================================================================
// HIVSCIP – Intelligent Validation, Simulation & Continuous Improvement Platform
// Shared Types & Interfaces
// ============================================================================

export type HospitalDepartment =
  | 'OPD'
  | 'EMERGENCY'
  | 'ICU'
  | 'SURGERY'
  | 'RADIOLOGY'
  | 'PHARMACY'
  | 'LABORATORY'
  | 'BILLING'
  | 'DISCHARGE';

export interface SimulatedPatientJourney {
  journeyId: string;
  patientId: string;
  departmentsVisited: HospitalDepartment[];
  totalStayDurationHours: number;
  clinicalOutcome: 'RECOVERED' | 'STABILIZED' | 'TRANSFERRED' | 'DISCHARGED';
  bottlenecksEncountered: string[];
}

export interface AIQualityAssessment {
  modelName: string;
  predictionConfidenceAvg: number; // 0 - 1.0
  explanationConsistencyScore: number; // 0 - 100
  driftDetected: boolean;
  calibrationErrorPercent: number;
  recommendationAccuracyPercent: number;
}

export interface WorkflowValidationReport {
  workflowName: string;
  correctnessPassed: boolean;
  policyCompliancePassed: boolean;
  missingStepsDetected: string[];
  duplicatedStepsDetected: string[];
  failedHandoffsCount: number;
}

export interface DigitalTwinStressReport {
  simulatedPatientVolume: number;
  departmentCongestion: { department: HospitalDepartment; queueLength: number; delayMinutes: number }[];
  maxThroughputPatientsPerHr: number;
  systemBottleneckDepartment: HospitalDepartment;
}

export interface ImprovementRecommendation {
  recommendationId: string;
  category: 'WORKFLOW' | 'AI_MODEL' | 'CONFIGURATION' | 'INFRASTRUCTURE';
  title: string;
  description: string;
  expectedImpact: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  automatedModification: false; // Explicitly false: recommendations are purely advisory
}

export interface RegressionAnalysisResult {
  analysisId: string;
  regressionsFoundCount: number;
  comparedAgainstBaselineId: string;
  anomalies: { subsystem: string; metric: string; baselineValue: number; currentValue: number; deltaPercent: number }[];
  status: 'CLEAN' | 'REGRESSION_DETECTED';
}

export interface SubsystemBenchmarkResult {
  subsystem: string;
  stage: number;
  throughputRPS: number;
  latencyP95Ms: number;
  historicalTrend: 'IMPROVING' | 'STABLE' | 'DECLINING';
}

export interface QualityDashboardView {
  platformHealthIndex: number; // 0 - 100
  aiScore: number;
  workflowScore: number;
  performanceScore: number;
  securityScore: number;
  reliabilityScore: number;
  activeRecommendations: ImprovementRecommendation[];
  latestRegressions: RegressionAnalysisResult;
  generatedAt: Date;
}
