// ============================================================================
// HCCCP – Capability 4: Clinical Handoff Framework
// ============================================================================

import crypto from 'node:crypto';
import { StructuredHandoff, HandoffType } from './types';
import { hecit } from '@healthsense/hecit';
import { hppm } from '@healthsense/hppm';

export class HCCCPClinicalHandoffFramework {
  private handoffStore: Map<string, StructuredHandoff> = new Map();

  /**
   * Initiate a structured clinical handoff with AI-generated summary.
   */
  public initiateHandoff(
    patientId: string,
    type: HandoffType,
    outgoingId: string,
    incomingId: string,
    criticalWatchItems: string[]
  ): StructuredHandoff {
    const handoffId = `hdf-${crypto.randomUUID().slice(0, 8)}`;
    const careProfile = hppm.getCareProfileEngine().buildProfile({ patientId });
    const transparencyReport = hecit.evaluateTransparency(careProfile);

    const aiGeneratedSummary = `Handoff Summary for ${patientId}: Active diagnosis Decompensated Heart Failure. ${transparencyReport.clinicianSummary.headlineSummary}`;

    const handoff: StructuredHandoff = {
      handoffId,
      patientId,
      type,
      outgoingPractitionerId: outgoingId,
      incomingPractitionerId: incomingId,
      aiGeneratedSummary,
      criticalWatchItems,
      acknowledgedByIncoming: false,
      transferredAt: new Date(),
    };

    this.handoffStore.set(handoffId, handoff);
    return handoff;
  }

  /**
   * Record formal acknowledgment by incoming clinician.
   */
  public acknowledgeHandoff(handoffId: string): StructuredHandoff {
    const handoff = this.handoffStore.get(handoffId);
    if (!handoff) throw new Error(`Handoff ${handoffId} not found.`);

    handoff.acknowledgedByIncoming = true;
    handoff.acknowledgedAt = new Date();
    this.handoffStore.set(handoffId, handoff);
    return handoff;
  }

  public getHandoffs(patientId: string): StructuredHandoff[] {
    return Array.from(this.handoffStore.values()).filter(h => h.patientId === patientId);
  }
}
