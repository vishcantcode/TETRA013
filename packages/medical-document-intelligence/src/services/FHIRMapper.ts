import { FHIRObservation, FHIRDiagnosticReport } from '@healthsense/clinical-models';
import { ExtractedObservation } from '../interfaces/ExtractedObservation';

export class FHIRMapper {
  public static mapToFHIRObservations(
    patientId: string,
    extractedObs: ExtractedObservation[]
  ): FHIRObservation[] {
    return extractedObs.map(obs => ({
      resourceType: 'Observation',
      id: obs.id,
      status: 'final',
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: obs.loincCode,
            display: obs.testName
          }
        ],
        text: obs.testName
      },
      subject: {
        reference: `Patient/${patientId}`
      },
      effectiveDateTime: new Date().toISOString(),
      valueQuantity: {
        value: obs.value,
        unit: obs.unit
      },
      referenceRange: [
        {
          text: obs.referenceRangeText
        }
      ]
    }));
  }

  public static mapToFHIRDiagnosticReport(
    patientId: string,
    reportTitle: string,
    observations: FHIRObservation[]
  ): FHIRDiagnosticReport {
    return {
      resourceType: 'DiagnosticReport',
      id: `dr-ocr-${Date.now()}`,
      status: 'final',
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '11502-2',
            display: reportTitle
          }
        ],
        text: reportTitle
      },
      subject: {
        reference: `Patient/${patientId}`
      },
      effectiveDateTime: new Date().toISOString(),
      result: observations.map(obs => ({ reference: `Observation/${obs.id}` })),
      conclusion: `OCR extracted ${observations.length} laboratory observations cleanly.`
    };
  }
}
