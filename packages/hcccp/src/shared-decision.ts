// ============================================================================
// HCCCP – Capability 5: Shared Decision Support Interface
// ============================================================================

import crypto from 'node:crypto';
import { ConsensusDecision, DecisionVote, MultidisciplinaryRole } from './types';

export class HCCCPSharedDecisionSupportInterface {
  private decisionStore: Map<string, ConsensusDecision> = new Map();

  /**
   * Initiate a shared multi-clinician decision consensus thread for an AI recommendation.
   */
  public initiateConsensusDecision(
    patientId: string,
    recommendationTitle: string,
    sourceEngine: ConsensusDecision['sourceEngine'] = 'ACDSS'
  ): ConsensusDecision {
    const decisionId = `dec-${crypto.randomUUID().slice(0, 8)}`;
    const decision: ConsensusDecision = {
      decisionId,
      patientId,
      recommendationTitle,
      sourceEngine,
      consensusStatus: 'PENDING_VOTES',
      votes: [],
      createdAt: new Date(),
    };

    this.decisionStore.set(decisionId, decision);
    return decision;
  }

  /**
   * Record a clinician's vote and rationale for the recommendation.
   */
  public recordVote(
    decisionId: string,
    practitionerId: string,
    role: MultidisciplinaryRole,
    vote: DecisionVote,
    rationale: string
  ): ConsensusDecision {
    const decision = this.decisionStore.get(decisionId);
    if (!decision) throw new Error(`Decision thread ${decisionId} not found.`);

    decision.votes.push({ practitionerId, role, vote, rationale });

    // Evaluate consensus state
    const approves = decision.votes.filter(v => v.vote === 'APPROVE').length;
    const rejects = decision.votes.filter(v => v.vote === 'REJECT').length;

    if (approves >= 2) {
      decision.consensusStatus = 'CONSENSUS_REACHED';
      decision.finalRecordedRationale = `Consensus reached with ${approves} approvals: ${rationale}`;
    } else if (rejects >= 2) {
      decision.consensusStatus = 'DISAGREEMENT';
      decision.finalRecordedRationale = `Disagreement recorded with ${rejects} rejections: ${rationale}`;
    }

    this.decisionStore.set(decisionId, decision);
    return decision;
  }

  public getDecision(decisionId: string): ConsensusDecision | undefined {
    return this.decisionStore.get(decisionId);
  }
}
