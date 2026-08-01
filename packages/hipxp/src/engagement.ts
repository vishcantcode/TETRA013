// ============================================================================
// HIPXP – Capability 7: Engagement & Gamification Engine
// ============================================================================

import { PatientAchievement } from './types';

export class HIPXPEngagementEngine {
  private achievementsStore: Map<string, PatientAchievement[]> = new Map();

  constructor() {
    this.seedDefaultAchievements();
  }

  private seedDefaultAchievements(): void {
    const defaultAchievements: PatientAchievement[] = [
      { achievementId: 'ach-1', badgeName: 'Medication Master', description: 'Logged 30 consecutive days of morning medication adherence.', unlockedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), icon: 'pill_streak' },
      { achievementId: 'ach-2', badgeName: 'Wellness Champion', description: 'Completed annual preventive health review.', unlockedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), icon: 'shield_check' },
      { achievementId: 'ach-3', badgeName: 'Active Walker', description: 'Reached 120+ minutes of weekly physical activity.', unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), icon: 'fitness_walk' },
    ];
    this.achievementsStore.set('pt-hipxp-9001', defaultAchievements);
  }

  public getAchievements(patientId: string): PatientAchievement[] {
    return this.achievementsStore.get(patientId) || this.achievementsStore.get('pt-hipxp-9001') || [];
  }
}
