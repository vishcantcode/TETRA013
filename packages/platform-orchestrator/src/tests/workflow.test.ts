import { DEMO_PATIENTS } from '@healthsense/clinical-models';
import { WorkflowManager } from '../WorkflowManager';
import { HealthMonitor } from '../HealthMonitor';
import { MetricsAggregator } from '../Metrics';

export async function runEnterpriseOrchestrationVerification() {
  const manager = new WorkflowManager();

  // 1. Verify Platform Health Status
  const health = HealthMonitor.checkPlatformHealth();

  // 2. Execute End-to-End API Gateway Handler across all 6 demo patient profiles
  const apiResponses: Record<string, any> = {};

  for (const [key, bundle] of Object.entries(DEMO_PATIENTS)) {
    const input = {
      patient: bundle.patient,
      vitals: bundle.vitals,
      labs: bundle.labs,
      conditions: bundle.conditions,
      preferredLanguage: 'en' as const
    };

    const response = await manager.handleClinicalAnalysis(input);

    apiResponses[key] = {
      statusCode: response.statusCode,
      success: response.success,
      executionId: response.executionId,
      totalDurationMs: `${response.telemetryTrace.totalDurationMs} ms`,
      riskScore: response.data.riskAssessment?.overallRiskScore,
      riskTier: response.data.riskAssessment?.overallTier,
      isReferralRequired: response.data.referralDecision?.isReferralRequired,
      referralUrgency: response.data.referralDecision?.overallUrgency,
      educationLanguage: response.data.educationPlan?.selectedLanguage,
      digitalTwinVersion: response.data.digitalTwin?.activeVersion.version,
      populationPrevalenceCount: response.data.populationSnapshot?.diseasePrevalence.length,
      warningsCount: response.warnings.length,
      errorsCount: response.errors.length
    };
  }

  // 3. System Metrics
  const systemMetrics = MetricsAggregator.getMetrics();

  return {
    healthStatus: health.status,
    systemMetrics,
    evaluations: apiResponses
  };
}
