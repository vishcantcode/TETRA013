import { PlatformHealthReport, EngineHealthItem } from '../interfaces/HealthStatus';
import { ClinicalContainer } from '../container/ClinicalContainer';

export class HealthCheckService {
  public static checkHealth(): PlatformHealthReport {
    const container = ClinicalContainer.getInstance();
    const engineHealths: EngineHealthItem[] = [
      { packageName: '@healthsense/clinical-models', status: 'HEALTHY', version: '1.0.0', responseTimeMs: 1 },
      { packageName: '@healthsense/clinical-intelligence', status: container.clinicalEngine ? 'HEALTHY' : 'UNHEALTHY', version: '1.0.0', responseTimeMs: 2 },
      { packageName: '@healthsense/clinical-explainability', status: container.explainabilityEngine ? 'HEALTHY' : 'UNHEALTHY', version: '1.0.0', responseTimeMs: 2 },
      { packageName: '@healthsense/clinical-referrals', status: container.referralEngine ? 'HEALTHY' : 'UNHEALTHY', version: '1.0.0', responseTimeMs: 1 },
      { packageName: '@healthsense/patient-engagement', status: container.educationEngine ? 'HEALTHY' : 'UNHEALTHY', version: '1.0.0', responseTimeMs: 3 },
      { packageName: '@healthsense/medical-document-intelligence', status: container.documentEngine ? 'HEALTHY' : 'UNHEALTHY', version: '1.0.0', responseTimeMs: 4 },
      { packageName: '@healthsense/patient-digital-twin', status: container.digitalTwinEngine ? 'HEALTHY' : 'UNHEALTHY', version: '1.0.0', responseTimeMs: 5 },
      { packageName: '@healthsense/population-health', status: container.populationEngine ? 'HEALTHY' : 'UNHEALTHY', version: '1.0.0', responseTimeMs: 3 }
    ];

    const allHealthy = engineHealths.every(e => e.status === 'HEALTHY');

    return {
      platformName: 'HealthSense AI Clinical Decision Platform',
      overallStatus: allHealthy ? 'HEALTHY' : 'DEGRADED',
      timestamp: new Date().toISOString(),
      engineHealths
    };
  }
}
