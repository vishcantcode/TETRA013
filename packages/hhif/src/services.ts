// ============================================================================
// HHIF – Capability 6: Interoperability Services & FHIR Bundle Builder
// ============================================================================

import crypto from 'node:crypto';
import { FHIRResource, FHIRBundle, FHIRBundleEntry } from './types';
import { HHIFFHIRResourceFramework } from './fhir-resources';
import { HHIFFHIRValidatorEngine } from './validator';

export class HHIFInteroperabilityServices {
  private framework = new HHIFFHIRResourceFramework();
  private validator = new HHIFFHIRValidatorEngine();

  /**
   * Build a FHIR Bundle (transaction, batch, or collection) from an array of FHIR resources.
   */
  public createBundle(
    resources: FHIRResource[],
    bundleType: FHIRBundle['type'] = 'transaction'
  ): FHIRBundle {
    const entries: FHIRBundleEntry[] = resources.map(res => ({
      fullUrl: `urn:uuid:${res.id || crypto.randomUUID()}`,
      resource: res,
    }));

    return {
      resourceType: 'Bundle',
      id: `bundle-${crypto.randomUUID().slice(0, 8)}`,
      type: bundleType,
      total: entries.length,
      entry: entries,
    };
  }

  /**
   * Import and validate a FHIR payload string.
   */
  public importPayload(jsonPayload: string): { resources: FHIRResource[]; validationPassed: boolean } {
    const deserialized = this.framework.deserialize<FHIRResource>(jsonPayload);
    let resources: FHIRResource[] = [];

    if (deserialized.resourceType === 'Bundle') {
      const bundle = deserialized as FHIRBundle;
      resources = bundle.entry?.map(e => e.resource).filter(Boolean) as FHIRResource[] || [];
    } else {
      resources = [deserialized];
    }

    let allValid = true;
    for (const res of resources) {
      const vReport = this.validator.validate(res);
      if (!vReport.isValid) allValid = false;
      this.framework.saveResource(res, 'FHIR_IMPORT');
    }

    return { resources, validationPassed: allValid };
  }

  /**
   * Export stored resources as a FHIR Bundle JSON string.
   */
  public exportBundleJson(resources: FHIRResource[]): string {
    const bundle = this.createBundle(resources, 'collection');
    return this.framework.serialize(bundle);
  }
}
