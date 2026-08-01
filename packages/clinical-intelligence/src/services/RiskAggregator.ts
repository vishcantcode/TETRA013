import { RiskSeverityTier } from '@healthsense/clinical-models';
import { DiseaseRiskResult, DiseaseId } from '../interfaces/RiskModel';
import { UnifiedRiskAssessment } from '../interfaces/EngineResult';
import { PatientSnapshot } from '../interfaces/PatientSnapshot';
import { ConfidenceService } from './ConfidenceService';
import { getRiskTierFromScore } from '../utils/RiskCategory';

export class RiskAggregator {
  public static aggregate(
    snapshot: PatientSnapshot,
    diseaseResultsMap: Record<DiseaseId, DiseaseRiskResult>
  ): UnifiedRiskAssessment {
    const resultsList = Object.values(diseaseResultsMap);

    // 1. Determine Highest Priority Disease
    const sortedByRisk = [...resultsList].sort((a, b) => b.riskScore - a.riskScore);
    const topDisease = sortedByRisk[0] || { diseaseId: 'diabetes', diseaseName: 'Type 2 Diabetes', riskScore: 10, severityTier: 'low' as const };

    // 2. Calculate Overall Risk & Health Scores
    const maxRisk = topDisease.riskScore;
    const avgRisk = resultsList.length > 0 ? resultsList.reduce((acc, r) => acc + r.riskScore, 0) / resultsList.length : 0;
    const overallRiskScore = Math.round(maxRisk * 0.7 + avgRisk * 0.3);
    const overallHealthScore = Math.max(0, 100 - overallRiskScore);
    const overallTier: RiskSeverityTier = getRiskTierFromScore(overallRiskScore);

    // 3. Comorbidity Index (Count of diseases with Moderate, High, or Severe Risk)
    const comorbidityIndex = resultsList.filter(r => r.riskScore >= 50).length;

    // 4. Missing Inputs Count
    const totalMissingInputs = resultsList.reduce((acc, r) => acc + r.missingInputs.length, 0);

    // 5. Overall Confidence Score
    const overallConfidenceScore = ConfidenceService.calculateOverallConfidence(resultsList);

    return {
      patientId: snapshot.patientId,
      evaluatedAt: new Date().toISOString(),
      overallHealthScore,
      overallRiskScore,
      overallTier,
      highestPriorityDisease: {
        diseaseId: topDisease.diseaseId,
        diseaseName: topDisease.diseaseName,
        riskScore: topDisease.riskScore,
        severityTier: topDisease.severityTier
      },
      comorbidityIndex,
      numberOfMissingInputs: totalMissingInputs,
      overallConfidenceScore,
      diseaseResults: diseaseResultsMap,
      snapshot
    };
  }
}
