// ============================================================================
// HLEMP – Capability 3: HL7 ↔ FHIR Transformation Engine
// ============================================================================

import { HL7ParsedMessage, HL7TransformationResult } from './types';
import {
  FHIRResource,
  FHIRPatient,
  FHIRObservation,
  FHIRCondition,
  FHIRMedicationRequest,
} from '@healthsense/hhif';

export class HLEMPHL7FHIRTransformerEngine {

  /**
   * Convert an HL7 v2 parsed message into canonical FHIR R4 resources.
   */
  public hl7ToFHIR(parsed: HL7ParsedMessage): HL7TransformationResult {
    const fhirResources: FHIRResource[] = [];
    const semanticLossNotes: string[] = [];

    // Extract PID segment for Patient
    const pid = parsed.segments.find(s => s.name === 'PID');
    let patientId = 'pt-unknown';
    if (pid) {
      patientId = pid.fields[2] || pid.fields[1] || 'pt-hl7-sample';
      const nameParts = (pid.fields[4] || 'Patient^Sample').split('^');
      const genderCode = (pid.fields[7] || 'M').toUpperCase();

      const patientResource: FHIRPatient = {
        resourceType: 'Patient',
        id: patientId,
        active: true,
        gender: genderCode === 'F' ? 'female' : 'male',
        name: [{ family: nameParts[0], given: [nameParts[1] || ''] }],
      };
      fhirResources.push(patientResource);
    } else {
      semanticLossNotes.push('No PID segment present — generated default patient identifier.');
    }

    // Extract OBX segments for Observations (ORU/ADT)
    const obxSegments = parsed.segments.filter(s => s.name === 'OBX');
    for (let i = 0; i < obxSegments.length; i++) {
      const obx = obxSegments[i];
      const valueType = obx.fields[1] || 'NM';
      const obsCode = obx.fields[2] || 'ObsText';
      const obsValueStr = obx.fields[4] || '0';
      const obsUnit = obx.fields[5] || '';

      const numericVal = parseFloat(obsValueStr);

      const obsResource: FHIRObservation = {
        resourceType: 'Observation',
        id: `obs-hl7-${i + 1}`,
        status: 'final',
        category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'laboratory' }] }],
        code: { text: obsCode },
        subject: { reference: `Patient/${patientId}` },
        effectiveDateTime: parsed.timestamp,
        valueQuantity: !isNaN(numericVal) ? { value: numericVal, unit: obsUnit } : undefined,
        valueString: isNaN(numericVal) ? obsValueStr : undefined,
      };
      fhirResources.push(obsResource);
    }

    // Extract DG1 segments for Conditions
    const dg1Segments = parsed.segments.filter(s => s.name === 'DG1');
    for (let i = 0; i < dg1Segments.length; i++) {
      const dg1 = dg1Segments[i];
      const diagCode = dg1.fields[2] || 'DiagnosisText';

      const condResource: FHIRCondition = {
        resourceType: 'Condition',
        id: `cond-hl7-${i + 1}`,
        clinicalStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active' }] },
        code: { text: diagCode },
        subject: { reference: `Patient/${patientId}` },
      };
      fhirResources.push(condResource);
    }

    // Extract RXE/ORC segments for MedicationRequests
    const rxeSegments = parsed.segments.filter(s => s.name === 'RXE');
    for (let i = 0; i < rxeSegments.length; i++) {
      const rxe = rxeSegments[i];
      const medName = rxe.fields[1] || 'Medication';

      const medReq: FHIRMedicationRequest = {
        resourceType: 'MedicationRequest',
        id: `medreq-hl7-${i + 1}`,
        status: 'active',
        intent: 'order',
        medicationCodeableConcept: { text: medName },
        subject: { reference: `Patient/${patientId}` },
      };
      fhirResources.push(medReq);
    }

    return {
      sourceHL7ControlId: parsed.controlId,
      fhirResources,
      conversionSuccess: true,
      semanticLossNotes,
    };
  }

  /**
   * Convert FHIR resources back into an HL7 v2 ORU^R01 / ADT^A08 message string.
   */
  public fhirToHL7(patientId: string, resources: FHIRResource[]): string {
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const msh = `MSH|^~\\&|HealthSense|HOSPITAL|HIS|FACILITY|${timestamp}||ORU^R01|ctrl-${Date.now()}|P|2.5`;

    const patientRes = resources.find(r => r.resourceType === 'Patient') as FHIRPatient | undefined;
    const family = patientRes?.name?.[0]?.family || 'Patient';
    const given = patientRes?.name?.[0]?.given?.[0] || 'Sample';
    const gender = patientRes?.gender === 'female' ? 'F' : 'M';

    const pid = `PID|1||${patientId}||${family}^${given}||19640512|${gender}`;

    const segments: string[] = [msh, pid];

    let obxIdx = 1;
    for (const r of resources) {
      if (r.resourceType === 'Observation') {
        const obs = r as FHIRObservation;
        const codeText = obs.code.text || 'Observation';
        const val = obs.valueQuantity?.value ?? obs.valueString ?? '0';
        const unit = obs.valueQuantity?.unit ?? '';

        segments.push(`OBX|${obxIdx}|NM|${codeText}||${val}|${unit}|||||F`);
        obxIdx++;
      }
    }

    return segments.join('\r') + '\r';
  }
}
