// ============================================================================
// HEAGCP – Capability 1: Organization Management Center
// ============================================================================

import crypto from 'node:crypto';
import { TenantOrganization } from './types';

export class HEAGCPOrganizationManagementCenter {
  private orgStore: Map<string, TenantOrganization> = new Map();

  constructor() {
    this.seedDefaultOrganizations();
  }

  private seedDefaultOrganizations(): void {
    const orgs: TenantOrganization[] = [
      {
        orgId: 'org-metrohealth',
        name: 'MetroHealth Integrated Hospital System',
        type: 'HOSPITAL_NETWORK',
        facilitiesCount: 8,
        activeUsersCount: 1450,
        primaryBranding: { primaryColor: '#0052CC', logoUrl: 'https://cdn.healthsense.io/logos/metrohealth.png' },
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      },
      {
        orgId: 'org-valleyclinic',
        name: 'Valley Care Community Clinics',
        type: 'COMMUNITY_HEALTH',
        facilitiesCount: 3,
        activeUsersCount: 280,
        primaryBranding: { primaryColor: '#00875A', logoUrl: 'https://cdn.healthsense.io/logos/valleycare.png' },
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      },
    ];

    for (const o of orgs) {
      this.orgStore.set(o.orgId, o);
    }
  }

  public registerOrganization(
    name: string,
    type: TenantOrganization['type'],
    primaryColor = '#0052CC'
  ): TenantOrganization {
    const orgId = `org-${crypto.randomUUID().slice(0, 8)}`;
    const org: TenantOrganization = {
      orgId,
      name,
      type,
      facilitiesCount: 1,
      activeUsersCount: 0,
      primaryBranding: { primaryColor, logoUrl: `https://cdn.healthsense.io/logos/${orgId}.png` },
      createdAt: new Date(),
    };

    this.orgStore.set(orgId, org);
    return org;
  }

  public getOrganizations(): TenantOrganization[] {
    return Array.from(this.orgStore.values());
  }

  public getOrganization(orgId: string): TenantOrganization | undefined {
    return this.orgStore.get(orgId);
  }
}
