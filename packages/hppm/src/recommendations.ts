// ============================================================================
// HPPM – Capability 2: Personalized Treatment Recommendations
// ============================================================================

import { HPPMCareProfile, HPPMPersonalizedRecommendation } from './types';

export class HPPMRecommendationEngine {

  public generate(profile: HPPMCareProfile): HPPMPersonalizedRecommendation[] {
    const recs: HPPMPersonalizedRecommendation[] = [];

    // ── Medication Adaptations ──
    for (const treatment of profile.treatmentHistory) {
      if (treatment.response === 'POOR' || treatment.response === 'ADVERSE') {
        recs.push(this.adaptPoorResponse(treatment.medication, profile));
      } else if (treatment.response === 'PARTIAL') {
        recs.push(this.adaptPartialResponse(treatment.medication, profile));
      }
    }

    // ── Adherence-Informed Adaptation ──
    if (profile.adherenceHistory.medicationAdherencePercent < 80) {
      recs.push({
        category: 'MEDICATION',
        recommendation: profile.preferences.preferOnceDailyDosing
          ? 'Switch to once-daily formulations to simplify regimen and improve adherence.'
          : 'Consider medication reminder systems or pill organizers to improve adherence.',
        adaptationRationale: [
          `Medication adherence at ${profile.adherenceHistory.medicationAdherencePercent}% (target ≥85%)`,
          `Patient preference: once-daily dosing = ${profile.preferences.preferOnceDailyDosing}`
        ],
        confidence: 0.85,
        alternativeConsidered: 'Multi-dose regimen with digital adherence monitoring',
        evidenceReference: 'WHO Adherence Report / AHA Medication Adherence Statement'
      });
    }

    // ── Lifestyle Adaptation based on Preferences ──
    if (profile.lifestyleSnapshot.physicalActivityMinPerWeek < 150) {
      const successfulExercise = profile.previousInterventions.find(
        i => i.intervention.toLowerCase().includes('walk') && i.outcome === 'SUCCESS'
      );
      recs.push({
        category: 'LIFESTYLE',
        recommendation: successfulExercise
          ? `Build on successful walking program: increase from current ${profile.lifestyleSnapshot.physicalActivityMinPerWeek} to 150 min/week gradually.`
          : `Start ${profile.preferences.exercisePreference === 'LOW_IMPACT' ? 'low-impact exercise (walking, swimming, yoga)' : 'moderate-intensity exercise'} targeting 150 min/week.`,
        adaptationRationale: [
          `Current activity: ${profile.lifestyleSnapshot.physicalActivityMinPerWeek} min/week (target ≥150)`,
          `Patient exercise preference: ${profile.preferences.exercisePreference}`,
          successfulExercise ? 'Previous walking program was successful — build on this' : 'No prior successful exercise intervention'
        ],
        confidence: 0.88,
        alternativeConsidered: 'Structured cardiac rehabilitation program',
        evidenceReference: 'WHO 2020 Physical Activity Guidelines'
      });
    }

    // ── Diet Adaptation ──
    if (profile.lifestyleSnapshot.dietQuality === 'POOR' || profile.lifestyleSnapshot.dietQuality === 'FAIR') {
      const previousDietIntervention = profile.previousInterventions.find(i =>
        i.intervention.toLowerCase().includes('diet') || i.intervention.toLowerCase().includes('nutrition')
      );
      const dietFailed = previousDietIntervention?.outcome === 'FAILURE';

      recs.push({
        category: 'LIFESTYLE',
        recommendation: dietFailed
          ? 'Previous dietary intervention did not succeed. Consider referral to registered dietitian for individualized meal planning with patient preference accommodation.'
          : `Initiate ${profile.preferences.dietaryPreference !== 'NONE' ? profile.preferences.dietaryPreference + '-compatible ' : ''}DASH or Mediterranean diet with gradual transitions.`,
        adaptationRationale: [
          `Current diet quality: ${profile.lifestyleSnapshot.dietQuality}`,
          `Dietary preference: ${profile.preferences.dietaryPreference}`,
          previousDietIntervention ? `Previous diet intervention: ${previousDietIntervention.outcome}` : 'No prior dietary intervention recorded'
        ],
        confidence: 0.82,
        alternativeConsidered: 'Digital nutrition coaching application',
        evidenceReference: 'ADA Medical Nutrition Therapy / DASH Trial'
      });
    }

    // ── Monitoring Personalization ──
    if (profile.chronicConditions.some(c => c.toLowerCase().includes('diabetes'))) {
      recs.push({
        category: 'MONITORING',
        recommendation: profile.preferences.communicationPreference === 'TELEHEALTH'
          ? 'Quarterly telehealth HbA1c review with remote glucose data upload.'
          : 'Quarterly in-person HbA1c review with point-of-care testing.',
        adaptationRationale: [
          'Diabetic patient requires regular glycemic monitoring',
          `Communication preference: ${profile.preferences.communicationPreference}`
        ],
        confidence: 0.92,
        alternativeConsidered: 'Monthly CGM data review via patient portal',
        evidenceReference: 'ADA 2024 Standards of Medical Care'
      });
    }

    // ── Hypertension Personalization ──
    if (profile.chronicConditions.some(c => c.toLowerCase().includes('hypertension'))) {
      const lisinoprilHistory = profile.treatmentHistory.find(t =>
        t.medication.toLowerCase().includes('lisinopril')
      );
      if (lisinoprilHistory && lisinoprilHistory.response === 'GOOD') {
        recs.push({
          category: 'MEDICATION',
          recommendation: 'Continue Lisinopril — demonstrated good response historically. Consider dose titration if BP remains above target.',
          adaptationRationale: [
            `Lisinopril response: ${lisinoprilHistory.response}`,
            `Prior notes: ${lisinoprilHistory.notes}`
          ],
          confidence: 0.90,
          alternativeConsidered: 'Switch to ARB (Losartan) if cough develops',
          evidenceReference: 'AHA/ACC 2017 Hypertension Guidelines'
        });
      }
    }

    // ── Education Personalization ──
    recs.push({
      category: 'EDUCATION',
      recommendation: profile.preferences.communicationPreference === 'TELEHEALTH'
        ? 'Provide digital health education materials via patient portal with interactive modules.'
        : 'Schedule in-person health education session with printed materials.',
      adaptationRationale: [
        `Communication preference: ${profile.preferences.communicationPreference}`,
        `${profile.chronicConditions.length} chronic condition(s) requiring ongoing education`
      ],
      confidence: 0.80,
      alternativeConsidered: 'Group education sessions',
      evidenceReference: 'Health Literacy Universal Precautions Toolkit (AHRQ)'
    });

    return recs;
  }

