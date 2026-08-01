import { FHIRServiceRequest, ReferralUrgency } from '@healthsense/clinical-models';
import { ReferralReason } from '../interfaces/ReferralReason';
import { ReferralPriorityCategory } from '../interfaces/ReferralPriority';

export class ServiceRequestBuilder {
  public static mapPriorityToFHIR(category: ReferralPriorityCategory): ReferralUrgency {
    if (category === 'Emergency' || category === 'Within 24 Hours') return 'emergency';
    if (category === 'Within 48 Hours' || category === 'Within 7 Days') return 'urgent';
    return 'routine';
  }

  public static buildServiceRequest(
    patientId: string,
    reason: ReferralReason,
    priorityCategory: ReferralPriorityCategory
  ): FHIRServiceRequest {
    const fhirUrgency = ServiceRequestBuilder.mapPriorityToFHIR(priorityCategory);
    const snomedCode = ServiceRequestBuilder.getSNOMEDCode(reason.targetSpecialty);

    return {
      resourceType: 'ServiceRequest',
      id: `sr-${reason.targetSpecialty.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      status: 'active',
      intent: 'order',
      specialty: reason.targetSpecialty,
      urgency: fhirUrgency,
      code: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: snomedCode,
            display: `Referral to ${reason.targetSpecialty}`
          }
        ],
        text: `Referral to ${reason.targetSpecialty}`
      },
      subject: {
        reference: `Patient/${patientId}`
      },
      occurrenceDateTime: new Date().toISOString(),
      reasonText: `${reason.primaryDiagnosis}: ${reason.clinicalJustification}`
    };
  }

  private static getSNOMEDCode(specialty: string): string {
    switch (specialty) {
      case 'Nephrologist': return '306206005';
      case 'Cardiologist': return '306205009';
      case 'Endocrinologist': return '306207001';
      case 'Ophthalmologist': return '306209003';
      case 'Neurologist': return '306208006';
      default: return '306204008'; // Referral to General Medical Practice
    }
  }
}
