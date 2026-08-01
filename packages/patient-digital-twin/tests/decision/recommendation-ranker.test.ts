import { describe, it, expect } from 'vitest';
import { RecommendationRanker, DecisionCandidate } from '../../src';

describe('EWP-011: RecommendationRanker Pareto Ranking & Tie-Breaking Tests', () => {
  it('ranks candidates in descending order of Net Clinical Value Vc', () => {
    const candA: DecisionCandidate = {
      candidateId: 'cand_A',
      name: 'Option A',
      interventionType: 'fluid_therapy',
      goalScores: [],
      benefitRisk: { benefitScore: 0.9, riskScore: 0.1, contraindicationPenalty: 0, netClinicalValue: 0.75 },
      isContraindicated: false
    };

    const candB: DecisionCandidate = {
      candidateId: 'cand_B',
      name: 'Option B',
      interventionType: 'monitoring',
      goalScores: [],
      benefitRisk: { benefitScore: 0.95, riskScore: 0.05, contraindicationPenalty: 0, netClinicalValue: 0.875 },
      isContraindicated: false
    };

    const ranked = RecommendationRanker.rankCandidates([candA, candB]);

    expect(ranked[0].candidateId).toBe('cand_B');
    expect(ranked[0].rank).toBe(1);
    expect(ranked[1].candidateId).toBe('cand_A');
    expect(ranked[1].rank).toBe(2);
  });
});
