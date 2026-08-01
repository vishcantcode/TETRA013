// ============================================================================
// HEAGCP – Capability 3: Role, Policy & Permission Management
// ============================================================================

import { EnterpriseRolePolicy } from './types';
import { MultidisciplinaryRole } from '@healthsense/hcccp';
import { hpie } from '@healthsense/hpie';

export class HEAGCPRolePolicyManagementEngine {
  private policyStore: Map<string, EnterpriseRolePolicy> = new Map();

  constructor() {
    this.seedDefaultPolicies();
  }

  private seedDefaultPolicies(): void {
    const defaultPolicies: EnterpriseRolePolicy[] = [
      {
        roleId: 'pol-physician-default',
        roleName: 'Attending Physician Policy',
        baseRole: 'PHYSICIAN',
        allowedCapabilities: ['ORDER_MEDICATIONS', 'SIGN_DISCHARGE', 'VIEW_AI_DIAGNOSTICS', 'OVERRIDE_SAFETY_ALERTS'],
        abacRules: [{ attribute: 'department', operator: 'EQUALS', value: 'Cardiology' }],
        emergencyOverrideAllowed: true,
      },
      {
        roleId: 'pol-nurse-default',
        roleName: 'Clinical Nurse Policy',
        baseRole: 'NURSE',
        allowedCapabilities: ['ADMINISTER_MEDICATIONS', 'LOG_VITALS', 'POST_CARE_NOTES', 'ACKNOWLEDGE_HANDOFFS'],
        abacRules: [{ attribute: 'facility', operator: 'EQUALS', value: 'Main Hospital' }],
        emergencyOverrideAllowed: false,
      },
    ];

    for (const p of defaultPolicies) {
      this.policyStore.set(p.roleId, p);
    }
  }

  public getPolicy(roleId: string): EnterpriseRolePolicy | undefined {
    return this.policyStore.get(roleId);
  }

  public getPolicies(): EnterpriseRolePolicy[] {
    return Array.from(this.policyStore.values());
  }
}
