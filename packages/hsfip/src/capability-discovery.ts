// ============================================================================
// HSFIP – Capability 5: FHIR Capability Discovery Engine
// ============================================================================

import { SMARTWellKnownMetadata, FHIRCapabilityStatement } from './types';

export class HSFIPCapabilityDiscoveryEngine {
  private metadataCache: Map<string, SMARTWellKnownMetadata> = new Map();

  /**
   * Discover and parse `/.well-known/smart-configuration` metadata for a FHIR server base URL.
   */
  public discoverWellKnownMetadata(fhirBaseUrl: string): SMARTWellKnownMetadata {
    const cleanUrl = fhirBaseUrl.replace(/\/$/, '');
    const cached = this.metadataCache.get(cleanUrl);
    if (cached) return cached;

    // Simulated standard SMART on FHIR well-known metadata
    const metadata: SMARTWellKnownMetadata = {
      authorization_endpoint: `${cleanUrl}/oauth2/authorize`,
      token_endpoint: `${cleanUrl}/oauth2/token`,
      token_endpoint_auth_methods_supported: ['client_secret_basic', 'client_secret_post', 'none'],
      registration_endpoint: `${cleanUrl}/oauth2/register`,
      scopes_supported: [
        'openid',
        'profile',
        'fhirUser',
        'launch',
        'launch/patient',
        'patient/*.read',
        'patient/*.write',
        'user/*.read',
        'user/*.write',
        'offline_access',
      ],
      response_types_supported: ['code'],
      capabilities: [
        'launch-ehr',
        'launch-standalone',
        'client-public',
        'client-confidential-symmetric',
        'sso-openid-connect',
        'context-passthrough-banner',
        'context-passthrough-style',
        'permission-patient',
        'permission-user',
        'permission-offline',
      ],
    };

    this.metadataCache.set(cleanUrl, metadata);
    return metadata;
  }

  /**
   * Parse a FHIR server CapabilityStatement (/metadata).
   */
  public parseCapabilityStatement(fhirBaseUrl: string): FHIRCapabilityStatement {
    const cleanUrl = fhirBaseUrl.replace(/\/$/, '');

    return {
      resourceType: 'CapabilityStatement',
      status: 'active',
      fhirVersion: '4.0.1',
      format: ['application/fhir+json', 'application/json'],
      rest: [
        {
          mode: 'server',
          security: {
            service: [{ coding: [{ code: 'SMART-on-FHIR', display: 'SMART-on-FHIR' }] }],
            extension: [
              { url: 'http://fhir-registry.smarthealthit.org/StructureDefinition/oauth-uris', valueUri: `${cleanUrl}/oauth2/authorize` },
            ],
          },
          resource: [
            { type: 'Patient', interaction: [{ code: 'read' }, { code: 'search-type' }] },
            { type: 'Observation', interaction: [{ code: 'read' }, { code: 'search-type' }] },
            { type: 'Condition', interaction: [{ code: 'read' }, { code: 'search-type' }] },
            { type: 'MedicationRequest', interaction: [{ code: 'read' }, { code: 'search-type' }] },
          ],
        },
      ],
    };
  }
}
