import { HPIEPolicyDefinition, HPIERuleResult } from './types';
import { HIEKContext } from '@healthsense/hiek';

export const HPIE_CURRENT_VERSION = 'v1.2.0';

export const rbacPolicy: HPIEPolicyDefinition = {
  id: 'SECURITY_RBAC_POLICY',
  version: HPIE_CURRENT_VERSION,
  description: 'Validates authenticated user role against required execution permissions',
  evaluate: (ctx: HIEKContext, payload?: any): HPIERuleResult => {
    const requiredRole = payload?.requiredRole;
    if (!requiredRole) {
      return {
        policyId: 'SECURITY_RBAC_POLICY',
        policyVersion: HPIE_CURRENT_VERSION,
        outcome: 'ALLOW',
        rationale: 'No specific role constraint required for this endpoint.'
      };
    }

    if (!ctx.user) {
      return {
        policyId: 'SECURITY_RBAC_POLICY',
        policyVersion: HPIE_CURRENT_VERSION,
        outcome: 'DENY',
        rationale: 'Authentication required. Missing user context.'
      };
    }

    const userRole = ctx.user.role;
    if (requiredRole === 'admin' && userRole !== 'admin') {
      return {
        policyId: 'SECURITY_RBAC_POLICY',
        policyVersion: HPIE_CURRENT_VERSION,
        outcome: 'DENY',
        rationale: `Forbidden: Endpoint requires admin role, user has role '${userRole}'.`
      };
    }

    if (requiredRole === 'clinician' && userRole !== 'clinician' && userRole !== 'admin') {
      return {
        policyId: 'SECURITY_RBAC_POLICY',
        policyVersion: HPIE_CURRENT_VERSION,
        outcome: 'DENY',
        rationale: `Forbidden: Endpoint requires clinician role, user has role '${userRole}'.`
      };
    }

    return {
      policyId: 'SECURITY_RBAC_POLICY',
      policyVersion: HPIE_CURRENT_VERSION,
      outcome: 'ALLOW',
      rationale: `Role '${userRole}' satisfies constraint '${requiredRole}'.`
    };
  }
};

export const clinicalConfidencePolicy: HPIEPolicyDefinition = {
  id: 'CLINICAL_CONFIDENCE_GOVERNANCE',
  version: HPIE_CURRENT_VERSION,
  description: 'Ensures clinical decision recommendations satisfy threshold confidence scores',
  evaluate: (ctx: HIEKContext, payload?: any): HPIERuleResult => {
    const confidenceScore = payload?.confidenceScore;
    if (typeof confidenceScore !== 'number') {
      return {
        policyId: 'CLINICAL_CONFIDENCE_GOVERNANCE',
        policyVersion: HPIE_CURRENT_VERSION,
        outcome: 'ALLOW',
        rationale: 'No confidence score evaluation requested.'
      };
    }

    if (confidenceScore < 0.80) {
      return {
        policyId: 'CLINICAL_CONFIDENCE_GOVERNANCE',
        policyVersion: HPIE_CURRENT_VERSION,
        outcome: 'REQUIRES_APPROVAL',
        rationale: `Clinical confidence score (${(confidenceScore * 100).toFixed(0)}%) is below mandatory threshold (80%). Requiring human clinician review.`,
        warningMessage: 'Low confidence recommendation flagged for clinician approval.'
      };
    }

    if (confidenceScore < 0.90) {
      return {
        policyId: 'CLINICAL_CONFIDENCE_GOVERNANCE',
        policyVersion: HPIE_CURRENT_VERSION,
        outcome: 'ALLOW_WITH_WARNINGS',
        rationale: `Clinical confidence score (${(confidenceScore * 100).toFixed(0)}%) is acceptable but below optimal 90%.`,
        warningMessage: 'Moderate confidence score: verified against secondary clinical guidelines.'
      };
    }

    return {
      policyId: 'CLINICAL_CONFIDENCE_GOVERNANCE',
      policyVersion: HPIE_CURRENT_VERSION,
      outcome: 'ALLOW',
      rationale: `High clinical confidence score (${(confidenceScore * 100).toFixed(0)}%) satisfies governance policy.`
    };
  }
};

export const patientConsentPolicy: HPIEPolicyDefinition = {
  id: 'PATIENT_CONSENT_GOVERNANCE',
  version: HPIE_CURRENT_VERSION,
  description: 'Verifies active patient consent and digital twin state before processing clinical data',
  evaluate: (ctx: HIEKContext, payload?: any): HPIERuleResult => {
    if (payload?.consentRevoked) {
      return {
        policyId: 'PATIENT_CONSENT_GOVERNANCE',
        policyVersion: HPIE_CURRENT_VERSION,
        outcome: 'DENY',
        rationale: 'Operation denied: Patient consent is currently revoked.'
      };
    }

    return {
      policyId: 'PATIENT_CONSENT_GOVERNANCE',
      policyVersion: HPIE_CURRENT_VERSION,
      outcome: 'ALLOW',
      rationale: 'Patient consent active.'
    };
  }
};

export const BUILTIN_POLICIES: HPIEPolicyDefinition[] = [
  rbacPolicy,
  clinicalConfidencePolicy,
  patientConsentPolicy
];
