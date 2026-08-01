import { DEMO_PATIENTS } from '@healthsense/clinical-models';
import { DigitalTwinEngine } from '@healthsense/patient-digital-twin';
import { PopulationAnalyticsEngine } from '../engine/PopulationAnalyticsEngine';

export function runPopulationVerification() {
  const twinEngine = new DigitalTwinEngine();
  const popEngine = new PopulationAnalyticsEngine();

  const twins = Object.values(DEMO_PATIENTS).map(bundle =>
    twinEngine.createDigitalTwin(
      bundle.patient,
      bundle.vitals,
      bundle.labs,
      bundle.conditions,
      [],
      []
    )
  );

  const snapshot = popEngine.generatePopulationSnapshot(twins);

  return {
    snapshotId: snapshot.snapshotId,
    isAnonymized: snapshot.isAnonymized,
    totalEvaluated: snapshot.totalPopulationEvaluated,
    districtName: snapshot.region.regionName,
    diseasePrevalence: snapshot.diseasePrevalence.map(dp => `${dp.diseaseName}: ${dp.prevalencePercentage}% (${dp.casesCount} cases)`),
    riskTierDistribution: snapshot.riskDistribution,
    multimorbidPercentage: `${snapshot.multimorbidity.multimorbidPercentage}%`,
    topScreeningGap: snapshot.screeningGaps.priorityDeficitRegions[0],
    totalReferrals: snapshot.referralMetrics.totalReferralsGenerated,
    referralSpecialtiesBreakdown: snapshot.referralMetrics.bySpecialty,
    nephrologyVisitsNeededPerMonth: snapshot.resourceForecast.estimatedSpecialistVisitsNeeded.find(v => v.specialty.includes('Nephrology'))?.requiredVisitsPerMonth
  };
}
