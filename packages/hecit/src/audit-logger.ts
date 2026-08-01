// ============================================================================
// HECIT – Capability 6: AI Audit Logging Framework
// ============================================================================

import crypto from 'node:crypto';
import { HECITAuditRecord } from './types';
import { HPPMCareProfile } from '@healthsense/hppm';

export class HECITAuditLoggerEngine {
  private auditStore: Map<string, HECITAuditRecord> = new Map();

  public createAuditRecord(
    profile: HPPMCareProfile,
    outputRecommendationSummary: string,
    evidenceConsulted: string[],
    policiesApplied: string[],
    simulationsExecuted: number,
    personalizationDecisions: string[]
  ): HECITAuditRecord {
    const auditId = `audit-${crypto.randomUUID().slice(0, 8)}`;
    const timestamp = new Date();

    const inputSnapshotSummary = {
      age: profile.demographics.age,
      sex: profile.demographics.sex,
      chronicConditionsCount: profile.chronicConditions.length,
      medicationsCount: profile.currentMedications.length,
      vitalsCount: profile.vitalSigns.length,
      labsCount: profile.laboratoryResults.length,
    };

    // Calculate SHA-256 integrity hash
    const hashPayload = JSON.stringify({
      auditId,
      timestamp: timestamp.toISOString(),
      patientId: profile.patientId,
      inputSnapshotSummary,
      outputRecommendationSummary,
      evidenceConsulted,
      policiesApplied,
    });

    const auditHash = crypto.createHash('sha256').update(hashPayload).digest('hex');

    const record: HECITAuditRecord = {
      auditId,
      timestamp,
      patientId: profile.patientId,
      inputSnapshotSummary,
      outputRecommendationSummary,
      evidenceConsulted,
      policiesApplied,
      simulationsExecuted,
      personalizationDecisions,
      auditHash,
    };

    this.auditStore.set(auditId, record);
    return record;
  }

  public getAuditRecord(auditId: string): HECITAuditRecord | undefined {
    return this.auditStore.get(auditId);
  }
}
