import { DigitalTwinTimelineEvent } from '../interfaces/TimelineEvent';
import { UnifiedRiskAssessment } from '@healthsense/clinical-intelligence';
import { ReferralDecision } from '@healthsense/clinical-referrals';

export class TimelineBuilder {
  public static buildTimelineEvents(
    assessment: UnifiedRiskAssessment,
    referralDecision?: ReferralDecision
  ): DigitalTwinTimelineEvent[] {
    const events: DigitalTwinTimelineEvent[] = [];
    const nowStr = new Date().toISOString().split('T')[0];

    // 1. Diagnosis Events
    assessment.snapshot.features.activeConditions.forEach(cond => {
      events.push({
        id: `ev-diag-${cond.toLowerCase().replace(/\s+/g, '-')}`,
        timestamp: '2025-01-15',
        category: 'Diagnosis',
        title: `Active Condition Recorded: ${cond}`,
        description: `Confirmed diagnosis recorded in electronic patient history.`,
        severity: 'moderate'
      });
    });

    // 2. Lab Report Event
    events.push({
      id: `ev-lab-${Date.now()}`,
      timestamp: nowStr,
      category: 'Lab Report',
      title: 'Laboratory Panel Uploaded',
      description: `Observed ${assessment.snapshot.rawResourcesCount.observations} lab/vital readings.`,
      severity: assessment.overallTier
    });

    // 3. Risk Change Event
    events.push({
      id: `ev-risk-${Date.now()}`,
      timestamp: nowStr,
      category: 'Risk Change',
      title: `Multi-Disease Risk Re-evaluated: ${assessment.overallTier.toUpperCase()}`,
      description: `Highest risk driver: ${assessment.highestPriorityDisease.diseaseName} (${assessment.highestPriorityDisease.riskScore}%).`,
      severity: assessment.overallTier
    });

    // 4. Referral & Follow-up Events
    if (referralDecision && referralDecision.isReferralRequired) {
      referralDecision.referrals.forEach(ref => {
        events.push({
          id: `ev-ref-${ref.specialty.toLowerCase()}`,
          timestamp: nowStr,
          category: 'Referral',
          title: `Specialist Referral Generated: ${ref.specialty}`,
          description: `Urgency: ${ref.priority.category}. Reason: ${ref.reason.primaryDiagnosis}`,
          severity: ref.priority.category === 'Emergency' ? 'severe' : 'high'
        });
      });
    }

    return events.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }
}
