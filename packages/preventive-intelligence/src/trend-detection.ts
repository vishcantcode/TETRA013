import { RiskTrend, TrendDirection } from './domain';

function extractProfile(twin: any): any {
  if (twin?.profile) return twin.profile;
  if (twin?.state?.profile) return twin.state.profile;
  if (twin?.state) return twin.state;
  return {};
}

export class TrendDetectionEngine {
  public analyzeTrends(twin: any): RiskTrend[] {
    const trends: RiskTrend[] = [];
    const profile = extractProfile(twin);
    const vitals = profile.vitals || [];
    const behavior = profile.behavior || { adherenceScore: 100 };
    
    // Deterministic vital analysis
    if (Array.isArray(vitals) && vitals.length > 0) {
      const bmVitals = vitals.filter((v: any) => v.type === 'blood_pressure_sys').sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
      if (bmVitals.length >= 2) {
        const latest = bmVitals[bmVitals.length - 1].value;
        const previous = bmVitals[bmVitals.length - 2].value;
        const diff = latest - previous;
        
        let direction: TrendDirection = 'stable';
        if (diff > 10) direction = 'deteriorating';
        if (diff > 20) direction = 'rapid_deterioration';
        if (diff < -5) direction = 'improving';

        trends.push({
          metric: 'blood_pressure_sys',
          direction,
          historicalContext: `Systolic BP changed by ${diff} mmHg over last two readings.`,
          velocity: diff
        });
      }
    }

    // Lifestyle / behavior adherence
    if (behavior.adherenceScore !== undefined && behavior.adherenceScore < 50) {
      trends.push({
        metric: 'behavior_adherence',
        direction: 'persistent_non_adherence',
        historicalContext: 'Patient adherence score dropped below safe thresholds.',
        velocity: behavior.adherenceScore - 100
      });
    }

    return trends;
  }
}
