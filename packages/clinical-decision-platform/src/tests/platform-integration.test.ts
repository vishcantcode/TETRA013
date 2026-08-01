import { DEMO_PATIENTS } from '@healthsense/clinical-models';
import { UnifiedClinicalOrchestrator } from '../orchestrator/UnifiedClinicalOrchestrator';
import { HealthCheckService } from '../health/HealthCheckService';

export async function runPlatformIntegrationVerification() {
  const orchestrator = new UnifiedClinicalOrchestrator();

  // 1. Verify Platform Health Status
  const healthReport = HealthCheckService.checkHealth();

  // 2. Run End-to-End Evaluation across all 6 demo patient profiles
  const results: Record<string, any> = {};

  for (const [key, bundle] of Object.entries(DEMO_PATIENTS)) {
    const request = {
      patient: bundle.patient,
      vitals: bundle.vitals,
      labs: bundle.labs,
      conditions: bundle.conditions,
      preferredLanguage: 'en' as const
    };

    const finalDecision = await orchestrator.evaluatePatient(request);

    results[key] = {
      evaluationId: finalDecision.evaluationId,
      patientId: finalDecision.patientId,
      durationMs: finalDecision.pipelineDurationMs,
      riskScore: finalDecision.riskAssessment.overallRiskScore,
      riskTier: finalDecision.riskAssessment.overallTier,
      highestPriorityDisease: finalDecision.riskAssessment.highestPriorityDisease.diseaseName,
      confidenceScore: finalDecision.explainabilityReport.confidenceBreakdown.overallConfidence,
      isReferralRequired: finalDecision.referralDecision.isReferralRequired,
      referralUrgency: finalDecision.referralDecision.overallUrgency,
      referralSpecialtiesCount: finalDecision.referralDecision.referrals.length,
      educationLanguage: finalDecision.educationPlan.selectedLanguage,
      digitalTwinVersion: finalDecision.digitalTwin.activeVersion.version,
      populationPrevalenceCount: finalDecision.populationSnapshot.diseasePrevalence.length,
      auditLogId: finalDecision.auditLogId
    };
  }

  return {
    healthReport,
    evaluations: results
  };
}
