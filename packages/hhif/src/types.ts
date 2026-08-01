// ============================================================================
// HHIF – Healthcare Interoperability Foundation
// Shared FHIR R4 Types & Interfaces
// ============================================================================

// ---------------------------------------------------------------------------
// FHIR R4 Common Data Types
// ---------------------------------------------------------------------------

export interface FHIRMeta {
  versionId?: string;
  lastUpdated?: string;
  source?: string;
  profile?: string[];
}

export interface FHIRCoding {
  system?: string;
  code?: string;
  display?: string;
  version?: string;
}

export interface FHIRCodeableConcept {
  coding?: FHIRCoding[];
  text?: string;
}

export interface FHIRReference {
  reference?: string;
  type?: string;
  display?: string;
}

export interface FHIRQuantity {
  value?: number;
  unit?: string;
  system?: string;
  code?: string;
}

export interface FHIRPeriod {
  start?: string;
  end?: string;
}

export interface FHIRIdentifier {
  system?: string;
  value?: string;
  use?: string;
}

export interface FHIRHumanName {
  use?: string;
  family?: string;
  given?: string[];
  prefix?: string[];
}

// ---------------------------------------------------------------------------
// Base FHIR R4 Resource Interface
// ---------------------------------------------------------------------------

export interface FHIRResource {
  resourceType: string;
  id?: string;
  meta?: FHIRMeta;
  implicitRules?: string;
  language?: string;
}

// ---------------------------------------------------------------------------
// 17 Supported Core FHIR R4 Resources
// ---------------------------------------------------------------------------

export interface FHIRPatient extends FHIRResource {
  resourceType: 'Patient';
  identifier?: FHIRIdentifier[];
  active?: boolean;
  name?: FHIRHumanName[];
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
}

export interface FHIRPractitioner extends FHIRResource {
  resourceType: 'Practitioner';
  identifier?: FHIRIdentifier[];
  active?: boolean;
  name?: FHIRHumanName[];
  qualification?: { code?: FHIRCodeableConcept }[];
}

export interface FHIREncounter extends FHIRResource {
  resourceType: 'Encounter';
  status: 'planned' | 'arrived' | 'in-progress' | 'finished' | 'cancelled';
  class: FHIRCoding;
  subject?: FHIRReference;
  period?: FHIRPeriod;
}

export interface FHIRObservation extends FHIRResource {
  resourceType: 'Observation';
  status: 'registered' | 'preliminary' | 'final' | 'amended';
  category?: FHIRCodeableConcept[];
  code: FHIRCodeableConcept;
  subject?: FHIRReference;
  effectiveDateTime?: string;
  valueQuantity?: FHIRQuantity;
  valueString?: string;
}

export interface FHIRCondition extends FHIRResource {
  resourceType: 'Condition';
  clinicalStatus?: FHIRCodeableConcept;
  verificationStatus?: FHIRCodeableConcept;
  category?: FHIRCodeableConcept[];
  code?: FHIRCodeableConcept;
  subject: FHIRReference;
  onsetDateTime?: string;
}

export interface FHIRAllergyIntolerance extends FHIRResource {
  resourceType: 'AllergyIntolerance';
  clinicalStatus?: FHIRCodeableConcept;
  verificationStatus?: FHIRCodeableConcept;
  type?: 'allergy' | 'intolerance';
  code?: FHIRCodeableConcept;
  patient: FHIRReference;
}

export interface FHIRMedication extends FHIRResource {
  resourceType: 'Medication';
  code?: FHIRCodeableConcept;
  status?: 'active' | 'inactive' | 'entered-in-error';
}

export interface FHIRMedicationRequest extends FHIRResource {
  resourceType: 'MedicationRequest';
  status: 'active' | 'on-hold' | 'cancelled' | 'completed';
  intent: 'proposal' | 'plan' | 'order';
  medicationCodeableConcept?: FHIRCodeableConcept;
  subject: FHIRReference;
  authoredOn?: string;
}

