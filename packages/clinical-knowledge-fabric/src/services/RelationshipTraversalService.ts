import { ClinicalRelationship, RelationshipType } from '../domain';
import { IKnowledgeRepository } from '../repositories/IKnowledgeRepository';
import { VersionManager } from './VersionManager';
import { ActiveContext } from '../context/ActiveContext';

export interface GraphQueryOptions {
  maxDepth?: number;
  relationshipTypes?: RelationshipType[];
  minSeverity?: number;
}

export class RelationshipTraversalService {
  constructor(
    private readonly repository: IKnowledgeRepository,
    private readonly versionManager: VersionManager
  ) {}

  public async traverse(startConceptId: string, options?: GraphQueryOptions): Promise<ClinicalRelationship[]> {
    const ctx = ActiveContext.get();
    const snapshot = await this.versionManager.resolveSnapshot(ctx.contextDate);
    
    const maxDepth = options?.maxDepth || 3;
    const types = options?.relationshipTypes;
    const minSev = options?.minSeverity || 0;

    const visited = new Set<string>();
    const results: ClinicalRelationship[] = [];
    
    // BFS Queue: [conceptId, currentDepth]
    const queue: [string, number][] = [[startConceptId, 0]];
    visited.add(startConceptId);

    while (queue.length > 0) {
      const [currentId, depth] = queue.shift()!;
      
      if (depth >= maxDepth) continue;

      const edges = await this.repository.getEdges(currentId, snapshot.id);
      
      for (const edge of edges) {
        if (types && !types.includes(edge.type)) continue;
        if (edge.severityWeight < minSev) continue;

        results.push(edge);

        if (!visited.has(edge.targetConceptId)) {
          visited.add(edge.targetConceptId);
          queue.push([edge.targetConceptId, depth + 1]);
        }
      }
    }

    return results;
  }

  public async checkPathExists(sourceId: string, targetId: string, type: RelationshipType): Promise<boolean> {
    // Simplified: run a traversal and check if target is found
    const edges = await this.traverse(sourceId, { relationshipTypes: [type], maxDepth: 5 });
    return edges.some(e => e.targetConceptId === targetId);
  }
}
