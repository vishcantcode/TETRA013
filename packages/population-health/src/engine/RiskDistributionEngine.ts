import { DeIdentifiedPatientRecord } from '../services/AnonymizationService';
import { RiskTierProportions } from '../interfaces/DiseaseDistribution';
import { Statistics } from '../utils/Statistics';

export class RiskDistributionEngine {
  public static computeRiskProportions(records: DeIdentifiedPatientRecord[]): RiskTierProportions {
    const total = records.length;
    if (total === 0) return { lowPercentage: 0, moderatePercentage: 0, highPercentage: 0, severePercentage: 0 };

    const low = records.filter(r => r.overallTier === 'low').length;
    const moderate = records.filter(r => r.overallTier === 'moderate').length;
    const high = records.filter(r => r.overallTier === 'high').length;
    const severe = records.filter(r => r.overallTier === 'severe').length;

    return {
      lowPercentage: Statistics.calculatePercentage(low, total),
      moderatePercentage: Statistics.calculatePercentage(moderate, total),
      highPercentage: Statistics.calculatePercentage(high, total),
      severePercentage: Statistics.calculatePercentage(severe, total)
    };
  }
}
