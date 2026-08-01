import { HPIEDecisionOutcome, HPIEEvaluationResult, HPIEPolicyDefinition, HPIERuleResult } from './types';
import { BUILTIN_POLICIES, HPIE_CURRENT_VERSION } from './policies';
import { HIEKContext } from '@healthsense/hiek';

export class HealthSensePolicyIntelligenceEngine {
  private static instance: HealthSensePolicyIntelligenceEngine;
  private customPolicies: HPIEPolicyDefinition[] = [];

  public static getInstance(): HealthSensePolicyIntelligenceEngine {
    if (!HealthSensePolicyIntelligenceEngine.instance) {
      HealthSensePolicyIntelligenceEngine.instance = new HealthSensePolicyIntelligenceEngine();
    }
    return HealthSensePolicyIntelligenceEngine.instance;
  }

  public registerPolicy(policy: HPIEPolicyDefinition): void {
    this.customPolicies.push(policy);
  }

  public async evaluate(ctx: HIEKContext, payload?: any): Promise<HPIEEvaluationResult> {
    const startTime = Date.now();
    const allPolicies = [...BUILTIN_POLICIES, ...this.customPolicies];

    const ruleResults: HPIERuleResult[] = [];
    const matchedPolicies: string[] = [];
    const warnings: string[] = [];

    let overallOutcome: HPIEDecisionOutcome = 'ALLOW';

    for (const policy of allPolicies) {
      try {
        const res = await policy.evaluate(ctx, payload);
        ruleResults.push(res);
        matchedPolicies.push(policy.id);

        if (res.warningMessage) {
          warnings.push(res.warningMessage);
        }

        // Apply precedence: DENY > REQUIRES_APPROVAL > DEFER > ALLOW_WITH_WARNINGS > ALLOW
        if (res.outcome === 'DENY') {
          overallOutcome = 'DENY';
          break; // Immediate rejection on DENY
        } else if (res.outcome === 'REQUIRES_APPROVAL') {
          overallOutcome = 'REQUIRES_APPROVAL';
        } else if (res.outcome === 'DEFER' && overallOutcome !== 'REQUIRES_APPROVAL') {
          overallOutcome = 'DEFER';
        } else if (res.outcome === 'ALLOW_WITH_WARNINGS' && overallOutcome === 'ALLOW') {
          overallOutcome = 'ALLOW_WITH_WARNINGS';
        }
      } catch (err: any) {
        ruleResults.push({
          policyId: policy.id,
          policyVersion: policy.version,
          outcome: 'DENY',
          rationale: `Policy evaluation error in ${policy.id}: ${err.message}`
        });
        overallOutcome = 'DENY';
        break;
      }
    }

    const primaryRationale = ruleResults.length > 0 ? ruleResults[ruleResults.length - 1].rationale : 'All policies evaluated successfully.';

    return {
      decisionOutcome: overallOutcome,
      policyVersion: HPIE_CURRENT_VERSION,
      matchedPolicies,
      ruleResults,
      rationale: primaryRationale,
      warnings,
      durationMs: Date.now() - startTime
    };
  }
}

export const hpie = HealthSensePolicyIntelligenceEngine.getInstance();
