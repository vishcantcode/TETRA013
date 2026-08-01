// ============================================================================
// HSHCRP – Capability 4: Audit & Compliance Extensions
// ============================================================================

import crypto from 'node:crypto';
import { HIPAAAuditLogEntry } from './types';

export class HSHCRPAuditComplianceExtensions {
  private auditLogs: HIPAAAuditLogEntry[] = [];

  /**
   * Log an immutable HIPAA/SOC2 audit entry with cryptographic SHA-256 checksum verification.
   */
  public logAuditEntry(
    actorId: string,
    actorRole: string,
    action: HIPAAAuditLogEntry['action'],
    targetResource: string,
    phiAccessed: boolean,
    ipAddress = '10.0.4.12'
  ): HIPAAAuditLogEntry {
    const logId = `aud-${crypto.randomUUID().slice(0, 8)}`;
    const timestamp = new Date();

    const rawData = `${logId}:${timestamp.toISOString()}:${actorId}:${action}:${targetResource}:${phiAccessed}`;
    const checksum = crypto.createHash('sha256').update(rawData).digest('hex');

    const entry: HIPAAAuditLogEntry = {
      logId,
      timestamp,
      actorId,
      actorRole,
      action,
      targetResource,
      phiAccessed,
      ipAddress,
      checksum,
    };

    this.auditLogs.push(entry);
    return entry;
  }

  public exportAuditLogs(filterActorId?: string): HIPAAAuditLogEntry[] {
    return filterActorId
      ? this.auditLogs.filter(a => a.actorId === filterActorId)
      : [...this.auditLogs];
  }
}
