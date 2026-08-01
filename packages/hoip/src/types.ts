export interface HOIPExecutionMetrics {
  totalExecutions: number;
  averageLatencyMs: number;
  p95LatencyMs: number;
  cacheHitRatioPercent: number;
  aiStrategyRatioPercent: number;
  policyDenialCount: number;
  requiresApprovalCount: number;
  stateTransitionCount: number;
}

export interface HOIPRecommendation {
  id: string;
  category: 'CACHING' | 'AI_OPTIMIZATION' | 'POLICY_TUNING' | 'PERFORMANCE';
  title: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  suggestion: string;
  supportingEvidence: Record<string, any>;
  createdAt: Date;
}

export interface HOIPAlert {
  id: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  message: string;
  metric: string;
  currentValue: number;
  thresholdValue: number;
  timestamp: Date;
}
