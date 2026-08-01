// ============================================================================
// HICSDEP – Capability 7: Cross-Organization Trust & Registry
// ============================================================================

import { TrustRelationship } from './types';

export class HICSDEPCrossOrgTrustService {
  private trustStore: Map<string, TrustRelationship> = new Map();

  constructor() {
    this.registerDefaultTrustedOrganizations();
  }

  private registerDefaultTrustedOrganizations(): void {
    this.registerOrganization({
      organizationId: 'org-city-hospital',
      organizationName: 'City General Hospital Network',
      npiNumber: '1982736450',
      endpointUrl: 'https://fhir.cityhospital.org/r4',
      trustLevel: 'VERIFIED_TRUSTED',
      certificateFingerprint: 'sha256:4a:89:ef:12:b3:4c:7e:90',
      active: true,
    });

    this.registerOrganization({
      organizationId: 'org-metro-lab',
      organizationName: 'Metro Reference Pathology Lab',
      npiNumber: '1234567890',
      endpointUrl: 'https://api.metrolab.org/fhir',
      trustLevel: 'VERIFIED_TRUSTED',
      certificateFingerprint: 'sha256:9f:12:34:ab:cd:ef:00:11',
      active: true,
    });
  }

  public registerOrganization(rel: TrustRelationship): void {
    this.trustStore.set(rel.organizationId, rel);
  }

  public isOrganizationTrusted(organizationId: string): boolean {
    const rel = this.trustStore.get(organizationId);
    return rel ? rel.trustLevel === 'VERIFIED_TRUSTED' && rel.active : false;
  }

  public getOrganization(organizationId: string): TrustRelationship | undefined {
    return this.trustStore.get(organizationId);
  }
}
