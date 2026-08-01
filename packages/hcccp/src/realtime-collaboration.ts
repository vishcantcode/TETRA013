// ============================================================================
// HCCCP – Capability 7: Real-Time Collaboration Services
// ============================================================================

import { RealTimePresenceStatus, ClinicianPresence, MultidisciplinaryRole } from './types';

export class HCCCPRealTimeCollaborationServices {
  private presenceStore: Map<string, RealTimePresenceStatus> = new Map();

  public updatePresence(
    practitionerId: string,
    name: string,
    role: MultidisciplinaryRole,
    presence: ClinicianPresence,
    activePatientId?: string
  ): RealTimePresenceStatus {
    const status: RealTimePresenceStatus = {
      practitionerId,
      name,
      role,
      presence,
      currentActivePatientId: activePatientId,
      lastActiveAt: new Date(),
    };

    this.presenceStore.set(practitionerId, status);
    return status;
  }

  public getActivePresencesForPatient(patientId: string): RealTimePresenceStatus[] {
    return Array.from(this.presenceStore.values()).filter(
      p => p.currentActivePatientId === patientId && p.presence !== 'OFFLINE'
    );
  }
}
