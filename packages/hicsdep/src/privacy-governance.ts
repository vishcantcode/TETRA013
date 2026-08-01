// ============================================================================
// HICSDEP – Capability 6: Privacy Governance Framework
// ============================================================================

import crypto from 'node:crypto';
import { BreakGlassOverride } from './types';

export class HICSDEPPrivacyGovernanceFramework {
  private breakGlassStore: Map<string, BreakGlassOverride> = new Map();

  /**
   * Mask sensitive PHI fields in a clinical record according to minimum necessary access rules.
   */
  public maskSensitivePHI<T extends Record<string, any>>(record: T, maskSSN = true, maskDOB = false): T {
    const masked: any = { ...record };

    if (maskSSN && typeof masked.ssn === 'string') {
      masked.ssn = 'XXX-XX-' + masked.ssn.slice(-4);
    }

    if (maskDOB && typeof masked.birthDate === 'string') {
      masked.birthDate = masked.birthDate.slice(0, 4) + '-XX-XX';
    }

    if (typeof masked.psychiatricNotes === 'string') {
      masked.psychiatricNotes = '[MASKED - RESTRICTED SENSITIVE NOTE]';
    }

    return masked;
  }

  /**
   * Execute an emergency Break-Glass override to bypass standard privacy restrictions in life-critical scenarios.
   */
  public executeBreakGlass(
    patientId: string,
    practitionerId: string,
    reason = 'Acute life-threatening emergency in ICU'
  ): BreakGlassOverride {
    const overrideId = `bg-${crypto.randomUUID().slice(0, 8)}`;
    const override: BreakGlassOverride = {
      overrideId,
      patientId,
      practitionerId,
      reason,
      timestamp: new Date(),
      active: true,
    };

    this.breakGlassStore.set(overrideId, override);
    return override;
  }

  public isBreakGlassActive(patientId: string, practitionerId: string): boolean {
    return Array.from(this.breakGlassStore.values()).some(
      bg => bg.patientId === patientId && bg.practitionerId === practitionerId && bg.active
    );
  }
}
