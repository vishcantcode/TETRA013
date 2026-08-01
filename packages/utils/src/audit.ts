/**
 * Clinical Audit Log Payload Formatter
 */

export interface ClinicalAuditEntry {
  id: string;
  timestamp: string;
  clinicianId: string;
  patientId: string;
  action: 'DECISION_EVALUATION' | 'REFERRAL_GENERATED' | 'CARE_PLAN_UPDATED' | 'LAB_UPLOADED';
  summary: string;
  metadata: Record<string, any>;
}

export function createClinicalAuditEntry(
  clinicianId: string,
  patientId: string,
  action: ClinicalAuditEntry['action'],
  summary: string,
  metadata: Record<string, any> = {}
): ClinicalAuditEntry {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    clinicianId,
    patientId,
    action,
    summary,
    metadata
  };
}
