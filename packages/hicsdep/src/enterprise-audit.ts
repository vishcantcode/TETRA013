// ============================================================================
// HICSDEP – Capability 8: Immutable Enterprise Audit Framework
// ============================================================================

import crypto from 'node:crypto';
import { AuditRecord } from './types';

export class HICSDEPEnterpriseAuditFramework {
  private auditLog: AuditRecord[] = [];

  /**
   * Log an immutable security & governance audit record.
   */
  public logAudit(
    category: AuditRecord['category'],
    actorId: string,
    action: string,
    outcome: AuditRecord['outcome'],
    details: string,
    patientId?: string
  ): AuditRecord {
    const auditId = `aud-${crypto.randomUUID().slice(0, 8)}`;
    const record: AuditRecord = {
      auditId,
      category,
      actorId,
      patientId,
      action,
      outcome,
      details,
      timestamp: new Date(),
    };

    this.auditLog.push(record);
    return record;
  }

  public getAuditTrail(patientId?: string): AuditRecord[] {
    if (!patientId) return [...this.auditLog];
    return this.auditLog.filter(a => a.patientId === patientId);
  }
}
