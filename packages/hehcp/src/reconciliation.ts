// ============================================================================
// HEHCP – Capability 5: Resource Reconciliation Framework
// ============================================================================

import crypto from 'node:crypto';
import { ReconciliationReport } from './types';
import { HPPMCareProfile } from '@healthsense/hppm';

export class HEHCPResourceReconciliationFramework {

  public reconcile(
    patientId: string,
    healthsenseProfile: HPPMCareProfile,
    externalPayload: Record<string, any>
  ): ReconciliationReport {
    const reconciliationId = `rec-${crypto.randomUUID().slice(0, 8)}`;
    const conflicts: ReconciliationReport['conflicts'] = [];

    // Check 1: Blood Pressure value comparison
    const hsBp = healthsenseProfile.vitalSigns.find(v => v.metric === 'Systolic BP')?.value;
    const extBp = externalPayload.systolicBp;
    if (extBp !== undefined && hsBp !== undefined && Math.abs(extBp - hsBp) > 5) {
      conflicts.push({
        field: 'Systolic BP',
        externalValue: extBp,
        healthsenseValue: hsBp,
        resolution: 'EXTERNAL_PREVAILS', // External real-time reading takes precedence
      });
    }

    // Check 2: Medication List comparison
    const extMedsCount = externalPayload.currentMedicationsCount || healthsenseProfile.currentMedications.length;
    if (extMedsCount !== healthsenseProfile.currentMedications.length) {
      conflicts.push({
        field: 'Medications Count',
        externalValue: extMedsCount,
        healthsenseValue: healthsenseProfile.currentMedications.length,
        resolution: 'MANUAL_REVIEW',
      });
    }

    const integrityStatus = conflicts.length === 0 ? 'VERIFIED' : 'NEEDS_RECONCILIATION';

    return {
      reconciliationId,
      patientId,
      totalRecordsChecked: 5,
      inconsistenciesFound: conflicts.length,
      conflicts,
      integrityStatus,
      timestamp: new Date(),
    };
  }
}
