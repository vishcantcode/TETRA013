// ============================================================================
// HPRRP – Production Reliability & Resilience Platform
// Shared Types & Interfaces
// ============================================================================

export type ServiceHealthStatus = 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' | 'MAINTENANCE';

export interface ReadinessCheckResult {
  subsystem: string;
  status: ServiceHealthStatus;
  latencyMs: number;
  message: string;
  lastCheckedAt: Date;
}

export type FailureClass = 'NETWORK' | 'CONNECTOR' | 'AI_SERVICE' | 'DATABASE' | 'MEMORY_PRESSURE';

export interface FallbackStrategy {
  subsystem: string;
  failureClass: FailureClass;
  useFallbackData: boolean;
  cachedResponseAvailable: boolean;
  degradedMessage: string;
}

export interface SelfHealingAction {
  actionId: string;
  subsystem: string;
  triggerCondition: string;
  executedAction: 'RESTART_CONNECTOR' | 'PURGE_CACHE' | 'REBUILD_INDEX' | 'RESUME_WORKFLOW';
  success: boolean;
  recoveredAt: Date;
}

export interface FaultSimulationScenario {
  scenarioId: string;
  name: string;
  targetSubsystem: string;
  failureType: FailureClass;
  simulatedDurationSec: number;
}

export interface FaultInjectionResult {
  scenarioId: string;
  targetSubsystem: string;
  gracefulDegradationTriggered: boolean;
  selfHealingTriggered: boolean;
  recoveryVerified: boolean;
  mttrSeconds: number;
}

export interface CacheEntry<T = any> {
  key: string;
  category: 'FHIR_METADATA' | 'TERMINOLOGY' | 'CONFIGURATION' | 'DASHBOARD' | 'AI_METADATA';
  value: T;
  ttlSeconds: number;
  cachedAt: Date;
  expiresAt: Date;
}

export interface IncidentRecord {
  incidentId: string;
  subsystem: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  playbookExecuted: string;
  status: 'OPEN' | 'INVESTIGATING' | 'MITIGATED' | 'RESOLVED';
  mttrSeconds?: number;
  reportedAt: Date;
}

export interface ResilienceDashboardView {
  overallHealth: ServiceHealthStatus;
  resilienceScore: number; // 0 - 100
  activeServicesCount: number;
  degradedServicesCount: number;
  mttrAverageSeconds: number;
  availabilityPercent: number;
  subsystemHealthList: ReadinessCheckResult[];
  activeIncidents: IncidentRecord[];
  cacheHitRatioPercent: number;
  generatedAt: Date;
}
