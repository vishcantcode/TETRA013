import { SpecialistType, ReferralReason } from './ReferralReason';
import { ReferralPriority } from './ReferralPriority';
import { ReferralEvidence } from './ReferralEvidence';
import { FHIRServiceRequest } from '@healthsense/clinical-models';

export interface ReferralItem {
  id: string;
  specialty: SpecialistType;
  priority: ReferralPriority;
  reason: ReferralReason;
  evidence: ReferralEvidence;
  fhirServiceRequest: FHIRServiceRequest;
}

export interface CarePathway {
  pathwayId: string;
  patientId: string;
  activeReferralsCount: number;
  referralItems: ReferralItem[];
  primaryPathwayGoal: string;
}
