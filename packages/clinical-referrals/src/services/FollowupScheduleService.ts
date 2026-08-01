import { UnifiedRiskAssessment } from '@healthsense/clinical-intelligence';
import { FollowupPlan } from '../interfaces/FollowupPlan';

export class FollowupScheduleService {
  public static generatePlan(assessment: UnifiedRiskAssessment): FollowupPlan {
    const score = assessment.overallRiskScore;
    const f = assessment.snapshot.features;

    let days = 30;
    let timeframeText = '30 Days';

    if (score >= 85) {
      days = 7;
      timeframeText = '7 Days';
    } else if (score >= 60) {
      days = 14;
      timeframeText = '14 Days';
    } else if (score < 30) {
      days = 90;
      timeframeText = '90 Days (3 Months)';
    }

    const repeatInvestigations: string[] = [];
    if (f.hba1c !== null && f.hba1c >= 7.0) repeatInvestigations.push('HbA1c (in 90 days)');
    if (f.egfr !== null && f.egfr < 60) repeatInvestigations.push('eGFR & Serum Creatinine (in 30 days)');
    if (f.uacr === null) repeatInvestigations.push('Urine Albumin-to-Creatinine Ratio (UACR)');

    return {
      nextAppointmentDays: days,
      appointmentTimeframeText: timeframeText,
      repeatInvestigations,
      lifestyleReviewGoals: [
        'Sodium restriction (< 2g/day)',
        '30 mins moderate aerobic exercise 5 days/week',
        'Weight management & dietary glycemic index control'
      ],
      medicationReviewReminder: 'Review medication adherence and dose titration at next visit.',
      monitoringSchedule: [
        { metric: 'Blood Pressure', frequency: score >= 75 ? 'Daily' : 'Weekly' },
        { metric: 'Fasting Blood Glucose', frequency: f.hba1c !== null && f.hba1c >= 7.0 ? 'Twice Weekly' : 'Monthly' }
      ]
    };
  }
}
