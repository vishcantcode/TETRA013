// ============================================================================
// HCSOF – Capability 5: Digital Twin Simulation Layer
// ============================================================================

import crypto from 'node:crypto';
import { DigitalTwinState } from './types';
import { HPPMCareProfile } from '@healthsense/hppm';
import { hcpi } from '@healthsense/hcpi';

export class HCSOFDigitalTwinEngine {
  /**
   * Create an isolated Digital Twin snapshot from a patient's HPPM profile or HCPI context.
   * Guarantees strict separation between real patient state and simulated projection state.
   */
  public createSnapshot(profile: HPPMCareProfile): DigitalTwinState {
    const twinId = `twin-${crypto.randomUUID().slice(0, 8)}`;
    const longitudinal = hcpi.analyzePatientLongitudinal(profile.patientId);

    return {
      twinId,
      patientId: profile.patientId,
      isIsolated: true, // STRICT ISOLATION GUARD
      simulatedVitals: profile.vitalSigns.map(v => ({ ...v })),
      simulatedLabs: profile.laboratoryResults.map(l => ({ ...l })),
      simulatedLifestyle: {
        adherencePercent: profile.adherenceHistory.medicationAdherencePercent,
        physicalActivityMinPerWeek: profile.lifestyleSnapshot.physicalActivityMinPerWeek,
        smokingStatus: profile.lifestyleSnapshot.smokingStatus,
        dietQuality: profile.lifestyleSnapshot.dietQuality,
        sleepHoursPerNight: profile.lifestyleSnapshot.sleepHoursPerNight,
      },
      simulatedMedications: [...profile.currentMedications],
      simulatedRiskScore: longitudinal.riskEvolution.currentRiskScore,
      snapshotTimestamp: new Date(),
    };
  }

  /**
   * Clone a twin state for scenario experimentation without modifying the original twin.
   */
  public cloneSnapshot(twin: DigitalTwinState): DigitalTwinState {
    return {
      ...twin,
      twinId: `twin-${crypto.randomUUID().slice(0, 8)}`,
      isIsolated: true,
      simulatedVitals: twin.simulatedVitals.map(v => ({ ...v })),
      simulatedLabs: twin.simulatedLabs.map(l => ({ ...l })),
      simulatedLifestyle: { ...twin.simulatedLifestyle },
      simulatedMedications: [...twin.simulatedMedications],
      snapshotTimestamp: new Date(),
    };
  }
}
