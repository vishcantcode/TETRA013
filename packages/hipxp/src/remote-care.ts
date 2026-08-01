// ============================================================================
// HIPXP – Capability 4: Remote Care Support Services
// ============================================================================

import crypto from 'node:crypto';
import { HomeVitalsLog, PatientMessage } from './types';

export class HIPXPRemoteCareSupportServices {
  private vitalsLogStore: Map<string, HomeVitalsLog[]> = new Map();
  private messageStore: Map<string, PatientMessage[]> = new Map();

  /**
   * Log home vitals measurement (e.g. smart BP monitor, glucose meter).
   */
  public logHomeVital(patientId: string, metric: HomeVitalsLog['metric'], value: number, unit: string): HomeVitalsLog {
    const logId = `vtl-${crypto.randomUUID().slice(0, 8)}`;
    const log: HomeVitalsLog = {
      logId,
      patientId,
      metric,
      value,
      unit,
      loggedAt: new Date(),
    };

    const existing = this.vitalsLogStore.get(patientId) || [];
    existing.push(log);
    this.vitalsLogStore.set(patientId, existing);
    return log;
  }

  /**
   * Send a secure message to care team or AI companion.
   */
  public sendMessage(patientId: string, sender: PatientMessage['sender'], content: string): PatientMessage {
    const messageId = `msg-${crypto.randomUUID().slice(0, 8)}`;
    const message: PatientMessage = {
      messageId,
      sender,
      content,
      sentAt: new Date(),
    };

    const existing = this.messageStore.get(patientId) || [];
    existing.push(message);
    this.messageStore.set(patientId, existing);
    return message;
  }

  public getHomeVitals(patientId: string): HomeVitalsLog[] {
    return this.vitalsLogStore.get(patientId) || [];
  }

  public getMessages(patientId: string): PatientMessage[] {
    return this.messageStore.get(patientId) || [];
  }
}
