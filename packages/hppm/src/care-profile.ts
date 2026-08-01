// ============================================================================
// HPPM – Capability 1: Personalized Care Profile Engine
// ============================================================================

import { HPPMCareProfile, HPPMTreatmentRecord, HPPMPatientPreferences } from './types';
import { hcpi } from '@healthsense/hcpi';

export class HPPMCareProfileEngine {
  private profiles: Map<string, HPPMCareProfile> = new Map();

  /**
   * Build or retrieve a unified personalized care profile.
   * Integrates HCPI longitudinal data with patient-specific history.
   */
  public buildProfile(input: Partial<HPPMCareProfile> & { patientId: string }): HPPMCareProfile {
    const existing = this.profiles.get(input.patientId);

    // Pull longitudinal context from HCPI
    const longitudinal = hcpi.analyzePatientLongitudinal(input.patientId);

    const profile: HPPMCareProfile = {
      patientId: input.patientId,
      demographics: input.demographics || existing?.demographics || { age: 55, sex: 'M' },
      chronicConditions: input.chronicConditions || existing?.chronicConditions || longitudinal.profile.chronicConditions,
      allergies: input.allergies || existing?.allergies || longitudinal.profile.allergies,
      currentMedications: input.currentMedications || existing?.currentMedications || longitudinal.profile.activeMedications,
      treatmentHistory: input.treatmentHistory || existing?.treatmentHistory || [
        { medication: 'Lisinopril 10mg', startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), response: 'GOOD', notes: 'BP improved from 145/92 to 135/85' },
        { medication: 'Metformin 500mg', startDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), response: 'PARTIAL', notes: 'HbA1c improved from 7.8 to 7.2 but GI side effects' }
      ],
      lifestyleSnapshot: input.lifestyleSnapshot || existing?.lifestyleSnapshot || {
        smokingStatus: 'NEVER',
        physicalActivityMinPerWeek: 120,
        sleepHoursPerNight: 6.5,
        dietQuality: 'FAIR'
      },
      adherenceHistory: input.adherenceHistory || existing?.adherenceHistory || {
        medicationAdherencePercent: longitudinal.profile.adherenceScore,
        appointmentAdherencePercent: 85,
        screeningAdherencePercent: 70,
        lifestyleAdherencePercent: 55
      },
      preferences: input.preferences || existing?.preferences || {
        preferGeneric: true,
        avoidInjections: true,
        preferOnceDailyDosing: true,
        dietaryPreference: 'NONE',
        exercisePreference: 'LOW_IMPACT',
        communicationPreference: 'EITHER'
      },
      previousInterventions: input.previousInterventions || existing?.previousInterventions || [
        { intervention: 'DASH diet counseling', outcome: 'PARTIAL', date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
        { intervention: 'Walking program', outcome: 'SUCCESS', date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) }
      ],
      vitalSigns: input.vitalSigns || existing?.vitalSigns || [],
      laboratoryResults: input.laboratoryResults || existing?.laboratoryResults || [],
      familyHistory: input.familyHistory || existing?.familyHistory || []
    };

    this.profiles.set(input.patientId, profile);
    return profile;
  }

  public getProfile(patientId: string): HPPMCareProfile | undefined {
    return this.profiles.get(patientId);
  }
}
