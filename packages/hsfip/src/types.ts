// ============================================================================
// HSFIP – SMART on FHIR Integration Platform
// Shared Types & Interfaces
// ============================================================================

export type SMARTLaunchMode = 'EHR_LAUNCH' | 'STANDALONE_LAUNCH' | 'PATIENT_LAUNCH' | 'PRACTITIONER_LAUNCH';

export interface SMARTPKCEChallenge {
  codeVerifier: string;
  codeChallenge: string;
  codeChallengeMethod: 'S256';
}

export interface SMARTAuthRequest {
  clientId: string;
  redirectUri: string;
  scope: string; // e.g. "patient/*.read user/*.read launch/patient openid fhirUser"
  state: string;
  aud: string; // FHIR server base URL
  launch?: string; // launch token for EHR launch
  pkce?: SMARTPKCEChallenge;
}

export interface SMARTTokenResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number; // seconds
  refresh_token?: string;
  scope: string;
  id_token?: string;
  patient?: string;
  encounter?: string;
  need_patient_banner?: boolean;
  intent?: string;
  issuedAt: Date;
}

export interface SMARTContext {
  patientId?: string;
  practitionerId?: string;
  encounterId?: string;
  organizationId?: string;
  grantedScopes: string[];
  fhirBaseUrl: string;
  tokenResponse: SMARTTokenResponse;
  active: boolean;
}

export interface SMARTWellKnownMetadata {
  authorization_endpoint: string;
  token_endpoint: string;
  token_endpoint_auth_methods_supported?: string[];
  registration_endpoint?: string;
  scopes_supported: string[];
  response_types_supported: string[];
  capabilities: string[];
}

export interface FHIRCapabilityStatement {
  resourceType: 'CapabilityStatement';
  status: 'active';
  fhirVersion: '4.0.1';
  format: string[];
  rest: {
    mode: 'server';
    security?: {
      service?: { coding?: { code: string; display: string }[] }[];
      extension?: { url: string; valueUri?: string }[];
    };
    resource: {
      type: string;
      interaction: { code: string }[];
    }[];
  }[];
}

export interface SMARTClientConfig {
  clientId: string;
  fhirBaseUrl: string;
  redirectUri: string;
  scopes: string[];
  autoRefresh?: boolean;
}

export interface SMARTSecurityPolicyResult {
  authorized: boolean;
  deniedScopes: string[];
  evaluatedPolicy: string;
  reason: string;
}
