import { HIEKContext } from '@healthsense/hiek';

export type HPIEDecisionOutcome = 
  | 'ALLOW'
  | 'ALLOW_WITH_WARNINGS'
  | 'REQUIRES_APPROVAL'
  | 'DEFER'
  | 'DENY';

export interface HPIERuleResult {
  policyId: string;
  policyVersion: string;
  outcome: HPIEDecisionOutcome;
  rationale: string;
  warningMessage?: string;
}

export interface HPIEEvaluationResult {
  decisionOutcome: HPIEDecisionOutcome;
  policyVersion: string;
  matchedPolicies: string[];
  ruleResults: HPIERuleResult[];
  rationale: string;
  warnings: string[];
  durationMs: number;
}

export interface HPIEPolicyDefinition {
  id: string;
  version: string;
  description: string;
  evaluate: (ctx: HIEKContext, payload?: any) => Promise<HPIERuleResult> | HPIERuleResult;
}
