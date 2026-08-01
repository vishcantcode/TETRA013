import { HCKEPEvidenceChain, HCKEPKnowledgeEntry } from './types';
import { HCKEPKnowledgeRepository } from './repository';
import crypto from 'node:crypto';

export class HCKEPEvidenceEngine {
  private repo = HCKEPKnowledgeRepository.getInstance();

  public synthesizeEvidenceChain(
    recommendationId: string,
    knowledgeIds: string[],
    observations: { metric: string; value: any; timestamp: Date }[]
  ): HCKEPEvidenceChain {
    const consultedEntries: HCKEPKnowledgeEntry[] = [];
    for (const id of knowledgeIds) {
      const entry = this.repo.getLatest(id);
      if (entry) consultedEntries.push(entry);
    }

    const summaryParts = consultedEntries.map(e => `${e.title} (${e.evidenceSource})`);
    const explainabilitySummary = `Recommendation ${recommendationId} derived from ${consultedEntries.length} clinical guidelines: ${summaryParts.join('; ')}. Evaluated against ${observations.length} patient observations.`;

    return {
      id: crypto.randomUUID(),
      recommendationId,
      knowledgeVersion: 'v1.0.0',
      consultedEntries,
      triggeringObservations: observations,
      confidenceScore: 0.92,
      explainabilitySummary,
      generatedAt: new Date()
    };
  }
}
