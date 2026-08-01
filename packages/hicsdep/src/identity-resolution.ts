// ============================================================================
// HICSDEP – Capability 1: Patient Identity Resolution & MPI
// ============================================================================

import crypto from 'node:crypto';
import { MasterPatientIdentity, LinkedIdentifier } from './types';

export class HICSDEPIdentityResolutionService {
  private mpiStore: Map<string, MasterPatientIdentity> = new Map();

  /**
   * Resolve or create a Master Patient Identity from incoming identifiers.
   */
  public resolvePatientIdentity(
    name: { family: string; given: string[] },
    gender: MasterPatientIdentity['gender'],
    birthDate: string,
    identifiers: LinkedIdentifier[]
  ): { masterIdentity: MasterPatientIdentity; isNewlyCreated: boolean } {
    // 1. Search for existing MPI match via linked identifiers
    for (const mpi of this.mpiStore.values()) {
      for (const id of identifiers) {
        if (mpi.linkedIdentifiers.some(l => l.system === id.system && l.value === id.value)) {
          // Found match — reconcile new identifiers if any
          let added = false;
          for (const newId of identifiers) {
            if (!mpi.linkedIdentifiers.some(l => l.system === newId.system && l.value === newId.value)) {
              mpi.linkedIdentifiers.push(newId);
              mpi.reconciliationHistory.push({
                linkedAt: new Date(),
                sourceSystem: newId.assigner,
                identifierValue: newId.value,
              });
              added = true;
            }
          }
          if (added) this.mpiStore.set(mpi.masterPatientId, mpi);
          return { masterIdentity: mpi, isNewlyCreated: false };
        }
      }
    }

    // 2. No match found — create new Master Patient Identity
    const masterPatientId = `mpi-${crypto.randomUUID().slice(0, 8)}`;
    const masterIdentity: MasterPatientIdentity = {
      masterPatientId,
      primaryName: name,
      gender,
      birthDate,
      linkedIdentifiers: [...identifiers],
      reconciliationHistory: identifiers.map(id => ({
        linkedAt: new Date(),
        sourceSystem: id.assigner,
        identifierValue: id.value,
      })),
      active: true,
    };

    this.mpiStore.set(masterPatientId, masterIdentity);
    return { masterIdentity, isNewlyCreated: true };
  }

  public getMasterIdentity(masterPatientId: string): MasterPatientIdentity | undefined {
    return this.mpiStore.get(masterPatientId);
  }
}
