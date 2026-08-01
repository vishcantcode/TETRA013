export interface AuditEntry {
  auditId: string;
  patientId: string;
  action: string;
  timestamp: string;
  details: string;
}

export class AuditLogger {
  private logs: AuditEntry[] = [];

  public logAction(patientId: string, action: string, details: string): string {
    const auditId = `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const entry: AuditEntry = {
      auditId,
      patientId,
      action,
      timestamp: new Date().toISOString(),
      details
    };
    this.logs.push(entry);
    return auditId;
  }

  public getLogs(): AuditEntry[] {
    return [...this.logs];
  }
}

export const globalAuditLogger = new AuditLogger();
