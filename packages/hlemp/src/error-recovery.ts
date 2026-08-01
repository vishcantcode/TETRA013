// ============================================================================
// HLEMP – Capability 7: Error Recovery & Dead-Letter Queue Services
// ============================================================================

import crypto from 'node:crypto';
import { HL7DeadLetterEntry } from './types';

export class HLEMPErrorRecoveryServices {
  private deadLetterStore: Map<string, HL7DeadLetterEntry> = new Map();

  /**
   * Move a failed HL7 message into the Dead-Letter Queue (DLQ).
   */
  public moveToDeadLetterQueue(messageId: string, rawMessage: string, failureReason: string): HL7DeadLetterEntry {
    const deadLetterId = `dlq-${crypto.randomUUID().slice(0, 8)}`;
    const entry: HL7DeadLetterEntry = {
      deadLetterId,
      messageId,
      rawMessage,
      failureReason,
      failedAt: new Date(),
      status: 'PENDING_REVIEW',
    };

    this.deadLetterStore.set(deadLetterId, entry);
    return entry;
  }

  /**
   * Retrieve all dead-letter queue entries.
   */
  public getDeadLetterQueue(): HL7DeadLetterEntry[] {
    return Array.from(this.deadLetterStore.values());
  }

  /**
   * Update status of a dead-letter entry after operator review or reprocessing.
   */
  public updateStatus(deadLetterId: string, status: HL7DeadLetterEntry['status'], operatorNotes?: string): HL7DeadLetterEntry {
    const entry = this.deadLetterStore.get(deadLetterId);
    if (!entry) throw new Error(`Dead letter entry ${deadLetterId} not found.`);

    entry.status = status;
    if (operatorNotes) entry.operatorNotes = operatorNotes;

    this.deadLetterStore.set(deadLetterId, entry);
    return entry;
  }
}
