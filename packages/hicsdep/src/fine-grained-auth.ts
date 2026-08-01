// ============================================================================
// HICSDEP – Capability 3: Fine-Grained Healthcare Authorization
// ============================================================================

import { FineGrainedAuthorizationRequest } from './types';
import { hpie } from '@healthsense/hpie';
import { createHIEKContext } from '@healthsense/hiek';

export class HICSDEPFineGrainedAuthorizationEngine {

  /**
   * Evaluate fine-grained healthcare authorization request using HPIE policies.
   */
  public async authorizeRequest(req: FineGrainedAuthorizationRequest): Promise<{
    authorized: boolean;
    reason: string;
    evaluatedPolicy: string;
  }> {
    // 1. Check Sensitivity Level restrictions
    if (req.sensitivityLevel === 'VERY_RESTRICTED' && req.purposeOfUse !== 'EMERGENCY') {
      return {
        authorized: false,
        reason: 'Access denied: VERY_RESTRICTED resources require EMERGENCY purpose of use or explicit break-glass override.',
        evaluatedPolicy: 'HICSDEP_Sensitivity_Policy',
      };
    }

    // 2. Evaluate via HPIE
    const hiekCtx = createHIEKContext({
      patientId: req.patientId,
      user: {
        id: req.practitionerId,
        email: 'practitioner@hospital.org',
        role: 'clinician',
      },
    });

    const hpieResult = await hpie.evaluate(hiekCtx, {
      requiredRole: 'clinician',
      confidenceScore: 0.95,
    });

    const authorized = hpieResult.decisionOutcome === 'ALLOW' || hpieResult.decisionOutcome === 'ALLOW_WITH_WARNINGS';

    return {
      authorized,
      reason: authorized ? 'Authorization granted by HPIE & HICSDEP sensitivity policy.' : hpieResult.rationale,
      evaluatedPolicy: `HPIE_Policy_${hpieResult.matchedPolicies[0] || 'RBAC'}`,
    };
  }
}
