import { TwinRepositoryDB } from '@healthsense/db';
import { TwinFactory, LongitudinalContextEngine } from '@healthsense/patient-digital-twin';

export class HCIPDigitalTwinSync {
  private twinRepo = new TwinRepositoryDB();
  private contextEngine = new LongitudinalContextEngine();

  public async synchronizeFinding(patientId: string, findingData: any): Promise<{ twinVersion: number; updatedState: any }> {
    let twinRecord = await this.twinRepo.findByPatientId(patientId);
    let twin: any;
    if (!twinRecord) {
      twin = TwinFactory.createInitial(patientId);
    } else {
      twin = {
        patientId: twinRecord.patient_id,
        version: twinRecord.version,
        state: twinRecord.state,
        clinicalHistory: twinRecord.clinical_history,
        snapshots: twinRecord.snapshots
      };
    }

    const delta = this.contextEngine.computeDelta(twin, findingData);
    const updatedTwin = this.contextEngine.applyDelta(twin, delta);

    const version = updatedTwin.currentVersion || (updatedTwin as any).version || 1;
    const state = updatedTwin.profile || (updatedTwin as any).state || {};
    const clinicalHistory = updatedTwin.clinicalHistory || [];
    const snapshots = updatedTwin.snapshots || [];

    await this.twinRepo.saveRecord(patientId, version, state, clinicalHistory, snapshots);

    return {
      twinVersion: version,
      updatedState: state
    };
  }
}
