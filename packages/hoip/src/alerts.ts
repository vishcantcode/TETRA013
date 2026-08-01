import { HOIPAlert, HOIPExecutionMetrics } from './types';
import crypto from 'node:crypto';

export class HOIPAlertEngine {
  public static evaluateAlerts(metrics: HOIPExecutionMetrics): HOIPAlert[] {
    const alerts: HOIPAlert[] = [];

    if (metrics.averageLatencyMs > 50) {
      alerts.push({
        id: crypto.randomUUID(),
        severity: 'WARNING',
        title: 'Platform Average Latency Exceeds SLA',
        message: `Average response latency (${metrics.averageLatencyMs}ms) exceeded 50ms target SLA.`,
        metric: 'averageLatencyMs',
        currentValue: metrics.averageLatencyMs,
        thresholdValue: 50,
        timestamp: new Date()
      });
    }

    if (metrics.policyDenialCount > 10) {
      alerts.push({
        id: crypto.randomUUID(),
        severity: 'WARNING',
        title: 'Elevated HPIE Policy Rejection Rate',
        message: `High frequency of policy rejections detected (${metrics.policyDenialCount} denys).`,
        metric: 'policyDenialCount',
        currentValue: metrics.policyDenialCount,
        thresholdValue: 10,
        timestamp: new Date()
      });
    }

    return alerts;
  }
}
