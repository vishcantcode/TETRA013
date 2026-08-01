import { DiseaseRiskResult } from '@healthsense/clinical-intelligence';
import { DiseaseFeatureAttribution, FeatureAttribution } from '../interfaces/FeatureContribution';
import { ImportanceNormalizer } from '../utils/ImportanceNormalizer';

export class FeatureImportanceService {
  public static computeDiseaseAttributions(
    resultsMap: Record<'diabetes' | 'hypertension' | 'ckd' | 'cvd' | 'stroke', DiseaseRiskResult>
  ): Record<'diabetes' | 'hypertension' | 'ckd' | 'cvd' | 'stroke', DiseaseFeatureAttribution> {
    const keys: ('diabetes' | 'hypertension' | 'ckd' | 'cvd' | 'stroke')[] = ['diabetes', 'hypertension', 'ckd', 'cvd', 'stroke'];
    const attributionsMap: any = {};

    for (const key of keys) {
      const result = resultsMap[key];
      const rawPositives: FeatureAttribution[] = result.contributingFactors.map(factor => ({
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
        missingDataImpact: result.missingInputs.map(input => `Missing ${input} reduces prediction precision.`)
      };
    }

    return attributionsMap;
  }
}
