import { PatientTwin } from '@healthsense/patient-digital-twin';
import { LongitudinalInsight } from './domain';
import { TimelineEngine } from './timeline';
import { TrendAnalysisEngine } from './analytics/trend-analysis';
import { TrajectoryEngine } from './analytics/trajectory';
import { InterventionEffectivenessEngine } from './analytics/intervention';
import { AdherenceIntelligenceEngine } from './analytics/adherence';
import { RiskEvolutionEngine } from './analytics/risk';
import { PredictionEngine } from './analytics/prediction';

export class LongitudinalIntelligenceEngine {
  private timelineEngine = new TimelineEngine();
  private trendEngine = new TrendAnalysisEngine();
  private trajectoryEngine = new TrajectoryEngine();
  private interventionEngine = new InterventionEffectivenessEngine();
  private adherenceEngine = new AdherenceIntelligenceEngine();
  private riskEngine = new RiskEvolutionEngine();
  private predictionEngine = new PredictionEngine();

  public analyze(twin: PatientTwin): LongitudinalInsight[] {
    const startTime = Date.now();
    const insights: LongitudinalInsight[] = [];

    // 1. Reconstruct Timeline
    const timeline = this.timelineEngine.reconstruct(twin);

    // 2. Trend Analysis
    const trends = this.trendEngine.analyze(timeline);
    trends.forEach(t => insights.push({ id: `ins-${Date.now()}-${Math.random()}`, type: 'trend', payload: t, timestamp: new Date() }));

    // 3. Trajectory Modelling
    const trajectories = this.trajectoryEngine.infer(timeline, trends);
    trajectories.forEach(t => insights.push({ id: `ins-${Date.now()}-${Math.random()}`, type: 'trajectory', payload: t, timestamp: new Date() }));

    // 4. Intervention Effectiveness
    const interventions = this.interventionEngine.evaluate(timeline, trends);
    interventions.forEach(i => insights.push({ id: `ins-${Date.now()}-${Math.random()}`, type: 'intervention', payload: i, timestamp: new Date() }));

    // 5. Adherence Intelligence
    const adherence = this.adherenceEngine.generate(timeline);
    adherence.forEach(a => insights.push({ id: `ins-${Date.now()}-${Math.random()}`, type: 'adherence', payload: a, timestamp: new Date() }));

    // 6. Risk Evolution
    const risks = this.riskEngine.analyze(timeline);
    risks.forEach(r => insights.push({ id: `ins-${Date.now()}-${Math.random()}`, type: 'risk', payload: r, timestamp: new Date() }));

    // 7. Prediction Signals
    const predictions = this.predictionEngine.identifySignals(timeline);
    predictions.forEach(p => insights.push({ id: `ins-${Date.now()}-${Math.random()}`, type: 'signal', payload: p, timestamp: new Date() }));

    // Observability (Mocked for brevity)
    const duration = Date.now() - startTime;
    console.log(`[LCIE] Analyzed twin ${twin.patientId} in ${duration}ms, generated ${insights.length} insights.`);

    return insights;
  }
}
