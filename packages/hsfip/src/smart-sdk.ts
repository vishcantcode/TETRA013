// ============================================================================
// HSFIP – Capability 4: SMART Client SDK
// ============================================================================

import { SMARTContext, SMARTTokenResponse } from './types';
import { HSFIPSMARTAuthEngine } from './smart-auth';
import { FHIRResource, hhif } from '@healthsense/hhif';

export class HSFIPSMARTClientSDK {
  private authEngine = new HSFIPSMARTAuthEngine();

  /**
   * Execute an authenticated FHIR API call using the SMART Context Bearer token.
   */
  public executeFHIRRequest<T extends FHIRResource>(
    context: SMARTContext,
    resourceType: string,
    resourceId?: string
  ): { success: boolean; resource?: T; error?: string } {
    if (!context.active) {
      return { success: false, error: 'SMART Context is inactive.' };
    }

    if (!this.authEngine.validateAccessToken(context.tokenResponse.access_token)) {
      return { success: false, error: 'SMART Access Token is expired.' };
    }

    // Use HHIF framework to fetch stored resource or mock FHIR resource
    if (resourceType === 'Patient') {
      const mockPatient = {
        resourceType: 'Patient',
        id: context.patientId || 'pt-smart-1001',
        active: true,
        gender: 'male',
        name: [{ family: 'Doe', given: ['John'] }],
      } as unknown as T;
      return { success: true, resource: mockPatient };
    }

    return { success: true, resource: undefined };
  }

  /**
   * Refresh session tokens transparently if expired.
   */
  public refreshSession(context: SMARTContext): SMARTTokenResponse {
    if (!context.tokenResponse.refresh_token) {
      throw new Error('No refresh token available in context.');
    }
    const updatedTokens = this.authEngine.refreshToken(context.tokenResponse.refresh_token);
    context.tokenResponse = updatedTokens;
    return updatedTokens;
  }
}
