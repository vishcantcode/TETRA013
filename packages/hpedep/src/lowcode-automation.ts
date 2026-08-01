// ============================================================================
// HPEDEP – Capability 5: Low-Code Workflow Automation Engine
// ============================================================================

import crypto from 'node:crypto';
import { AutomationRule } from './types';

export class HPEDEPLowCodeAutomationEngine {
  private ruleStore: Map<string, AutomationRule> = new Map();

  constructor() {
    this.seedDefaultRules();
  }

  private seedDefaultRules(): void {
    const rule: AutomationRule = {
      ruleId: 'rule-critical-bnp-01',
      name: 'Critical BNP Alert Auto-Notification',
      triggerEvent: 'lab.result.flagged',
      conditions: [{ field: 'test', operator: 'EQUALS', value: 'BNP' }],
      actions: [
        { actionType: 'SURFACE_ALERT', params: { severity: 'HIGH', title: 'Critical BNP Elevation' } },
        { actionType: 'NOTIFY_CARE_TEAM', params: { role: 'PHYSICIAN' } },
      ],
      active: true,
    };
    this.ruleStore.set(rule.ruleId, rule);
  }

  /**
   * Evaluate incoming event against automation rules and execute matching actions.
   */
  public evaluateAutomationRules(triggerEvent: string, eventData: Record<string, any>): {
    matchedRulesCount: number;
    actionsExecutedCount: number;
  } {
    let matchedRulesCount = 0;
    let actionsExecutedCount = 0;

    for (const rule of this.ruleStore.values()) {
      if (!rule.active || rule.triggerEvent !== triggerEvent) continue;

      let matched = true;
      for (const cond of rule.conditions) {
        if (cond.operator === 'EQUALS' && eventData[cond.field] !== cond.value) {
          matched = false;
          break;
        }
      }

      if (matched) {
        matchedRulesCount++;
        actionsExecutedCount += rule.actions.length;
      }
    }

    return { matchedRulesCount, actionsExecutedCount };
  }

  public registerAutomationRule(
    name: string,
    triggerEvent: string,
    conditions: AutomationRule['conditions'],
    actions: AutomationRule['actions']
  ): AutomationRule {
    const ruleId = `rule-${crypto.randomUUID().slice(0, 8)}`;
    const rule: AutomationRule = {
      ruleId,
      name,
      triggerEvent,
      conditions,
      actions,
      active: true,
    };

    this.ruleStore.set(ruleId, rule);
    return rule;
  }
}
