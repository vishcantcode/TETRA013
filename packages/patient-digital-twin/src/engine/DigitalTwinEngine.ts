import { FHIRPatient, FHIRObservation, FHIRCondition, FHIRMedicationRequest, FHIRDiagnosticReport } from '@healthsense/clinical-models';
import { ClinicalEngine, UnifiedRiskAssessment } from '@healthsense/clinical-intelligence';
import { ExplainabilityEngine, CompleteExplainabilityReport } from '@healthsense/clinical-explainability';
import { ReferralEngine, ReferralDecision } from '@healthsense/clinical-referrals';
import { EducationEngine, PersonalizedEducationPlan } from '@healthsense/patient-engagement';
import { DigitalTwin } from '../interfaces/DigitalTwin';
import { VersionManager } from './VersionManager';
import { HealthScoreCalculator } from '../utils/HealthScoreCalculator';
import { RiskTrendCalculator } from '../utils/RiskTrendCalculator';
import { TimelineBuilder } from '../utils/TimelineBuilder';
import { ProjectionMath } from '../utils/ProjectionMath';
import { InterventionSimulator } from './InterventionSimulator';

export class DigitalTwinEngine {
  private clinicalEngine = new ClinicalEngine();
  private explainabilityEngine = new ExplainabilityEngine();
  private referralEngine = new ReferralEngine();
  private educationEngine = new EducationEngine();

  public createDigitalTwin(
    patient: FHIRPatient,
    vitals: FHIRObservation[] = [],
    labs: FHIRObservation[] = [],
    conditions: FHIRCondition[] = [],
    medications: FHIRMedicationRequest[] = [],
    reports: FHIRDiagnosticReport[] = []
  ): DigitalTwin {
    // Step 1: Upstream Pipeline Execution
    const assessment: UnifiedRiskAssessment = this.clinicalEngine.evaluatePatient(patient, vitals, labs, conditions, medications, reports);
    const explainabilityReport: CompleteExplainabilityReport = this.explainabilityEngine.generateReport(assessment);
    const referralDecision: ReferralDecision = this.referralEngine.evaluateReferral(assessment, explainabilityReport);
    const educationPlan: PersonalizedEducationPlan = this.educationEngine.generateEducationPlan(assessment, explainabilityReport, referralDecision, 'en');

    // Step 2: Versioning State Snapshot
    const activeVersion = VersionManager.createVersionSnapshot(
      2,
      'v2 Lab Upload',
      'Ingested latest lab panel and vitals for Digital Twin evaluation',
      ['Biomarker trends calculated', 'Risk progression projections updated']
    );
    const versionHistory = VersionManager.getInitialVersionHistory();

    // Step 3: Health State Calculation
    const healthState = HealthScoreCalculator.calculateHealthState(assessment);

    // Step 4: Time-Series Biomarker Trends
    const biomarkerTrends = RiskTrendCalculator.computeBiomarkerTrends(assessment.snapshot.features);

    // Step 5: Chronological Clinical Timeline
    const timeline = TimelineBuilder.buildTimelineEvents(assessment, referralDecision);

    // Step 6: Disease Progression Trajectories
    const projections = ProjectionMath.calculateProjections(assessment);

    // Step 7: Default What-If Intervention Simulation
    const defaultSimulation = InterventionSimulator.simulate(assessment, {
      hba1cDelta: -1.0,
      systolicBPDelta: -10,
      bmiDelta: -2.0,
      quitSmoking: true
    });

    return {
      patientId: patient.id,
      createdAt: new Date().toISOString(),
      activeVersion,
      healthState,
      biomarkerTrends,
      timeline,
      projections,
      defaultSimulation,
      versionHistory,
      riskAssessment: assessment,
      explainabilityReport,
      referralDecision,
      educationPlan
    };
  }
}

export const digitalTwinEngine = new DigitalTwinEngine();
