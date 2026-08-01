import { ClinicalContext } from '../context';

export interface RuleResult {
  triggered: boolean;
  action?: 'escalate' | 'warn' | 'block';
  reason?: string;
  priority: number;
}

export interface ClinicalRule {
  id: string;
  version: string;
  evaluate(context: ClinicalContext): RuleResult;
}

export class ClinicalRuleEngine {
  private rules: ClinicalRule[] = [];

  registerPack(rules: ClinicalRule[]) {
    this.rules.push(...rules);
  }

  execute(context: ClinicalContext): RuleResult[] {
    return this.rules
      .map(rule => rule.evaluate(context))
      .filter(res => res.triggered)
      .sort((a, b) => b.priority - a.priority);
  }
}
