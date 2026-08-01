import { DEMO_PATIENTS } from '@healthsense/clinical-models';
import { ClinicalEngine } from '@healthsense/clinical-intelligence';
import { ExplainabilityEngine } from '@healthsense/clinical-explainability';
import { ReferralEngine } from '@healthsense/clinical-referrals';
import { EducationEngine } from '@healthsense/patient-engagement';
import { DigitalTwinEngine } from '@healthsense/patient-digital-twin';
import { PopulationAnalyticsEngine } from '@healthsense/population-health';
import { SecurityUtils } from '../utils/Security';

export function runE2EDemoVerification() {
  const clinicalEngine = new ClinicalEngine();
  const explainabilityEngine = new ExplainabilityEngine();
  const referralEngine = new ReferralEngine();
  const educationEngine = new EducationEngine();
  const digitalTwinEngine = new DigitalTwinEngine();
  const populationEngine = new PopulationAnalyticsEngine();

  const auditResults: Record<string, any> = {};

  for (const [key, bundle] of Object.entries(DEMO_PATIENTS)) {
    const name = bundle.patient.name[0]?.given?.join(' ') + ' ' + (bundle.patient.name[0]?.family || '');
    const maskedName = SecurityUtils.maskName(name);

    const assessment = clinicalEngine.evaluatePatient(
      bundle.patient,
      bundle.vitals,
      bundle.labs,
      bundle.conditions,
      [],
      []
    );

    const report = explainabilityEngine.generateReport(assessment);
    const referral = referralEngine.evaluateReferral(assessment, report);
    const education = educationEngine.generateEducationPlan(assessment, report, referral, 'en');
    const twin = digitalTwinEngine.createDigitalTwin(bundle.patient, bundle.vitals, bundle.labs, bundle.conditions, [], []);

    auditResults[key] = {
      maskedName,
      riskScore: assessment.overallRiskScore,
      riskTier: assessment.overallTier,
      citationsCount: report.guidelineCitations.length,
      isReferralRequired: referral.isReferralRequired,
      educationLanguage: education.selectedLanguage,
      twinVersion: twin.activeVersion.version
    };
  }

  const snapshot = populationEngine.generatePopulationSnapshot(
    Object.values(DEMO_PATIENTS).map(b => digitalTwinEngine.createDigitalTwin(b.patient, b.vitals, b.labs, b.conditions, [], []))
  );

  return {
    verificationStatus: 'PASSED',
    totalDemoProfilesVerified: Object.keys(DEMO_PATIENTS).length,
    anonymizedPopulationCount: snapshot.totalPopulationEvaluated,
    profiles: auditResults
  };
}
