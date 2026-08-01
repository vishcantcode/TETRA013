import { DiseaseRiskResult, DiseaseId } from '@healthsense/clinical-intelligence';
import { DiseaseFeatureAttribution, FeatureAttribution } from '../interfaces/FeatureContribution';
import { ImportanceNormalizer } from '../utils/ImportanceNormalizer';

export class FeatureImportanceService {
  public static computeDiseaseAttributions(
    resultsMap: Record<DiseaseId, DiseaseRiskResult>
  ): Record<DiseaseId, DiseaseFeatureAttribution> {
    const keys = Object.keys(resultsMap) as DiseaseId[];
    const attributionsMap: Record<string, DiseaseFeatureAttribution> = {};

    for (const key of keys) {
      const result = resultsMap[key];
      if (!result) continue;

      const rawPositives: FeatureAttribution[] = (result.contributingFactors || []).map(factor => ({
        featureName: factor.metric,
        value: factor.value,
        weightPercentage: factor.impactPercentage,
        direction: 'positive',
        clinicalImpact: factor.rationale
      }));

      const normalizedPositives = ImportanceNormalizer.normalizeAttributions(rawPositives);

      attributionsMap[key] = {
        diseaseId: key,
        diseaseName: result.diseaseName,
        topPositiveContributors: normalizedPositives,
        topNegativeContributors: [],
        missingDataImpact: (result.missingInputs || []).map(input => `Missing ${input} reduces prediction precision.`)
      };
    }

    return attributionsMap as Record<DiseaseId, DiseaseFeatureAttribution>;
  }
}
