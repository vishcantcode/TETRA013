import { HCPIPatientProfile } from './profile';
import { HCPIRiskEvolution } from './trends';
import { hckep } from '@healthsense/hckep';

export interface HCPIPredictiveInsights {
  hospitalizationLikelihoodPercent: number;
  diseaseProgressionRisk: 'LOW' | 'MODERATE' | 'HIGH';
  followUpAdherenceRisk: 'LOW' | 'MODERATE' | 'HIGH';
  confidenceScore: number;
  supportingEvidenceSummary: string;
}

export class HCPIPredictiveModule {
  public generatePredictiveInsights(profile: HCPIPatientProfile, riskEvolution: HCPIRiskEvolution): HCPIPredictiveInsights {
    const HospPercent = riskEvolution.currentRiskScore > 30 ? 24 : 8;
    const progressionRisk = riskEvolution.currentRiskScore > 30 ? 'HIGH' : riskEvolution.currentRiskScore > 15 ? 'MODERATE' : 'LOW';

    const evidenceChain = hckep.createEvidenceChain(
      `pred-${profile.patientId}`,
      ['gdl-htn-01'],
      [{ metric: 'Longitudinal Risk Score', value: riskEvolution.currentRiskScore, timestamp: new Date() }]
    );

    return {
      hospitalizationLikelihoodPercent: HospPercent,
      diseaseProgressionRisk: progressionRisk,
      followUpAdherenceRisk: profile.adherenceScore < 85 ? 'MODERATE' : 'LOW',
      confidenceScore: evidenceChain.confidenceScore,
      supportingEvidenceSummary: evidenceChain.explainabilitySummary
    };
  }
}
