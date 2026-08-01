export interface EngineHealthItem {
  packageName: string;
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  version: string;
  responseTimeMs: number;
}

export interface PlatformHealthReport {
  platformName: 'HealthSense AI Clinical Decision Platform';
  overallStatus: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  timestamp: string;
  engineHealths: EngineHealthItem[];
}
