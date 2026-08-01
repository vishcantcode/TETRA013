import { describe, it, expect, beforeEach } from 'vitest';
import { ActiveContext } from '../src/context/ActiveContext';
import { InMemoryKnowledgeRepository } from '../src/repositories/InMemoryKnowledgeRepository';
import { VersionManager } from '../src/services/VersionManager';
import { RelationshipTraversalService } from '../src/services/RelationshipTraversalService';
import { ClinicalConcept, ClinicalRelationship, KnowledgeSnapshot } from '../src/domain';

describe('Clinical Knowledge Fabric', () => {
  let repository: InMemoryKnowledgeRepository;
  let versionManager: VersionManager;
  let traversalService: RelationshipTraversalService;

  beforeEach(() => {
    repository = new InMemoryKnowledgeRepository();
    versionManager = new VersionManager(repository);
    traversalService = new RelationshipTraversalService(repository, versionManager);

    const snapshotV1: KnowledgeSnapshot = {
      id: 'snap-1',
      version: '1.0.0',
      effectiveFrom: new Date('2024-01-01'),
      hash: 'verified_abc123'
    };

    const concepts: ClinicalConcept[] = [
      { id: 'C1', type: 'MEDICATION', defaultName: 'Drug A', metadata: { version: '1', effectiveFrom: new Date(), author: 'sys' }, evidence: [], terminology: [] },
      { id: 'C2', type: 'DISEASE', defaultName: 'Disease B', metadata: { version: '1', effectiveFrom: new Date(), author: 'sys' }, evidence: [], terminology: [] }
    ];

    const edges: ClinicalRelationship[] = [
      { id: 'E1', sourceConceptId: 'C1', targetConceptId: 'C2', type: 'CONTRAINDICATES', severityWeight: 1.0, evidence: [] }
    ];

    repository.seed([snapshotV1], concepts, edges);
  });

  it('should implicitly resolve temporal context and find contraindications', async () => {
    // Act
    const result = await ActiveContext.run({ contextDate: new Date('2024-06-01') }, async () => {
      return traversalService.checkPathExists('C1', 'C2', 'CONTRAINDICATES');
    });

    // Assert
    expect(result).toBe(true);
  });

  it('should throw error if missing ActiveContext', async () => {
    await expect(traversalService.checkPathExists('C1', 'C2', 'CONTRAINDICATES')).rejects.toThrow(/No ActiveContext found/);
  });
});
