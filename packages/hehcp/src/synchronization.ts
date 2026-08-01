// ============================================================================
// HEHCP – Capability 2: Synchronization Engine
// ============================================================================

import crypto from 'node:crypto';
import { SynchronizationRecord } from './types';

export class HEHCPSynchronizationEngine {
  private syncStore: Map<string, SynchronizationRecord> = new Map();
  private processedKeys: Set<string> = new Set(); // Idempotency guard

  /**
   * Perform incremental synchronization for a clinical entity with idempotency check.
   */
  public synchronizeEntity(
    patientId: string,
    entityType: SynchronizationRecord['entityType'],
    sourceVersion: string,
    idempotencyKey: string
  ): { syncRecord: SynchronizationRecord; isDuplicate: boolean } {
    if (this.processedKeys.has(idempotencyKey)) {
      const existingKey = Array.from(this.syncStore.values()).find(
        s => s.patientId === patientId && s.entityType === entityType
      );
      return {
        syncRecord: existingKey || {
          syncId: 'sync-dup',
          entityType,
          patientId,
          sourceVersion,
          healthsenseVersion: 'v1.0.0',
          syncedAt: new Date(),
          status: 'IN_SYNC',
        },
        isDuplicate: true,
      };
    }

    this.processedKeys.add(idempotencyKey);
    const syncId = `sync-${crypto.randomUUID().slice(0, 8)}`;

    const syncRecord: SynchronizationRecord = {
      syncId,
      entityType,
      patientId,
      sourceVersion,
      healthsenseVersion: `hs-v${Date.now()}`,
      syncedAt: new Date(),
      status: 'IN_SYNC',
    };

    this.syncStore.set(syncId, syncRecord);
    return { syncRecord, isDuplicate: false };
  }

  public getSyncHistory(patientId: string): SynchronizationRecord[] {
    return Array.from(this.syncStore.values()).filter(s => s.patientId === patientId);
  }
}
