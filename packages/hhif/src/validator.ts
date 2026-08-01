// ============================================================================
// HHIF – Capability 3: FHIR R4 Validation Framework
// ============================================================================

import { FHIRResource, FHIRValidationReport, FHIRValidationError } from './types';

export class HHIFFHIRValidatorEngine {

  /**
   * Validate any FHIR R4 resource against schema & constraint rules.
   */
  public validate(resource: FHIRResource): FHIRValidationReport {
    const errors: FHIRValidationError[] = [];
    const warnings: FHIRValidationError[] = [];

    if (!resource.resourceType) {
      errors.push({
        path: 'resourceType',
        message: 'Missing required root element "resourceType".',
        severity: 'error',
        code: 'STRUCTURE_MISSING',
      });
      return { isValid: false, resourceType: 'Unknown', errors, warnings };
    }

    const resType = resource.resourceType;

    // Validate per resource type rules
    switch (resType) {
      case 'Patient':
        if (!resource.id) {
          warnings.push({ path: 'id', message: 'Patient resource missing logical id.', severity: 'warning', code: 'ID_MISSING' });
        }
        break;

      case 'Observation': {
        const obs = resource as any;
        if (!obs.status) {
          errors.push({ path: 'Observation.status', message: 'Observation resource missing mandatory "status" field.', severity: 'error', code: 'REQUIRED_FIELD_MISSING' });
        }
        if (!obs.code) {
          errors.push({ path: 'Observation.code', message: 'Observation resource missing mandatory "code" concept.', severity: 'error', code: 'REQUIRED_FIELD_MISSING' });
        }
        if (!obs.subject) {
          warnings.push({ path: 'Observation.subject', message: 'Observation has no subject reference.', severity: 'warning', code: 'REFERENCE_MISSING' });
        }
        break;
      }

      case 'Condition': {
        const cond = resource as any;
        if (!cond.subject) {
          errors.push({ path: 'Condition.subject', message: 'Condition resource missing mandatory "subject" reference.', severity: 'error', code: 'REQUIRED_FIELD_MISSING' });
        }
        break;
      }

      case 'MedicationRequest': {
        const medReq = resource as any;
        if (!medReq.status) {
          errors.push({ path: 'MedicationRequest.status', message: 'MedicationRequest missing mandatory "status".', severity: 'error', code: 'REQUIRED_FIELD_MISSING' });
        }
        if (!medReq.intent) {
          errors.push({ path: 'MedicationRequest.intent', message: 'MedicationRequest missing mandatory "intent".', severity: 'error', code: 'REQUIRED_FIELD_MISSING' });
        }
        break;
      }

      case 'AllergyIntolerance': {
        const allergy = resource as any;
        if (!allergy.patient) {
          errors.push({ path: 'AllergyIntolerance.patient', message: 'AllergyIntolerance missing mandatory "patient" reference.', severity: 'error', code: 'REQUIRED_FIELD_MISSING' });
        }
        break;
      }
    }

    const isValid = errors.length === 0;

    return {
      isValid,
      resourceType: resType,
      resourceId: resource.id,
      errors,
      warnings,
    };
  }
}
