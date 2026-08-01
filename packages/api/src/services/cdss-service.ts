/**
 * HealthSense AI CDSS — Service Layer for Patient & Decision Evaluations
 */

import { DEMO_PATIENTS, DemoPatientBundle } from '@healthsense/clinical-models';

export class CDSSService {
  public getAllDemoPatients(): { id: string; name: string; age: number; gender: string; riskTier: string; overallScore: number }[] {
    return Object.values(DEMO_PATIENTS).map(bundle => {
      const birthYear = new Date(bundle.patient.birthDate).getFullYear();
      const age = new Date().getFullYear() - birthYear;
      return {
        id: bundle.patient.id,
        name: bundle.patient.name[0]?.text || 'Unknown',
        age,
        gender: bundle.patient.gender,
        riskTier: bundle.riskAssessment.overallTier,
        overallScore: bundle.riskAssessment.overallRiskScore
      };
    });
  }

  public getPatientBundle(patientId: string): DemoPatientBundle | null {
    return DEMO_PATIENTS[patientId] || DEMO_PATIENTS['patient-diabetes'] || null;
  }
}

export const cdssService = new CDSSService();
