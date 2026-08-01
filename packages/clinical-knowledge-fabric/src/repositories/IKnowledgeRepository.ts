import { ClinicalConcept, ClinicalRelationship, KnowledgeSnapshot } from '../domain';

export interface IKnowledgeRepository {
  /**
   * Fetch all snapshots for version resolution.
   */
  getAllSnapshots(): Promise<KnowledgeSnapshot[]>;
  
  /**
   * Fetches the node data.
   */
  getConcept(conceptId: string, snapshotId: string): Promise<ClinicalConcept | null>;

  /**
   * Search for concepts by name or external code.
   */
  findConcepts(query: string, snapshotId: string): Promise<ClinicalConcept[]>;

  /**
   * Fetches the graph edges starting from a given concept.
   */
  getEdges(conceptId: string, snapshotId: string): Promise<ClinicalRelationship[]>;
}
