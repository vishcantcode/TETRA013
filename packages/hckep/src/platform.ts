import { HCKEPKnowledgeRepository } from './repository';
import { HCKEPEvidenceEngine } from './evidence';
import { HCKEPKnowledgeEntry, HCKEPEvidenceChain, HCKEPKnowledgeDomain } from './types';

export class HealthSenseClinicalKnowledgeEvidencePlatform {
  private static instance: HealthSenseClinicalKnowledgeEvidencePlatform;
  private repo = HCKEPKnowledgeRepository.getInstance();
  private evidenceEngine = new HCKEPEvidenceEngine();

  public static getInstance(): HealthSenseClinicalKnowledgeEvidencePlatform {
    if (!HealthSenseClinicalKnowledgeEvidencePlatform.instance) {
      HealthSenseClinicalKnowledgeEvidencePlatform.instance = new HealthSenseClinicalKnowledgeEvidencePlatform();
    }
    return HealthSenseClinicalKnowledgeEvidencePlatform.instance;
  }

  public getRepository(): HCKEPKnowledgeRepository {
    return this.repo;
  }

  public getEvidenceEngine(): HCKEPEvidenceEngine {
    return this.evidenceEngine;
  }

  public createEvidenceChain(
    recommendationId: string,
    knowledgeIds: string[],
    observations: { metric: string; value: any; timestamp: Date }[]
  ): HCKEPEvidenceChain {
    return this.evidenceEngine.synthesizeEvidenceChain(recommendationId, knowledgeIds, observations);
  }

  public queryGuidelines(domain: HCKEPKnowledgeDomain): HCKEPKnowledgeEntry[] {
    return this.repo.findByDomain(domain);
  }
}

export const hckep = HealthSenseClinicalKnowledgeEvidencePlatform.getInstance();
