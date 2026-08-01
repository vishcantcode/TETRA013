// ============================================================================
// HLEMP – Capability 5: Message Lifecycle Management & Traceability
// ============================================================================

import crypto from 'node:crypto';
import { HL7MessageLifecycleRecord, HL7ProcessingState, HL7ParsedMessage } from './types';

export class HLEMPLifecycleEngine {
  private lifecycleStore: Map<string, HL7MessageLifecycleRecord> = new Map();

  public createRecord(parsed: HL7ParsedMessage, targetSystem = 'HealthSense Core'): HL7MessageLifecycleRecord {
    const messageId = `msg-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date();

    const record: HL7MessageLifecycleRecord = {
      messageId,
      controlId: parsed.controlId,
      messageType: parsed.messageType,
      triggerEvent: parsed.triggerEvent,
      currentState: 'RECEIVED',
      stateHistory: [{ state: 'RECEIVED', timestamp: now, notes: 'Message received by MLLP/HTTP endpoint' }],
      retriesAttempted: 0,
      maxRetriesAllowed: 3,
      originatingSystem: `${parsed.sendingApplication}/${parsed.sendingFacility}`,
      targetSystem,
      receivedAt: now,
      updatedAt: now,
    };

    this.lifecycleStore.set(messageId, record);
    return record;
  }

  public updateState(messageId: string, newState: HL7ProcessingState, notes?: string): HL7MessageLifecycleRecord {
    const record = this.lifecycleStore.get(messageId);
    if (!record) throw new Error(`Lifecycle record for messageId ${messageId} not found.`);

    const now = new Date();
    record.currentState = newState;
    record.stateHistory.push({ state: newState, timestamp: now, notes });
    record.updatedAt = now;

    if (newState === 'RETRYING') {
      record.retriesAttempted++;
    }

    this.lifecycleStore.set(messageId, record);
    return record;
  }

  public getRecord(messageId: string): HL7MessageLifecycleRecord | undefined {
    return this.lifecycleStore.get(messageId);
  }
}
