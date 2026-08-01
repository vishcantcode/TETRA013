import { ReferralItem } from '../interfaces/ReferralSummary';
import { CarePathway } from '../interfaces/ReferralSummary';

export class CareCoordinator {
  public static buildCarePathway(patientId: string, referrals: ReferralItem[]): CarePathway {
    const sorted = [...referrals].sort((a, b) => a.priority.recommendedTimeframeDays - b.priority.recommendedTimeframeDays);
    const topSpecialty = sorted[0]?.specialty || 'General Physician';

    return {
      pathwayId: `pathway-${patientId}-${Date.now()}`,
      patientId,
      activeReferralsCount: referrals.length,
      referralItems: sorted,
      primaryPathwayGoal: `Multi-specialty care coordination prioritized by ${topSpecialty} consultation.`
    };
  }
}