  private adaptPoorResponse(medication: string, profile: HPPMCareProfile): HPPMPersonalizedRecommendation {
    return {
      category: 'MEDICATION',
      recommendation: `Discontinue ${medication} due to poor/adverse response. Switch to alternative agent considering patient allergies (${profile.allergies.join(', ')}) and preferences.`,
      adaptationRationale: [
        `${medication} response: POOR/ADVERSE`,
        `Allergies: ${profile.allergies.join(', ')}`,
        `Preference for generics: ${profile.preferences.preferGeneric}`,
        `Injection avoidance: ${profile.preferences.avoidInjections}`
      ],
      confidence: 0.88,
      alternativeConsidered: 'Dose adjustment before switching',
      evidenceReference: 'Treatment adaptation based on longitudinal response tracking'
    };
  }

  private adaptPartialResponse(medication: string, profile: HPPMCareProfile): HPPMPersonalizedRecommendation {
    return {
      category: 'MEDICATION',
      recommendation: `${medication} shows partial response. Consider dose titration or adding complementary agent. Monitor for 4-8 weeks before re-evaluation.`,
      adaptationRationale: [
        `${medication} response: PARTIAL`,
        'Dose optimization preferred before medication switch',
        `Adherence factor: ${profile.adherenceHistory.medicationAdherencePercent}% — partial response may reflect adherence gap`
      ],
      confidence: 0.82,
      alternativeConsidered: 'Full medication switch to alternative class',
      evidenceReference: 'Stepwise therapy intensification per clinical guidelines'
    };
  }
}
