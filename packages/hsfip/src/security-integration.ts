// ============================================================================
// HSFIP – Capability 6: Security Enforcement & Policy Integration
// ============================================================================

import { SMARTContext, SMARTSecurityPolicyResult } from './types';
import { hpie } from '@healthsense/hpie';
import { createHIEKContext } from '@healthsense/hiek';

export class HSFIPSecurityIntegrationEngine {

  /**
   * Evaluate SMART requested scopes and context against HPIE security policies & RBAC rules.
   */
  public async evaluateSecurityPolicy(
    context: SMARTContext,
    requiredPermission = 'clinical:read'
  ): Promise<SMARTSecurityPolicyResult> {
    const hiekCtx = createHIEKContext({
      patientId: context.patientId,
      user: {
        id: context.practitionerId || 'prac-smart-3003',
        email: 'clinician@healthsense.ai',
        role: 'clinician',
      },
    });

    // Leverage HPIE (Policy Intelligence Engine)
    const hpieResult = await hpie.evaluate(hiekCtx, {
      requiredRole: 'clinician',
      confidenceScore: 0.95,
    });

    const deniedScopes: string[] = [];
    for (const scope of context.grantedScopes) {
      if (scope.includes('admin') || scope.includes('system')) {
        deniedScopes.push(scope);
      }
    }

    const isHpieAllowed = hpieResult.decisionOutcome === 'ALLOW' || hpieResult.decisionOutcome === 'ALLOW_WITH_WARNINGS';
    const authorized = isHpieAllowed && deniedScopes.length === 0 && context.active;

    return {
      authorized,
      deniedScopes,
      evaluatedPolicy: `HPIE_Policy_${hpieResult.matchedPolicies[0] || 'SECURITY_RBAC_POLICY'}`,
      reason: authorized
        ? 'Authorization granted by HPIE policy engine and scope validation.'
        : `Access denied: ${hpieResult.rationale || 'Restricted scopes or inactive context.'}`,
    };
  }
}
