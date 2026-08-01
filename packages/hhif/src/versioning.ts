// ============================================================================
// HHIF – Capability 5: Resource Versioning & Provenance
// ============================================================================

import crypto from 'node:crypto';
import { FHIRResource, FHIRProvenanceRecord } from './types';

export class HHIFVersioningEngine {
  private provenanceStore: Map<string, FHIRProvenanceRecord[]> = new Map();

  /**
   * Record a provenance entry for a resource modification / creation.
   */
  public recordProvenance(
    resource: FHIRResource,
    action: FHIRProvenanceRecord['action'],
    originatingModule = 'HHIF',
    agent = 'HealthSense Interoperability Engine'
  ): FHIRProvenanceRecord {
    const provenanceId = `prov-${crypto.randomUUID().slice(0, 8)}`;
    const record: FHIRProvenanceRecord = {
      provenanceId,
      targetResourceId: resource.id || 'unknown',
      targetResourceType: resource.resourceType,
      recorded: new Date(),
      agent,
      originatingModule,
      action,
    };

    const targetKey = `${resource.resourceType}/${resource.id}`;
    const history = this.provenanceStore.get(targetKey) || [];
    history.push(record);
    this.provenanceStore.set(targetKey, history);

    return record;
  }

  /**
   * Get complete provenance modification history for a resource.
   */
  public getProvenanceHistory(resourceType: string, resourceId: string): FHIRProvenanceRecord[] {
    const targetKey = `${resourceType}/${resourceId}`;
    return this.provenanceStore.get(targetKey) || [];
  }
}
