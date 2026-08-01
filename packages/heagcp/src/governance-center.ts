// ============================================================================
// HEAGCP – Capability 5: Enterprise Governance Center
// ============================================================================

import { GovernancePolicyRecord } from './types';
import { hcqsg } from '@healthsense/hcqsg';
import { hppm } from '@healthsense/hppm';

export class HEAGCPEnterpriseGovernanceCenter {
  private governanceStore: Map<string, GovernancePolicyRecord> = new Map();

  constructor() {
    this.seedDefaultGovernance();
  }

  private seedDefaultGovernance(): void {
    const records: GovernancePolicyRecord[] = [
      {
        policyId: 'gov-pol-01',
        title: 'ACDSS Clinical Safety & Diagnostic Model Transparency Policy',
        category: 'AI_SAFETY',
        version: 'v3.2.0',
        approvedBy: 'Clinical Governance Board',
        status: 'ACTIVE',
        effectiveDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      },
      {
        policyId: 'gov-pol-02',
        title: 'HIPAA & HICSDEP Patient Data Privacy & Consent Policy',
        category: 'DATA_PRIVACY',
        version: 'v2.1.0',
        approvedBy: 'Chief Information Security Officer',
        status: 'ACTIVE',
        effectiveDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      },
    ];

    for (const r of records) {
      this.governanceStore.set(r.policyId, r);
    }
  }

  public getGovernancePolicies(): GovernancePolicyRecord[] {
    return Array.from(this.governanceStore.values());
  }

  public evaluateGovernanceCompliance(patientId = 'pt-heagcp-9001') {
    const careProfile = hppm.getCareProfileEngine().buildProfile({ patientId });
    return hcqsg.evaluateGovernance(careProfile);
  }
}
