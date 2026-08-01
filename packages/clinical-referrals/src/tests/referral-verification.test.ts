import { DEMO_PATIENTS } from '@healthsense/clinical-models';
import { ClinicalEngine } from '@healthsense/clinical-intelligence';
import { ExplainabilityEngine } from '@healthsense/clinical-explainability';
import { ReferralEngine } from '../engine/ReferralEngine';

export function runReferralVerification() {
  const clinicalEngine = new ClinicalEngine();
  const explainabilityEngine = new ExplainabilityEngine();
  const referralEngine = new ReferralEngine();

  const results: Record<string, any> = {};

  for (const [key, bundle] of Object.entries(DEMO_PATIENTS)) {
    const assessment = clinicalEngine.evaluatePatient(
      bundle.patient,
      bundle.vitals,
      bundle.labs,
      bundle.conditions,
      [],
      []
    );

    const report = explainabilityEngine.generateReport(assessment);
    const decision = referralEngine.evaluateReferral(assessment, report);

    results[key] = {
      patientId: decision.patientId,
      isReferralRequired: decision.isReferralRequired,
      overallUrgency: decision.overallUrgency,
      specialties: decision.referrals.map(r => r.specialty),
      fhirServiceRequestsCount: decision.referrals.map(r => r.fhirServiceRequest).length,
      fhirResourceTypes: decision.referrals.map(r => r.fhirServiceRequest.resourceType),
      nextAppointmentDays: decision.followupPlan.nextAppointmentDays,
      summaryNote: decision.summaryNote
    };
  }

  return results;
}
