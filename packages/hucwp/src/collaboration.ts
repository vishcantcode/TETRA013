// ============================================================================
// HUCWP – Capability 4: Care Team Collaboration Platform
// ============================================================================

import crypto from 'node:crypto';
import { CareTeamNote, ClinicalHandoff, ClinicianRole } from './types';

export class HUCWPCareTeamCollaborationPlatform {
  private noteStore: Map<string, CareTeamNote> = new Map();
  private handoffStore: Map<string, ClinicalHandoff> = new Map();

  /**
   * Post a care team discussion note with @mentions.
   */
  public addNote(
    patientId: string,
    authorId: string,
    authorRole: ClinicianRole,
    content: string
  ): CareTeamNote {
    const noteId = `note-${crypto.randomUUID().slice(0, 8)}`;
    const mentions = (content.match(/@[\w-]+/g) || []).map(m => m.trim());

    const note: CareTeamNote = {
      noteId,
      patientId,
      authorId,
      authorRole,
      content,
      mentions,
      createdAt: new Date(),
    };

    this.noteStore.set(noteId, note);
    return note;
  }

  /**
   * Create a structured clinical handoff record between shifts or practitioners.
   */
  public createHandoff(
    patientId: string,
    outgoingId: string,
    incomingId: string,
    summary: string,
    criticalWatchItems: string[]
  ): ClinicalHandoff {
    const handoffId = `hdf-${crypto.randomUUID().slice(0, 8)}`;
    const handoff: ClinicalHandoff = {
      handoffId,
      patientId,
      outgoingPractitionerId: outgoingId,
      incomingPractitionerId: incomingId,
      summary,
      criticalWatchItems,
      transferredAt: new Date(),
    };

    this.handoffStore.set(handoffId, handoff);
    return handoff;
  }

  public getNotes(patientId: string): CareTeamNote[] {
    return Array.from(this.noteStore.values()).filter(n => n.patientId === patientId);
  }

  public getHandoffs(patientId: string): ClinicalHandoff[] {
    return Array.from(this.handoffStore.values()).filter(h => h.patientId === patientId);
  }
}
