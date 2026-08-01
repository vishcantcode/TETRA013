// ============================================================================
// HSFIP – Capability 2: SMART Application Launch Framework
// ============================================================================

import crypto from 'node:crypto';
import {
  SMARTLaunchMode,
  SMARTAuthRequest,
  SMARTTokenResponse,
  SMARTContext,
} from './types';
import { HSFIPSMARTAuthEngine } from './smart-auth';

export class HSFIPSMARTLaunchFramework {
  private authEngine = new HSFIPSMARTAuthEngine();

  /**
   * Initiate a SMART Application Launch (EHR Launch or Standalone Launch).
   */
  public initiateLaunch(
    launchMode: SMARTLaunchMode,
    fhirBaseUrl: string,
    clientId: string,
    redirectUri: string,
    requestedScopes: string[],
    launchToken?: string
  ): { authRequest: SMARTAuthRequest; authUrl: string } {
    const state = `state-${crypto.randomUUID().slice(0, 8)}`;
    const pkce = this.authEngine.generatePKCE();

    const scopeStr = requestedScopes.join(' ');
    const authEndpoint = `${fhirBaseUrl.replace(/\/$/, '')}/oauth2/authorize`;

    const authRequest: SMARTAuthRequest = {
      clientId,
      redirectUri,
      scope: scopeStr,
      state,
      aud: fhirBaseUrl,
      launch: launchMode === 'EHR_LAUNCH' ? launchToken || `launch-${crypto.randomUUID().slice(0, 8)}` : undefined,
      pkce,
    };

    const authUrl = this.authEngine.buildAuthorizationUrl(authEndpoint, authRequest);

    return { authRequest, authUrl };
  }

  /**
   * Complete a SMART Launch after receiving authorization code redirect back.
   */
  public completeLaunch(
    code: string,
    authRequest: SMARTAuthRequest,
    simulatedPatientId = 'pt-smart-1001'
  ): { tokenResponse: SMARTTokenResponse; context: SMARTContext } {
    const tokenResponse = this.authEngine.exchangeCodeForToken(code, authRequest, simulatedPatientId);

    const grantedScopes = tokenResponse.scope.split(' ').filter(Boolean);

    const context: SMARTContext = {
      patientId: tokenResponse.patient,
      practitionerId: 'prac-smart-3003',
      encounterId: tokenResponse.encounter,
      organizationId: 'org-smart-4004',
      grantedScopes,
      fhirBaseUrl: authRequest.aud,
      tokenResponse,
      active: true,
    };

    return { tokenResponse, context };
  }
}
