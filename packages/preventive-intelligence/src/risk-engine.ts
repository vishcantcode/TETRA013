import { RiskAssessment, RiskFactor, RiskTrend, RiskScore } from './domain';

function extractProfile(twin: any): any {
  if (twin?.profile) return twin.profile;
  if (twin?.state?.profile) return twin.state.profile;
  if (twin?.state) return twin.state;
  return {};
}

export class RiskAnalysisEngine {
  public calculateRisk(twin: any, trends: RiskTrend[]): RiskAssessment {
    const factors: RiskFactor[] = [];
    let overallRisk = 10; // Base risk
    const profile = extractProfile(twin);
    const lifestyle = profile.lifestyle || {};

    // Detect demographic risks
    if (lifestyle.smoking) {
      overallRisk += 20;
      factors.push({ id: crypto.randomUUID(), category: 'lifestyle', description: 'Active smoking', severity: 'high', confidence: 1.0 });
    }

    // Adjust based on trends
    trends.forEach(t => {
      if (t.direction === 'rapid_deterioration') {
        overallRisk += 30;
        factors.push({ id: crypto.randomUUID(), category: 'clinical', description: `Rapid deterioration in ${t.metric}`, severity: 'critical', confidence: 0.95 });
      }
      if (t.direction === 'persistent_non_adherence') {
        overallRisk += 15;
        factors.push({ id: crypto.randomUUID(), category: 'behavioral', description: 'Persistent non-adherence', severity: 'medium', confidence: 0.9 });
      }
    });

    const score: RiskScore = {
      overallRisk: Math.min(overallRisk, 100),
      cardiovascularRisk: lifestyle.smoking ? 40 : 10,
      metabolicRisk: 15
    };

    return {
      score,
      factors,
      trends,
      generatedAt: new Date()
    };
  }
}
