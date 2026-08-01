// ============================================================================
// HICSDEP – Identity, Consent & Secure Data Exchange Platform
// Shared Governance, Security & Trust Types
// ============================================================================

export interface LinkedIdentifier {
  system: string; // e.g. "http://hospital.org/mrn", "http://hl7.org/fhir/sid/us-ssn"
  value: string;
  assigner: string; // e.g. "City Hospital", "SSA"
}

export interface MasterPatientIdentity {
  masterPatientId: string; // Canonical HealthSense UUID
  primaryName: { family: string; given: string[] };
  gender: 'male' | 'female' | 'other' | 'unknown';
  birthDate: string; // YYYY-MM-DD
  linkedIdentifiers: LinkedIdentifier[];
  reconciliationHistory: { linkedAt: Date; sourceSystem: string; identifierValue: string }[];
  active: boolean;
}

export type ConsentScope = 'TREATMENT' | 'RESEARCH' | 'DATA_SHARING' | 'EMERGENCY_ACCESS' | 'DELEGATED_ACCESS';
export type ConsentStatus = 'ACTIVE' | 'REVOKED' | 'EXPIRED';

export interface PatientConsent {
  consentId: string;
  patientId: string;
  scope: ConsentScope;
  status: ConsentStatus;
  authorizedOrganizationId?: string;
  authorizedPractitionerId?: string;
  effectiveFrom: Date;
  effectiveTo: Date;
  revokedAt?: Date;
  revokedReason?: string;
}

export type PurposeOfUse = 'TREATMENT' | 'PAYMENT' | 'OPERATIONS' | 'RESEARCH' | 'EMERGENCY';
export type SensitivityLevel = 'NORMAL' | 'RESTRICTED' | 'VERY_RESTRICTED';

export interface FineGrainedAuthorizationRequest {
  patientId: string;
  practitionerId: string;
  organizationId: string;
  resourceType: string;
  sensitivityLevel: SensitivityLevel;
  purposeOfUse: PurposeOfUse;
}

export interface DataProvenanceRecord {
  provenanceId: string;
  targetResourceId: string;
  targetResourceType: string;
  originSystem: string;
  authorId: string;
  authorRole: string;
  timestamp: Date;
  digitalSignature: string; // SHA-256 HMAC / JWS signature
  transformationHistory: string[];
}

export interface SecureExchangePayload {
  exchangeId: string;
  senderOrganizationId: string;
  recipientOrganizationId: string;
  encryptedContent: string; // Base64 ciphertext
  digitalSignature: string;
  algorithm: 'AES-256-GCM' | 'RSA-OAEP-256';
  exchangedAt: Date;
}

export interface BreakGlassOverride {
  overrideId: string;
  patientId: string;
  practitionerId: string;
  reason: string;
  timestamp: Date;
  active: boolean;
}

export interface TrustRelationship {
  organizationId: string;
  organizationName: string;
  npiNumber?: string;
  endpointUrl: string;
  trustLevel: 'VERIFIED_TRUSTED' | 'PROVISIONAL' | 'REVOKED';
  certificateFingerprint: string;
  active: boolean;
}

export interface AuditRecord {
  auditId: string;
  category: 'AUTH' | 'AUTHORIZATION' | 'CONSENT' | 'RESOURCE_ACCESS' | 'EXCHANGE' | 'BREAK_GLASS';
  actorId: string;
  patientId?: string;
  action: string;
  outcome: 'SUCCESS' | 'DENIED' | 'FLAGGED';
  details: string;
  timestamp: Date;
}
