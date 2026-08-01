import { ClinicalConcept } from '../domain';
import { IKnowledgeRepository } from '../repositories/IKnowledgeRepository';
import { VersionManager } from './VersionManager';
import { ActiveContext } from '../context/ActiveContext';

export class ConceptResolutionService {
  constructor(
    private readonly repository: IKnowledgeRepository,
    private readonly versionManager: VersionManager
  ) {}

  public async resolve(query: string): Promise<ClinicalConcept[]> {
    const ctx = ActiveContext.get();
    const snapshot = await this.versionManager.resolveSnapshot(ctx.contextDate);
    
    return this.repository.findConcepts(query, snapshot.id);
  }

  public async getById(conceptId: string): Promise<ClinicalConcept | null> {
    const ctx = ActiveContext.get();
    const snapshot = await this.versionManager.resolveSnapshot(ctx.contextDate);
    
    return this.repository.getConcept(conceptId, snapshot.id);
  }
}
