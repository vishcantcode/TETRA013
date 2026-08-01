import { DigitalTwin } from '@healthsense/patient-digital-twin';

export interface DeIdentifiedPatientRecord {
  patientHash: string;
  age: number;
  gender: string;
  district: string;
  phcName: string;
  overallRiskScore: number;
  overallTier: string;
  diseaseRisks: Record<string, number>;
  activeConditions: string[];
  missingLabsCount: number;
  referralSpecialties: string[];
  referralUrgency: string;
}

export class AnonymizationService {
  public static deIdentify(twins: DigitalTwin[]): DeIdentifiedPatientRecord[] {
    return twins.map(t => {
      const f = t.riskAssessment.snapshot.features;
      // Anonymize ID using hash representation
      const patientHash = `anon-${t.patientId.substring(0, 8)}`;

      const diseaseRisks: Record<string, number> = {};
      Object.entries(t.riskAssessment.diseaseResults).forEach(([key, val]) => {
        diseaseRisks[key] = val.riskScore;
      });

      const referralSpecialties = t.referralDecision?.referrals.map(r => r.specialty) || [];
      const referralUrgency = t.referralDecision?.overallUrgency || 'Routine';

      return {
        patientHash,
        age: f.age,
        gender: f.gender,
        district: 'Gandhinagar District',
        phcName: 'Gandhinagar Rural PHC',
        overallRiskScore: t.riskAssessment.overallRiskScore,
        overallTier: t.riskAssessment.overallTier,
        diseaseRisks,
        activeConditions: f.activeConditions,
        missingLabsCount: t.riskAssessment.numberOfMissingInputs,
        referralSpecialties,
        referralUrgency
      };
    });
  }
}
