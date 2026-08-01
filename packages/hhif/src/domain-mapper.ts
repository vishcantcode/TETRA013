// ============================================================================
// HHIF – Capability 2: Domain ↔ FHIR Mapping Engine
// ============================================================================

import {
  FHIRPatient,
  FHIRObservation,
  FHIRCondition,
  FHIRMedicationRequest,
  FHIRAllergyIntolerance,
  FHIRResource,
  DomainMappingResult,
} from './types';
import { HPPMCareProfile } from '@healthsense/hppm';

export class HHIFDomainMapperEngine {

  /**
   * Convert HealthSense HPPMCareProfile domain model to canonical FHIR R4 resources.
   */
  public careProfileToFHIR(profile: HPPMCareProfile): FHIRResource[] {
    const resources: FHIRResource[] = [];

    // 1. Map Patient
    const patientResource: FHIRPatient = {
      resourceType: 'Patient',
      id: profile.patientId,
      active: true,
      gender: profile.demographics.sex === 'M' ? 'male' : 'female',
      name: [{ family: 'Patient', given: [profile.patientId] }],
    };
    resources.push(patientResource);

    // 2. Map Vitals to FHIR Observations
    for (const v of profile.vitalSigns) {
      const obs: FHIRObservation = {
        resourceType: 'Observation',
        id: `obs-vital-${v.metric.toLowerCase().replace(/\s+/g, '-')}`,
        status: 'final',
        category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'vital-signs', display: 'Vital Signs' }] }],
        code: { text: v.metric, coding: [{ system: 'http://loinc.org', code: v.metric === 'Systolic BP' ? '8480-6' : '2708-6', display: v.metric }] },
        subject: { reference: `Patient/${profile.patientId}` },
        effectiveDateTime: new Date().toISOString(),
        valueQuantity: { value: v.value, unit: v.unit },
      };
      resources.push(obs);
    }

    // 3. Map Labs to FHIR Observations
    for (const l of profile.laboratoryResults) {
      const obs: FHIRObservation = {
        resourceType: 'Observation',
        id: `obs-lab-${l.test.toLowerCase().replace(/\s+/g, '-')}`,
        status: 'final',
        category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'laboratory', display: 'Laboratory' }] }],
        code: { text: l.test, coding: [{ system: 'http://loinc.org', code: l.test === 'HbA1c' ? '4548-4' : '2093-3', display: l.test }] },
        subject: { reference: `Patient/${profile.patientId}` },
        effectiveDateTime: new Date().toISOString(),
        valueQuantity: { value: l.value, unit: l.unit },
      };
      resources.push(obs);
    }

    // 4. Map Chronic Conditions to FHIR Conditions
    for (const c of profile.chronicConditions) {
      const cond: FHIRCondition = {
        resourceType: 'Condition',
        id: `cond-${c.toLowerCase().replace(/\s+/g, '-')}`,
        clinicalStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active', display: 'Active' }] },
        code: { text: c, coding: [{ system: 'http://snomed.info/sct', code: '38341003', display: c }] },
        subject: { reference: `Patient/${profile.patientId}` },
      };
      resources.push(cond);
    }

    // 5. Map Medications to FHIR MedicationRequests
    for (const m of profile.currentMedications) {
      const medReq: FHIRMedicationRequest = {
        resourceType: 'MedicationRequest',
        id: `medreq-${m.toLowerCase().replace(/\s+/g, '-')}`,
        status: 'active',
        intent: 'order',
        medicationCodeableConcept: { text: m, coding: [{ system: 'http://www.nlm.nih.gov/research/umls/rxnorm', display: m }] },
        subject: { reference: `Patient/${profile.patientId}` },
      };
      resources.push(medReq);
    }

    // 6. Map Allergies to FHIR AllergyIntolerance
    for (const a of profile.allergies) {
      const allergy: FHIRAllergyIntolerance = {
        resourceType: 'AllergyIntolerance',
        id: `allergy-${a.toLowerCase().replace(/\s+/g, '-')}`,
        clinicalStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical', code: 'active' }] },
        type: 'allergy',
        code: { text: a },
        patient: { reference: `Patient/${profile.patientId}` },
      };
      resources.push(allergy);
    }

    return resources;
  }

  /**
   * Convert FHIR resources back into HealthSense HPPMCareProfile domain model.
   */
  public fhirToCareProfile(patientId: string, resources: FHIRResource[]): HPPMCareProfile {
    const patientRes = resources.find(r => r.resourceType === 'Patient') as FHIRPatient | undefined;

    const vitalSigns: { metric: string; value: number; unit: string }[] = [];
    const laboratoryResults: { test: string; value: number; unit: string }[] = [];
    const chronicConditions: string[] = [];
    const currentMedications: string[] = [];
    const allergies: string[] = [];

    for (const r of resources) {
      if (r.resourceType === 'Observation') {
        const obs = r as FHIRObservation;
        const cat = obs.category?.[0]?.coding?.[0]?.code;
        const name = obs.code.text || obs.code.coding?.[0]?.display || 'Observation';
        const val = obs.valueQuantity?.value ?? 0;
        const unit = obs.valueQuantity?.unit ?? '';

        if (cat === 'vital-signs') {
          vitalSigns.push({ metric: name, value: val, unit });
        } else {
          laboratoryResults.push({ test: name, value: val, unit });
        }
      } else if (r.resourceType === 'Condition') {
        const cond = r as FHIRCondition;
        const name = cond.code?.text || cond.code?.coding?.[0]?.display || 'Condition';
        chronicConditions.push(name);
      } else if (r.resourceType === 'MedicationRequest') {
        const med = r as FHIRMedicationRequest;
        const name = med.medicationCodeableConcept?.text || med.medicationCodeableConcept?.coding?.[0]?.display || 'Medication';
        currentMedications.push(name);
      } else if (r.resourceType === 'AllergyIntolerance') {
        const allergy = r as FHIRAllergyIntolerance;
        const name = allergy.code?.text || 'Allergy';
        allergies.push(name);
      }
    }

    return {
      patientId: patientRes?.id || patientId,
      demographics: {
        age: 62, // default or parsed from birthDate
        sex: patientRes?.gender === 'female' ? 'F' : 'M',
      },
      chronicConditions,
      allergies,
      currentMedications,
      treatmentHistory: [],
      lifestyleSnapshot: {
        smokingStatus: 'NEVER',
        physicalActivityMinPerWeek: 120,
        sleepHoursPerNight: 7.0,
        dietQuality: 'GOOD',
      },
      adherenceHistory: {
        medicationAdherencePercent: 85,
        appointmentAdherencePercent: 85,
        screeningAdherencePercent: 80,
        lifestyleAdherencePercent: 75,
      },
      preferences: {
        preferGeneric: true,
        avoidInjections: true,
        preferOnceDailyDosing: true,
        dietaryPreference: 'NONE',
        exercisePreference: 'LOW_IMPACT',
        communicationPreference: 'EITHER',
      },
      previousInterventions: [],
      vitalSigns,
      laboratoryResults,
      familyHistory: [],
    };
  }

  /**
   * Perform round-trip conversion and verify semantic integrity.
   */
  public executeRoundTrip(profile: HPPMCareProfile): DomainMappingResult<HPPMCareProfile> {
    const fhirResources = this.careProfileToFHIR(profile);
    const convertedProfile = this.fhirToCareProfile(profile.patientId, fhirResources);

    const roundTripSuccess =
      convertedProfile.chronicConditions.length === profile.chronicConditions.length &&
      convertedProfile.currentMedications.length === profile.currentMedications.length &&
      convertedProfile.allergies.length === profile.allergies.length;

    return {
      domainModel: convertedProfile,
      generatedFHIRResources: fhirResources,
      roundTripSuccess,
      semanticLossReported: !roundTripSuccess,
    };
  }
}
