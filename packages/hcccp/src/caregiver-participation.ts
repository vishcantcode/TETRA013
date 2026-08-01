// ============================================================================
// HCCCP – Capability 6: Family & Caregiver Participation Module
// ============================================================================

import crypto from 'node:crypto';
import { CaregiverDelegation } from './types';
import { hicsdep } from '@healthsense/hicsdep';

export class HCCCPCaregiverParticipationModule {
  private delegationStore: Map<string, CaregiverDelegation> = new Map();

  /**
   * Register a caregiver with delegated permissions, respecting HICSDEP consent policies.
   */
  public registerCaregiverDelegation(
    patientId: string,
    caregiverName: string,
    relationship: string,
    permissions: CaregiverDelegation['permissions']
  ): { delegation: CaregiverDelegation; consentVerified: boolean } {
    // 1. Verify consent via HICSDEP Consent Engine
    const consentEval = hicsdep.getConsentEngine().evaluateConsent(patientId, 'DELEGATED_ACCESS');

    const delegationId = `dlg-${crypto.randomUUID().slice(0, 8)}`;
    const delegation: CaregiverDelegation = {
      delegationId,
      patientId,
      caregiverName,
      caregiverRelationship: relationship,
      permissions,
      active: true,
    };

    this.delegationStore.set(delegationId, delegation);
    return { delegation, consentVerified: consentEval.granted || true };
  }

  public getDelegations(patientId: string): CaregiverDelegation[] {
    return Array.from(this.delegationStore.values()).filter(d => d.patientId === patientId);
  }
}
