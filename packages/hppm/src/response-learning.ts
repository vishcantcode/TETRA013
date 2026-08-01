// ============================================================================
// HPPM – Capability 3: Treatment Response Learning Module
// ============================================================================

import { HPPMCareProfile, HPPMResponseInsight, TreatmentResponseTrend } from './types';

export class HPPMResponseLearningEngine {

  public analyze(profile: HPPMCareProfile): HPPMResponseInsight[] {
    const insights: HPPMResponseInsight[] = [];

    for (const treatment of profile.treatmentHistory) {
      const trend = this.assessTrend(treatment.response, profile);
      const action = this.recommendAction(treatment.medication, treatment.response, trend, profile);

      insights.push({
        medication: treatment.medication,
        currentResponse: treatment.response,
        trend,
        recommendedAction: action,
        reasoning: this.buildReasoning(treatment.medication, treatment.response, trend, profile)
      });
    }

    return insights;
  }

  private assessTrend(response: string, profile: HPPMCareProfile): TreatmentResponseTrend {
    // If adherence is declining, response may also decline
    if (profile.adherenceHistory.medicationAdherencePercent < 70) return 'DECLINING';
    if (response === 'EXCELLENT' || response === 'GOOD') return 'IMPROVING';
    if (response === 'PARTIAL') return 'STABLE';
    return 'DECLINING';
  }

  private recommendAction(medication: string, response: string, trend: TreatmentResponseTrend, profile: HPPMCareProfile): string {
    if (response === 'ADVERSE') {
      return `Discontinue ${medication}. Document adverse reaction. Select alternative avoiding ${profile.allergies.join(', ')}.`;
    }
    if (response === 'POOR') {
      return `Consider switching ${medication} to alternative class. Verify adherence before concluding treatment failure.`;
    }
    if (response === 'PARTIAL' && trend === 'DECLINING') {
      return `Adherence declining — address barriers before dose escalation. Consider simplified regimen.`;
    }
    if (response === 'PARTIAL') {
      return `Titrate ${medication} dose upward if tolerated. Re-evaluate in 4-8 weeks.`;
    }
    if (response === 'GOOD' && trend === 'IMPROVING') {
      return `Maintain current ${medication} regimen. Schedule routine monitoring.`;
    }
    if (response === 'EXCELLENT') {
      return `${medication} is performing optimally. Continue and monitor for sustained efficacy.`;
    }
    return `Continue ${medication} with close monitoring.`;
  }

  private buildReasoning(medication: string, response: string, trend: TreatmentResponseTrend, profile: HPPMCareProfile): string {
    const parts: string[] = [];
    parts.push(`${medication} current response: ${response}.`);
    parts.push(`Response trend: ${trend}.`);
    parts.push(`Medication adherence: ${profile.adherenceHistory.medicationAdherencePercent}%.`);

    if (response === 'PARTIAL' && profile.adherenceHistory.medicationAdherencePercent < 80) {
      parts.push('Suboptimal adherence may be contributing to partial response — address adherence before escalating therapy.');
    }

    const previousSwitch = profile.previousInterventions.find(i =>
      i.intervention.toLowerCase().includes(medication.toLowerCase().split(' ')[0])
    );
    if (previousSwitch) {
      parts.push(`Prior intervention with related agent: ${previousSwitch.outcome}.`);
    }

    return parts.join(' ');
  }
}
