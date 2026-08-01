import { Biomarker } from '../domain';
import { BiomarkerInsight, BiomarkerInsightSchema } from './types';
import { LongitudinalAnalyzer, TimeSeriesPoint } from './longitudinal-analyzer';

export class BiomarkerIntelligenceEngine {
  /**
   * Computes deterministic biomarker longitudinal insights from historical observations.
   */
  public static analyzeBiomarker(
    currentBiomarker: Biomarker,
    history: Biomarker[]
  ): BiomarkerInsight {
    const all = [...history, currentBiomarker].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const points: TimeSeriesPoint[] = all.map((b) => ({
      timestamp: new Date(b.timestamp).getTime(),
      value: b.value
    }));

    const stats = LongitudinalAnalyzer.analyzeWindow(points);
    const baselineValue = all[0].value;
    const currentValue = currentBiomarker.value;
    const deltaFromBaseline = Number((currentValue - baselineValue).toFixed(4));
    const percentChange = baselineValue !== 0 ? Number(((deltaFromBaseline / baselineValue) * 100).toFixed(2)) : 0;

    const n = points.length;
    const isPeak = n >= 3 && points[n - 2].value > points[n - 3].value && points[n - 2].value > points[n - 1].value;
    const isPlateau = n >= 3 && Math.abs(points[n - 1].value - points[n - 2].value) < 0.01;
    const isRecovery = currentBiomarker.status === 'normal' && all.some((b) => b.status === 'critical');
    const isReversal = n >= 3 && Math.sign(stats.velocity) !== Math.sign(points[n - 2].value - points[n - 3].value);

    return BiomarkerInsightSchema.parse({
      loincCode: currentBiomarker.loincCode,
      name: currentBiomarker.name,
      currentValue,
      baselineValue,
      deltaFromBaseline,
      percentChange,
      velocity: stats.velocity,
      acceleration: stats.acceleration,
      isPeak,
      isPlateau,
      isRecovery,
      isReversal
    });
  }
}
