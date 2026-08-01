// ============================================================================
// HSFIP – Capability 1: SMART Authorization Engine
// ============================================================================

import crypto from 'node:crypto';
import {
  SMARTAuthRequest,
  SMARTPKCEChallenge,
  SMARTTokenResponse,
} from './types';

export class HSFIPSMARTAuthEngine {
  private static activeTokens: Map<string, SMARTTokenResponse> = new Map();

  /**
   * Generate S256 PKCE Code Verifier & Code Challenge pair.
   */
  public generatePKCE(): SMARTPKCEChallenge {
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');

    return {
      codeVerifier,
      codeChallenge,
      codeChallengeMethod: 'S256',
    };
  }

  /**
   * Construct standard SMART on FHIR OAuth 2.0 Authorization URL.
   */
  public buildAuthorizationUrl(
    authEndpoint: string,
    req: SMARTAuthRequest
  ): string {
    const url = new URL(authEndpoint);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', req.clientId);
    url.searchParams.set('redirect_uri', req.redirectUri);
    url.searchParams.set('scope', req.scope);
    url.searchParams.set('state', req.state);
    url.searchParams.set('aud', req.aud);

    if (req.launch) {
      url.searchParams.set('launch', req.launch);
    }

    if (req.pkce) {
      url.searchParams.set('code_challenge', req.pkce.codeChallenge);
      url.searchParams.set('code_challenge_method', req.pkce.codeChallengeMethod);
    }

    return url.toString();
  }

  /**
   * Exchange authorization code for SMART OAuth 2.0 access & refresh tokens.
   */
  public exchangeCodeForToken(
    code: string,
    req: SMARTAuthRequest,
    simulatedPatientId = 'pt-smart-1001'
  ): SMARTTokenResponse {
    if (!code) {
      throw new Error('SMART authorization error: Missing authorization code.');
    }

    const tokenResponse: SMARTTokenResponse = {
      access_token: `smart-access-${crypto.randomUUID().slice(0, 12)}`,
      token_type: 'Bearer',
      expires_in: 3600, // 1 hour
      refresh_token: `smart-refresh-${crypto.randomUUID().slice(0, 12)}`,
      scope: req.scope,
      id_token: `smart-id-${crypto.randomUUID().slice(0, 8)}`,
      patient: simulatedPatientId,
      encounter: 'enc-smart-2002',
      need_patient_banner: true,
      issuedAt: new Date(),
    };

    HSFIPSMARTAuthEngine.activeTokens.set(tokenResponse.access_token, tokenResponse);
    return tokenResponse;
  }

  /**
   * Refresh an expired access token using a refresh_token.
   */
  public refreshToken(refreshToken: string): SMARTTokenResponse {
    const existing = Array.from(HSFIPSMARTAuthEngine.activeTokens.values()).find(
      t => t.refresh_token === refreshToken
    );

    if (!existing) {
      throw new Error('SMART token refresh error: Invalid or expired refresh token.');
    }

    const newTokenResponse: SMARTTokenResponse = {
      ...existing,
      access_token: `smart-access-${crypto.randomUUID().slice(0, 12)}`,
      refresh_token: `smart-refresh-${crypto.randomUUID().slice(0, 12)}`,
      issuedAt: new Date(),
    };

    HSFIPSMARTAuthEngine.activeTokens.set(newTokenResponse.access_token, newTokenResponse);
    return newTokenResponse;
  }

  /**
   * Validate if an access token is active and unexpired.
   */
  public validateAccessToken(accessToken: string): boolean {
    const token = HSFIPSMARTAuthEngine.activeTokens.get(accessToken);
    if (!token) return false;

    const ageSeconds = (Date.now() - token.issuedAt.getTime()) / 1000;
    return ageSeconds < token.expires_in;
  }
}
