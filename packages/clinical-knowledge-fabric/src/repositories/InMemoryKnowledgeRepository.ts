import { ClinicalConcept, ClinicalRelationship, KnowledgeSnapshot } from '../domain';
import { IKnowledgeRepository } from './IKnowledgeRepository';
import { pool } from '@healthsense/db/src/pool';

export class InMemoryKnowledgeRepository implements IKnowledgeRepository {
  public async seed(snapshots: KnowledgeSnapshot[], concepts: ClinicalConcept[], edges: ClinicalRelationship[]) {
    // For the sake of the interface, we'll perform upserts to PostgreSQL
    for (const snapshot of snapshots) {
      await pool.query(
        'INSERT INTO knowledge_snapshots (id, data, created_at, updated_at) VALUES ($1, $2, NOW(), NOW()) ON CONFLICT (id) DO NOTHING',
        [snapshot.id, snapshot]
      );
    }
    
    for (const concept of concepts) {
      await pool.query(
        'INSERT INTO knowledge_concepts (id, snapshot_id, data, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) ON CONFLICT (id) DO NOTHING',
        [concept.id, snapshots[0].id, concept]
      );
    }
    
    for (const edge of edges) {
      await pool.query(
        'INSERT INTO knowledge_edges (source_id, target_id, snapshot_id, data, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) ON CONFLICT DO NOTHING',
        [edge.sourceConceptId, edge.targetConceptId, snapshots[0].id, edge]
      );
    }
  }

  public async getAllSnapshots(): Promise<KnowledgeSnapshot[]> {
    const res = await pool.query('SELECT data FROM knowledge_snapshots');
    return res.rows.map(r => r.data as KnowledgeSnapshot);
  }

  public async getConcept(conceptId: string, snapshotId: string): Promise<ClinicalConcept | null> {
    const res = await pool.query('SELECT data FROM knowledge_concepts WHERE id = $1 AND snapshot_id = $2', [conceptId, snapshotId]);
    if (res.rows.length === 0) return null;
    return res.rows[0].data as ClinicalConcept;
  }

  public async findConcepts(query: string, snapshotId: string): Promise<ClinicalConcept[]> {
    // Basic search on JSONB data
    const res = await pool.query(
      "SELECT data FROM knowledge_concepts WHERE snapshot_id = $1 AND (data->>'defaultName' ILIKE $2 OR data->>'description' ILIKE $2)",
      [snapshotId, `%${query}%`]
    );
    return res.rows.map(r => r.data as ClinicalConcept);
  }

  public async getEdges(conceptId: string, snapshotId: string): Promise<ClinicalRelationship[]> {
    const res = await pool.query(
      'SELECT data FROM knowledge_edges WHERE source_id = $1 AND snapshot_id = $2',
      [conceptId, snapshotId]
    );
    return res.rows.map(r => r.data as ClinicalRelationship);
  }
}

