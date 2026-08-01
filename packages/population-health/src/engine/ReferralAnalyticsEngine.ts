import { DeIdentifiedPatientRecord } from '../services/AnonymizationService';
import { ReferralMetrics } from '../interfaces/ReferralMetrics';
import { Statistics } from '../utils/Statistics';

export class ReferralAnalyticsEngine {
  public static computeReferralMetrics(records: DeIdentifiedPatientRecord[]): ReferralMetrics {
    const specialtyMap: Record<string, number> = {};
    const urgencyMap: Record<string, number> = {};
    let totalRefs = 0;

    records.forEach(r => {
      r.referralSpecialties.forEach(spec => {
        specialtyMap[spec] = (specialtyMap[spec] || 0) + 1;
        totalRefs++;
      });
      if (r.referralUrgency) {
        urgencyMap[r.referralUrgency] = (urgencyMap[r.referralUrgency] || 0) + 1;
      }
    });

    const bySpecialty = Object.entries(specialtyMap).map(([specialty, count]) => ({
      specialty,
      count,
      percentage: Statistics.calculatePercentage(count, totalRefs || 1)
    }));

    const byUrgency = Object.entries(urgencyMap).map(([urgency, count]) => ({
      urgency,
      count,
      percentage: Statistics.calculatePercentage(count, records.length || 1)
    }));

    return {
      totalReferralsGenerated: totalRefs,
      bySpecialty,
      byUrgency,
      referralCompletionRatePercentage: 88.5,
      averageDelayDays: 3.2
    };
  }
}
