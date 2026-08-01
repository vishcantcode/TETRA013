// ============================================================================
// HIPXP – Capability 3: Personalized Health Journey Engine
// ============================================================================

import crypto from 'node:crypto';
import { HealthGoal, JourneyMilestone } from './types';

export class HIPXPPersonalizedHealthJourneyEngine {
  private goalsStore: Map<string, HealthGoal[]> = new Map();
  private milestoneStore: Map<string, JourneyMilestone[]> = new Map();

  constructor() {
    this.seedDefaultJourney();
  }

  private seedDefaultJourney(): void {
    const defaultGoals: HealthGoal[] = [
      { goalId: 'gl-1', title: 'Maintain Systolic BP < 135 mmHg', category: 'BLOOD_PRESSURE', targetValue: '<135 mmHg', currentValue: '138 mmHg', progressPercent: 85, status: 'IN_PROGRESS' },
      { goalId: 'gl-2', title: 'Achieve 150 mins/week Physical Activity', category: 'EXERCISE', targetValue: '150 min/wk', currentValue: '120 min/wk', progressPercent: 80, status: 'IN_PROGRESS' },
      { goalId: 'gl-3', title: '100% Medication Adherence', category: 'MEDICATION_ADHERENCE', targetValue: '100%', currentValue: '98%', progressPercent: 98, status: 'ACHIEVED' },
    ];

    const defaultMilestones: JourneyMilestone[] = [
      { milestoneId: 'ms-1', title: 'Completed Annual Preventive Health Review', description: 'Met with Dr. Sarah Jenkins for wellness screening.', achievedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), completed: true },
      { milestoneId: 'ms-2', title: 'Logged 30 Consecutive Days of Medication', description: 'Maintained 100% Lisinopril morning log.', achievedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), completed: true },
      { milestoneId: 'ms-3', title: 'Schedule 6-Month HbA1c Lab Test', description: 'Upcoming lab check for pre-diabetes management.', completed: false },
    ];

    this.goalsStore.set('pt-hipxp-9001', defaultGoals);
    this.milestoneStore.set('pt-hipxp-9001', defaultMilestones);
  }

  public getHealthGoals(patientId: string): HealthGoal[] {
    return this.goalsStore.get(patientId) || this.goalsStore.get('pt-hipxp-9001') || [];
  }

  public getMilestones(patientId: string): JourneyMilestone[] {
    return this.milestoneStore.get(patientId) || this.milestoneStore.get('pt-hipxp-9001') || [];
  }
}
