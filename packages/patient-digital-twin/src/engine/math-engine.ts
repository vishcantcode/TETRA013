import { TwinState } from '../domain';

export class MathEngine {
  /**
   * Calculates exponential temporal confidence decay according to DSCS equation:
   * C(t) = C0 * 2^(-dt / tau)
   */
  public static calculateConfidenceDecay(
    initialConfidence: number,
    elapsedMs: number,
    halfLifeMs: number = 300000
  ): number {
    if (elapsedMs <= 0) return initialConfidence;
    if (halfLifeMs <= 0) return 0.0;
    const decayed = initialConfidence * Math.pow(2, -elapsedMs / halfLifeMs);
    return Math.max(0.0, Math.min(1.0, decayed));
  }

  /**
   * Computes Exponential Moving Average (EMA) state smoothing according to DSCS equations:
   * alpha = 1 - exp(-dt / tau)
   * St = (1 - alpha) * S_{t-1} + alpha * x_t
   */
  public static calculateEMA(
    previousValue: number,
    newValue: number,
    elapsedMs: number,
    halfLifeMs: number = 300000
  ): number {
    if (elapsedMs <= 0) return newValue;
    const alpha = 1 - Math.exp(-elapsedMs / halfLifeMs);
    return (1 - alpha) * previousValue + alpha * newValue;
  }

  /**
   * Calculates the overall aggregated confidence score across all active vital measurements.
   */
  public static calculateOverallConfidence(state: TwinState, currentTimeISO?: string): number {
    const targetTime = currentTimeISO ? new Date(currentTimeISO).getTime() : Date.now();
    const vitals = Object.values(state.vitals);

    if (vitals.length === 0) return 1.0;

    let totalConfidence = 0;
    for (const v of vitals) {
      const observationTime = new Date(v.timestamp).getTime();
      const elapsedMs = Math.max(0, targetTime - observationTime);
      const decayed = this.calculateConfidenceDecay(v.confidence, elapsedMs, v.halfLifeMs);
      totalConfidence += decayed;
    }

    return Number((totalConfidence / vitals.length).toFixed(4));
  }
}
