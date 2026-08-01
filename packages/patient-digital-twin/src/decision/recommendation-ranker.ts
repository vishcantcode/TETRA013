import { DecisionCandidate } from './cdis-types';

export class RecommendationRanker {
  /**
   * Deterministically ranks candidate scenarios in descending order of Net Clinical Value Vc
   * with 3-tier tie-breaking logic matching CDIS v1.0.
   */
  public static rankCandidates(candidates: DecisionCandidate[]): DecisionCandidate[] {
    const sorted = [...candidates].sort((a, b) => {
      const vA = a.benefitRisk.netClinicalValue;
      const vB = b.benefitRisk.netClinicalValue;

      // Tier 1: Net Clinical Value Vc
      if (vA !== vB) {
        return vB - vA;
      }

      // Tier 2: Lower Adverse Risk Score
      const rA = a.benefitRisk.riskScore;
      const rB = b.benefitRisk.riskScore;
      if (rA !== rB) {
        return rA - rB;
      }

      // Tier 3: Lexicographical Candidate ID
      return a.candidateId.localeCompare(b.candidateId);
    });

    // Assign 1-indexed ranks
    return sorted.map((candidate, idx) => ({
      ...candidate,
      rank: idx + 1
    }));
  }
}
