// ============================================================================
// HICSDEP – Capability 5: Data Provenance & Lineage Services
// ============================================================================

import crypto from 'node:crypto';
import { DataProvenanceRecord } from './types';

export class HICSDEPProvenanceServices {
  private provenanceStore: Map<string, DataProvenanceRecord> = new Map();

  /**
   * Create a Data Provenance record for an entity or resource transformation.
   */
  public recordProvenance(
    targetResourceId: string,
    targetResourceType: string,
    originSystem: string,
    authorId: string,
    authorRole: string,
    transformations: string[] = []
  ): DataProvenanceRecord {
    const provenanceId = `prov-${crypto.randomUUID().slice(0, 8)}`;
    const timestamp = new Date();

    const signaturePayload = `${targetResourceId}:${targetResourceType}:${originSystem}:${authorId}:${timestamp.toISOString()}`;
    const digitalSignature = crypto.createHash('sha256').update(signaturePayload).digest('hex');

    const provenance: DataProvenanceRecord = {
      provenanceId,
      targetResourceId,
      targetResourceType,
      originSystem,
      authorId,
      authorRole,
      timestamp,
      digitalSignature,
      transformationHistory: transformations,
    };

    this.provenanceStore.set(provenanceId, provenance);
    return provenance;
  }

  public getProvenanceHistory(targetResourceId: string): DataProvenanceRecord[] {
    return Array.from(this.provenanceStore.values()).filter(p => p.targetResourceId === targetResourceId);
  }
}
