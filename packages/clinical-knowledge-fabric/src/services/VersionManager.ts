import * as crypto from 'crypto';
import { KnowledgeSnapshot } from '../domain';
import { IKnowledgeRepository } from '../repositories/IKnowledgeRepository';

export class VersionManager {
  constructor(private readonly repository: IKnowledgeRepository) {}

  /**
   * Resolves the current contextDate into a specific snapshot ID.
   */
  public async resolveSnapshot(contextDate: Date): Promise<KnowledgeSnapshot> {
    const snapshots = await this.repository.getAllSnapshots();
    
    // Sort descending by effectiveFrom
    snapshots.sort((a, b) => b.effectiveFrom.getTime() - a.effectiveFrom.getTime());

    const activeSnapshot = snapshots.find(s => 
      s.effectiveFrom.getTime() <= contextDate.getTime() &&
      (!s.effectiveTo || s.effectiveTo.getTime() > contextDate.getTime())
    );

    if (!activeSnapshot) {
      throw new Error(`KnowledgeFabricError: No valid KnowledgeSnapshot found for contextDate ${contextDate.toISOString()}`);
    }

    this.verifyIntegrity(activeSnapshot);

    return activeSnapshot;
  }

  /**
   * Tamper Detection logic.
   * In a real implementation, this would recalculate the hash of the snapshot's contents 
   * against the ledger. For this prototype, we mock the validation.
   */
  private verifyIntegrity(snapshot: KnowledgeSnapshot): void {
    const expectedPrefix = 'verified_';
    // Simplified tamper check: ensure hash starts with verified prefix
    if (!snapshot.hash.startsWith(expectedPrefix)) {
       // In reality, this would hash the underlying edges and nodes.
       throw new Error(`KnowledgeIntegrityError: Snapshot ${snapshot.id} failed cryptographic verification.`);
    }
  }
}
