import { FeatureAttribution } from '../interfaces/FeatureContribution';

export class ImportanceNormalizer {
  public static normalizeAttributions(attributions: FeatureAttribution[]): FeatureAttribution[] {
    if (!attributions.length) return [];
    const totalRawWeight = attributions.reduce((acc, curr) => acc + curr.weightPercentage, 0);
    if (totalRawWeight === 0) return attributions;

    return attributions.map(attr => ({
      ...attr,
      weightPercentage: Math.round((attr.weightPercentage / totalRawWeight) * 100)
    }));
  }
}
