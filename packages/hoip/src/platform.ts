import { HOIPAnalyticsEngine } from './analytics';
import { HOIPRecommendationEngine } from './recommendations';
import { HOIPAlertEngine } from './alerts';
import { HOIPExecutionMetrics, HOIPRecommendation, HOIPAlert } from './types';

export class HealthSenseOperationalIntelligencePlatform {
  private static instance: HealthSenseOperationalIntelligencePlatform;
  private analyticsEngine = HOIPAnalyticsEngine.getInstance();

  public static getInstance(): HealthSenseOperationalIntelligencePlatform {
    if (!HealthSenseOperationalIntelligencePlatform.instance) {
      HealthSenseOperationalIntelligencePlatform.instance = new HealthSenseOperationalIntelligencePlatform();
    }
    return HealthSenseOperationalIntelligencePlatform.instance;
  }

  public async getOperationalDashboard(): Promise<{
    metrics: HOIPExecutionMetrics;
    recommendations: HOIPRecommendation[];
    alerts: HOIPAlert[];
    systemStatus: 'OPTIMAL' | 'DEGRADED' | 'CRITICAL';
    timestamp: Date;
  }> {
    const metrics = await this.analyticsEngine.computeMetrics();
    const recommendations = HOIPRecommendationEngine.generateRecommendations(metrics);
    const alerts = HOIPAlertEngine.evaluateAlerts(metrics);

    const systemStatus = alerts.some(a => a.severity === 'CRITICAL') ? 'CRITICAL' 
                       : alerts.some(a => a.severity === 'WARNING') ? 'DEGRADED' 
                       : 'OPTIMAL';

    return {
      metrics,
      recommendations,
      alerts,
      systemStatus,
      timestamp: new Date()
    };
  }
}

export const hoip = HealthSenseOperationalIntelligencePlatform.getInstance();
