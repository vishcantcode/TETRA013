// ============================================================================
// HCCCP – Capability 2: Secure Clinical Communication Platform
// ============================================================================

import crypto from 'node:crypto';
import { ClinicalThread, ClinicalThreadMessage, MultidisciplinaryRole } from './types';

export class HCCCPClinicalCommunicationPlatform {
  private threadStore: Map<string, ClinicalThread> = new Map();

  /**
   * Create a new contextual clinical communication thread linked to a patient or FHIR resource.
   */
  public createThread(patientId: string, topic: string, contextResource?: string): ClinicalThread {
    const threadId = `thd-${crypto.randomUUID().slice(0, 8)}`;
    const thread: ClinicalThread = {
      threadId,
      patientId,
      topic,
      contextResource,
      messages: [],
      createdAt: new Date(),
    };

    this.threadStore.set(threadId, thread);
    return thread;
  }

  /**
   * Post a threaded message with @mentions and clinical annotations.
   */
  public postMessage(
    threadId: string,
    authorId: string,
    authorRole: MultidisciplinaryRole,
    content: string,
    annotations?: { targetResource: string; annotationText: string }[]
  ): ClinicalThreadMessage {
    const thread = this.threadStore.get(threadId);
    if (!thread) throw new Error(`Clinical thread ${threadId} not found.`);

    const messageId = `msg-${crypto.randomUUID().slice(0, 8)}`;
    const mentions = (content.match(/@[\w-]+/g) || []).map(m => m.trim());

    const message: ClinicalThreadMessage = {
      messageId,
      threadId,
      authorId,
      authorRole,
      content,
      mentions,
      clinicalAnnotations: annotations,
      sentAt: new Date(),
    };

    thread.messages.push(message);
    this.threadStore.set(threadId, thread);
    return message;
  }

  public getThread(threadId: string): ClinicalThread | undefined {
    return this.threadStore.get(threadId);
  }

  public getThreadsForPatient(patientId: string): ClinicalThread[] {
    return Array.from(this.threadStore.values()).filter(t => t.patientId === patientId);
  }
}
