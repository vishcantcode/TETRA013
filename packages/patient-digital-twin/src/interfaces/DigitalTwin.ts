import { TwinVersionSnapshot } from './TwinVersion';
import { HealthState } from './HealthState';
import { BiomarkerHistory } from './BiomarkerState';
import { DigitalTwinTimelineEvent } from './TimelineEvent';
import { TrajectoryProjection } from './Projection';
import { SimulationResult } from './SimulationScenario';
import { UnifiedRiskAssessment } from '@healthsense/clinical-intelligence';
import { CompleteExplainabilityReport } from '@healthsense/clinical-explainability';
import { ReferralDecision } from '@healthsense/clinical-referrals';
import { PersonalizedEducationPlan } from '@healthsense/patient-engagement';

export interface DigitalTwin {
  patientId: string;
  createdAt: string;
  activeVersion: TwinVersionSnapshot;
  healthState: HealthState;
  biomarkerTrends: BiomarkerHistory[];
  timeline: DigitalTwinTimelineEvent[];
  projections: TrajectoryProjection[];
  defaultSimulation: SimulationResult;
  versionHistory: TwinVersionSnapshot[];

  // Upstream Engine Inputs Preserved
  riskAssessment: UnifiedRiskAssessment;
  explainabilityReport?: CompleteExplainabilityReport;
  referralDecision?: ReferralDecision;
  educationPlan?: PersonalizedEducationPlan;
}
