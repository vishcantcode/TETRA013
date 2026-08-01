import { LongitudinalIntelligenceEngine } from '@healthsense/longitudinal-intelligence';

export interface HCIPLongitudinalReport {
  patientId: string;
  evaluatedAt: Date;
  trendDirection: 'IMPROVING' | 'STABLE' | 'DETERIORATING';
  keyInsights: { id: string; type: string; message: string; timestamp: Date }[];
}

export class HCIPLongitudinalEngine {
  private lcie = new LongitudinalIntelligenceEngine();

  public analyzePatientHistory(patientId: string, twinState: any): HCIPLongitudinalReport {
    const rawInsights = this.lcie.analyze(twinState);

    const keyInsights = rawInsights.map((insight: any) => ({
      id: insight.id || `ins-${Date.now()}`,
      type: insight.type || 'observation',
      message: insight.message || 'Longitudinal vital monitoring stable.',
      timestamp: insight.timestamp || new Date()
    }));

    const deteriorating = keyInsights.some(i => i.message.toLowerCase().includes('elevated') || i.message.toLowerCase().includes('high'));
    const trendDirection = deteriorating ? 'DETERIORATING' : 'STABLE';

    return {
      patientId,
      evaluatedAt: new Date(),
      trendDirection,
      keyInsights
    };
  }
}
