// ============================================================================
// HHIF – Capability 1: FHIR Resource Framework
// ============================================================================

import crypto from 'node:crypto';
import { FHIRResource, FHIRMeta } from './types';

export class HHIFFHIRResourceFramework {
  private resourceStore: Map<string, FHIRResource> = new Map();

  /**
   * Serialize a FHIR resource to JSON string.
   */
  public serialize(resource: FHIRResource): string {
    return JSON.stringify(resource, null, 2);
  }

  /**
   * Deserialize a JSON string to a typed FHIR resource.
   */
  public deserialize<T extends FHIRResource>(jsonString: string): T {
    const parsed = JSON.parse(jsonString);
    if (!parsed.resourceType) {
      throw new Error('Invalid FHIR payload: missing required "resourceType" property.');
    }
    return parsed as T;
  }

  /**
   * Store or update a FHIR resource with lifecycle metadata and versioning.
   */
  public saveResource<T extends FHIRResource>(resource: T, sourceModule = 'HHIF'): T {
    const resourceId = resource.id || `${resource.resourceType.toLowerCase()}-${crypto.randomUUID().slice(0, 8)}`;
    const existing = this.resourceStore.get(resourceId);

    const currentVersionId = existing?.meta?.versionId
      ? (parseInt(existing.meta.versionId, 10) + 1).toString()
      : '1';

    const meta: FHIRMeta = {
      ...resource.meta,
      versionId: currentVersionId,
      lastUpdated: new Date().toISOString(),
      source: sourceModule,
    };

    const saved: T = {
      ...resource,
      id: resourceId,
      meta,
    };

    this.resourceStore.set(resourceId, saved);
    return saved;
  }

  /**
   * Retrieve a stored FHIR resource by ID.
   */
  public getResource<T extends FHIRResource>(resourceId: string): T | undefined {
    return this.resourceStore.get(resourceId) as T | undefined;
  }

  /**
   * List all stored FHIR resources of a specific resourceType.
   */
  public listResourcesByType<T extends FHIRResource>(resourceType: string): T[] {
    const results: T[] = [];
    for (const res of this.resourceStore.values()) {
      if (res.resourceType === resourceType) {
        results.push(res as T);
      }
    }
    return results;
  }
}
