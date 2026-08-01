import { UnifiedRiskAssessment } from '@healthsense/clinical-intelligence';
import { CompleteExplainabilityReport } from '@healthsense/clinical-explainability';
import { ReferralDecision } from '../interfaces/ReferralDecision';
import { ReferralItem } from '../interfaces/ReferralSummary';
import { SpecialistMatcher } from '../services/SpecialistMatcher';
import { ServiceRequestBuilder } from '../services/ServiceRequestBuilder';
import { FollowupScheduleService } from '../services/FollowupScheduleService';
import { UrgencyEngine } from './UrgencyEngine';

export class ReferralEngine {
  private urgencyEngine = new UrgencyEngine();

  public evaluateReferral(
    assessment: UnifiedRiskAssessment,
    explainabilityReport?: CompleteExplainabilityReport
  ): ReferralDecision {
    const patientId = assessment.patientId;
    const isReferralRequired = assessment.overallRiskScore >= 35;
    const overallPriority = this.urgencyEngine.evaluateUrgency(assessment);

    const matchedReasons = SpecialistMatcher.matchSpecialists(assessment);
    const referralItems: ReferralItem[] = matchedReasons.map(reason => {
      const itemPriority = this.urgencyEngine.evaluateUrgency(assessment);
      const fhirServiceRequest = ServiceRequestBuilder.buildServiceRequest(patientId, reason, itemPriority.category);

      const topCitations = explainabilityReport?.guidelineCitations || [];

      return {
        id: fhirServiceRequest.id,
        specialty: reason.targetSpecialty,
        priority: itemPriority,
        reason,
        evidence: {
          clinicalBiomarkers: [
            { metric: 'HbA1c', value: assessment.snapshot.features.hba1c ?? 'N/A' },
            { metric: 'Systolic BP', value: assessment.snapshot.features.systolicBP ?? 'N/A' },
            { metric: 'eGFR', value: assessment.snapshot.features.egfr ?? 'N/A' }
          ],
          highestContributingRiskFactors: [assessment.highestPriorityDisease.diseaseName],
          triggeredGuidelines: topCitations.map(c => ({ source: c.source, title: c.title, section: c.section })),
          confidenceScore: assessment.overallConfidenceScore
        },
        fhirServiceRequest
      };
    });

    const followupPlan = FollowupScheduleService.generatePlan(assessment);

    const summaryNote = isReferralRequired
      ? `Referral recommended for ${referralItems.map(r => r.specialty).join(', ')} with priority ${overallPriority.category}.`
      : 'No specialist referral required. Continue routine outpatient monitoring.';

    return {
      patientId,
      evaluatedAt: new Date().toISOString(),
      isReferralRequired,
      overallUrgency: overallPriority.category,
      referrals: referralItems,
      followupPlan,
      conflictResolutionNotes: overallPriority.urgencyExplanation,
      summaryNote
    };
  }
}

export const referralEngine = new ReferralEngine();
