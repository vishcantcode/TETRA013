// ============================================================================
// HPSOP – Performance, Scalability & Optimization Platform
// Shared Types & Interfaces
// ============================================================================

export interface PercentileLatency {
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
}

export interface SubsystemPerformanceProfile {
  subsystem: string;
  category: 'API' | 'DATABASE' | 'AI_INFERENCE' | 'UI_RENDER' | 'INTEROPERABILITY';
  requestsPerSecond: number;
  latency: PercentileLatency;
  memoryUsageMb: number;
  cpuUtilizationPercent: number;
  status: 'OPTIMAL' | 'ACCEPTABLE' | 'BOTTLENECK';
}

export interface BatchOptimizationConfig {
  batchId: string;
  entityType: 'PATIENT' | 'OBSERVATION' | 'MEDICATION_ORDER';
  batchSize: number;
  parallelConcurrency: number;
  executionTimeMs: number;
  throughputPerSec: number;
}

export interface PartitioningConfig {
  partitionKey: string;
  totalPartitions: number;
  activeNodes: number;
  workloadDistributionPercent: number;
  autoscalingTargetPercent: number;
}

export interface ResourceUtilizationMetrics {
  cpuCoresAllocated: number;
  cpuUsagePercent: number;
  memoryAllocatedGb: number;
  memoryUsedGb: number;
  networkThroughputMbps: number;
  cacheHitRatePercent: number;
}

export interface LoadTestScenario {
  scenarioId: string;
  name: string;
  concurrentVirtualUsers: number;
  targetRPS: number;
  durationSeconds: number;
}

export interface LoadTestResult {
  scenarioId: string;
  completedRequests: number;
  failedRequests: number;
  achievedRPS: number;
  latencyP95Ms: number;
  latencyP99Ms: number;
  passedQualityGate: boolean;
}

export interface PerformanceDashboardView {
  scalabilityScore: number; // 0 - 100
  totalRequestsPerSecond: number;
  systemPercentiles: PercentileLatency;
  resourceMetrics: ResourceUtilizationMetrics;
  topSubsystemProfiles: SubsystemPerformanceProfile[];
  activePartitions: PartitioningConfig;
  optimizationRecommendations: string[];
  generatedAt: Date;
}
