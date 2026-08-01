// ============================================================================
// HICSDEP – Capability 2: Consent Management Engine
// ============================================================================

import crypto from 'node:crypto';
import { PatientConsent, ConsentScope, ConsentStatus } from './types';

export class HICSDEPConsentManagerEngine {
  private consentStore: Map<string, PatientConsent> = new Map();

  /**
   * Register a new patient consent policy.
   */
  public createConsent(
    patientId: string,
    scope: ConsentScope,
    durationDays = 365,
    authorizedOrganizationId?: string,
    authorizedPractitionerId?: string
  ): PatientConsent {
    const consentId = `cns-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date();
    const effectiveTo = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const consent: PatientConsent = {
      consentId,
      patientId,
      scope,
      status: 'ACTIVE',
      authorizedOrganizationId,
      authorizedPractitionerId,
      effectiveFrom: now,
      effectiveTo,
    };

    this.consentStore.set(consentId, consent);
    return consent;
  }

  /**
   * Revoke an existing consent policy.
   */
  public revokeConsent(consentId: string, reason = 'Patient explicit revocation'): PatientConsent {
    const consent = this.consentStore.get(consentId);
    if (!consent) throw new Error(`Consent record ${consentId} not found.`);

    consent.status = 'REVOKED';
    consent.revokedAt = new Date();
    consent.revokedReason = reason;

    this.consentStore.set(consentId, consent);
    return consent;
  }

  /**
   * Evaluate if active, unexpired consent exists for a given scope.
   */
  public evaluateConsent(patientId: string, scope: ConsentScope): { granted: boolean; activeConsent?: PatientConsent } {
    const now = new Date();
    const activeConsents = Array.from(this.consentStore.values()).filter(
      c => c.patientId === patientId && c.scope === scope
    );

    for (const c of activeConsents) {
      if (c.status === 'ACTIVE' && now >= c.effectiveFrom && now <= c.effectiveTo) {
        return { granted: true, activeConsent: c };
      }
    }

    return { granted: false };
  }
}