export interface FHIRProcedure extends FHIRResource {
  resourceType: 'Procedure';
  status: 'preparation' | 'in-progress' | 'completed';
  code?: FHIRCodeableConcept;
  subject: FHIRReference;
  performedDateTime?: string;
}

export interface FHIRDiagnosticReport extends FHIRResource {
  resourceType: 'DiagnosticReport';
  status: 'registered' | 'partial' | 'preliminary' | 'final';
  code: FHIRCodeableConcept;
  subject?: FHIRReference;
  effectiveDateTime?: string;
  result?: FHIRReference[];
}

export interface FHIRCarePlan extends FHIRResource {
  resourceType: 'CarePlan';
  status: 'draft' | 'active' | 'on-hold' | 'completed';
  intent: 'proposal' | 'plan' | 'order';
  subject: FHIRReference;
  activity?: { detail?: { code?: FHIRCodeableConcept; status?: string } }[];
}

export interface FHIRGoal extends FHIRResource {
  resourceType: 'Goal';
  lifecycleStatus: 'proposed' | 'planned' | 'accepted' | 'active' | 'completed';
  description: FHIRCodeableConcept;
  subject: FHIRReference;
  target?: { measure?: FHIRCodeableConcept; detailQuantity?: FHIRQuantity }[];
}

export interface FHIRServiceRequest extends FHIRResource {
  resourceType: 'ServiceRequest';
  status: 'draft' | 'active' | 'on-hold' | 'completed';
  intent: 'proposal' | 'plan' | 'order';
  code?: FHIRCodeableConcept;
  subject: FHIRReference;
  occurrenceDateTime?: string;
}

export interface FHIRImmunization extends FHIRResource {
  resourceType: 'Immunization';
  status: 'completed' | 'entered-in-error' | 'not-done';
  vaccineCode: FHIRCodeableConcept;
  patient: FHIRReference;
  occurrenceDateTime?: string;
}

export interface FHIROrganization extends FHIRResource {
  resourceType: 'Organization';
  identifier?: FHIRIdentifier[];
  active?: boolean;
  name?: string;
}

export interface FHIRLocation extends FHIRResource {
  resourceType: 'Location';
  status?: 'active' | 'suspended' | 'inactive';
  name?: string;
  mode?: 'instance' | 'kind';
}

export interface FHIRDevice extends FHIRResource {
  resourceType: 'Device';
  status?: 'active' | 'inactive' | 'entered-in-error';
  deviceName?: { name?: string; type?: string }[];
  modelNumber?: string;
}

// ---------------------------------------------------------------------------
// FHIR Bundle Resource
// ---------------------------------------------------------------------------

export interface FHIRBundleEntry {
  fullUrl?: string;
  resource?: FHIRResource;
}

export interface FHIRBundle extends FHIRResource {
  resourceType: 'Bundle';
  type: 'document' | 'message' | 'transaction' | 'transaction-response' | 'batch' | 'batch-response' | 'history' | 'searchset' | 'collection';
  total?: number;
  entry?: FHIRBundleEntry[];
}

// ---------------------------------------------------------------------------
// Interoperability & Validation Interfaces
// ---------------------------------------------------------------------------

export interface FHIRValidationError {
  path: string;
  message: string;
  severity: 'error' | 'warning' | 'information';
  code: string;
}

export interface FHIRValidationReport {
  isValid: boolean;
  resourceType: string;
  resourceId?: string;
  errors: FHIRValidationError[];
  warnings: FHIRValidationError[];
}

export interface FHIRProvenanceRecord {
  provenanceId: string;
  targetResourceId: string;
  targetResourceType: string;
  recorded: Date;
  agent: string;
  originatingModule: string;
  action: 'CREATE' | 'UPDATE' | 'IMPORT' | 'EXPORT' | 'TRANSFORM';
}

export interface DomainMappingResult<T> {
  domainModel: T;
  generatedFHIRResources: FHIRResource[];
  roundTripSuccess: boolean;
  semanticLossReported: boolean;
}
