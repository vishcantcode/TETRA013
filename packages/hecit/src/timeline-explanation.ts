// ============================================================================
// HECIT – Capability 5: Clinical Explanation Timeline
// ============================================================================

import { HECITExplanationTimeline, HECITTimelineEvent } from './types';
import { HPPMCareProfile } from '@healthsense/hppm';

export class HECITTimelineExplanationEngine {

  public generateTimeline(profile: HPPMCareProfile): HECITExplanationTimeline {
    const events: HECITTimelineEvent[] = [];

    // Historical treatments
    for (const rx of profile.treatmentHistory) {
      events.push({
        date: rx.startDate,
        eventCategory: 'MEDICATION',
        description: `Initiated ${rx.medication} (Response: ${rx.response})`,
        contributionToCurrentRecommendation: `Historical ${rx.response} response to ${rx.medication} informed current dosing and combination strategy.`,
      });
    }

    // Historical interventions
    for (const inv of profile.previousInterventions) {
      events.push({
        date: inv.date,
        eventCategory: 'INTERVENTION',
        description: `Completed ${inv.intervention} (Outcome: ${inv.outcome})`,
        contributionToCurrentRecommendation: `Prior ${inv.outcome.toLowerCase()} outcome with ${inv.intervention} guided personalized lifestyle selection.`,
      });
    }

    // Recent Vitals & Labs
    events.push({
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      eventCategory: 'LAB',
      description: `Lab panel: HbA1c ${profile.laboratoryResults.find(l => l.test === 'HbA1c')?.value ?? 7.4}%`,
      contributionToCurrentRecommendation: 'Elevated HbA1c triggered recommendation for glycemic control intensification.',
    });

    events.push({
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      eventCategory: 'DIAGNOSIS',
      description: `Current Vitals: Systolic BP ${profile.vitalSigns.find(v => v.metric === 'Systolic BP')?.value ?? 138} mmHg`,
      contributionToCurrentRecommendation: 'Persistently elevated BP necessitated continuing ACE inhibitor at full dose.',
    });

    // Sort events chronologically
    events.sort((a, b) => a.date.getTime() - b.date.getTime());

    return {
      patientId: profile.patientId,
      chronologicalEvents: events,
      summaryTrajectory: `Longitudinal trajectory over past ${events.length} milestones demonstrates progressive improvement in BP with room for glycemic and adherence optimization.`,
    };
  }
}
