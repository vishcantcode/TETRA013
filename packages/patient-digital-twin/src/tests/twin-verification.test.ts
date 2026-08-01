import { DEMO_PATIENTS } from '@healthsense/clinical-models';
import { DigitalTwinEngine } from '../engine/DigitalTwinEngine';

export function runTwinVerification() {
  const engine = new DigitalTwinEngine();
  const results: Record<string, any> = {};

  for (const [key, bundle] of Object.entries(DEMO_PATIENTS)) {
    const twin = engine.createDigitalTwin(
      bundle.patient,
      bundle.vitals,
      bundle.labs,
      bundle.conditions,
      [],
      []
    );

    results[key] = {
      patientId: twin.patientId,
      activeVersion: twin.activeVersion.version,
      versionTag: twin.activeVersion.versionTag,
      healthScore: twin.healthState.overallHealthScore,
      trendStatus: twin.healthState.trendStatus,
      primaryDrivers: twin.healthState.primaryRiskDrivers,
      biomarkerTrendsCount: twin.biomarkerTrends.length,
      timelineEventsCount: twin.timeline.length,
      projectionsCount: twin.projections.length,
      simulatedRiskReduction: `${twin.defaultSimulation.riskReductionPercentage}%`,
      simulatedSummary: twin.defaultSimulation.clinicalImpactSummary
    };
  }

  return results;
}
