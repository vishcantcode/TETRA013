// ============================================================================
// HPEDEP – Capability 2: Public Platform SDK
// ============================================================================

import { hppm } from '@healthsense/hppm';
import { acdss } from '@healthsense/acdss';
import { hucwp } from '@healthsense/hucwp';
import { hhif } from '@healthsense/hhif';

export class HealthSensePublicSDK {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  public async getPatientCareProfile(patientId: string) {
    return hppm.getCareProfileEngine().buildProfile({ patientId });
  }

  public async evaluateClinicalDecisionSupport(patientId: string) {
    return acdss.evaluateCase({ patientId, symptoms: [], vitalSigns: [], laboratoryResults: [], medications: [], allergies: [], chronicConditions: [], age: 50, sex: 'M' });
  }

  public async getPatientCommandCenterView(patientId: string) {
    return hucwp.getCommandCenterEngine().buildPatientCommandCenterView(patientId);
  }

  public async convertToFHIRResource(resourceType: 'Patient' | 'Observation', data: any) {
    return (hhif as any).getMapperEngine ? (hhif as any).getMapperEngine().mapToFHIR(resourceType, data) : data;
  }
}
