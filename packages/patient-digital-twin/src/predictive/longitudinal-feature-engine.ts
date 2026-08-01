import type { TwinState } from '../domain/twin-state';

export class LongitudinalFeatureEngine {
  /**
   * Computes the Ordinary Least Squares (OLS) slope for a set of points.
   * @param points - Readonly array of data points with time (t) in ms and value (v)
   * @returns The computed OLS slope. Returns 0 if denominator is 0 or fewer than 2 points.
   */
  public static computeOLSSlope(points: ReadonlyArray<{ t: number; v: number }>): number {
    const n = points.length;
    if (n < 2) return 0.0;

    let sumT = 0.0;
    let sumV = 0.0;
    let sumTV = 0.0;
    let sumTSq = 0.0;

    for (let i = 0; i < n; i++) {
      const t = points[i]!.t;
      const v = points[i]!.v;
      sumT += t;
      sumV += v;
      sumTV += (t * v);
      sumTSq += (t * t);
    }

    const denominator = n * sumTSq - (sumT * sumT);
    if (denominator === 0.0) return 0.0;

    return (n * sumTV - sumT * sumV) / denominator;
  }

  /**
   * Computes the velocity (rate of change) between the last two points.
   * @param points - Readonly array of data points with time (t) in ms and value (v)
   * @returns The computed velocity. Returns 0 if fewer than 2 points or time difference is 0.
   */
  public static computeVelocity(points: ReadonlyArray<{ t: number; v: number }>): number {
    const n = points.length;
    if (n < 2) return 0.0;

    const p1 = points[n - 2]!;
    const p2 = points[n - 1]!;

    const dt = p2.t - p1.t;
    if (dt === 0.0) return 0.0;

    return (p2.v - p1.v) / dt;
  }

  /**
   * Computes the acceleration (change in velocity) using the last three points.
   * @param points - Readonly array of data points with time (t) in ms and value (v)
   * @returns The computed acceleration. Returns 0 if fewer than 3 points.
   */
  public static computeAcceleration(points: ReadonlyArray<{ t: number; v: number }>): number {
    const n = points.length;
    if (n < 3) return 0.0;

    const v2 = this.computeVelocity([points[n - 2]!, points[n - 1]!]);
    const v1 = this.computeVelocity([points[n - 3]!, points[n - 2]!]);

    const dt = points[n - 1]!.t - points[n - 2]!.t;
    if (dt === 0.0) return 0.0;

    return (v2 - v1) / dt;
  }

  /**
   * Extracts timestamped values for a given vital metric from a TwinState history array.
   * @param history - Readonly array of historical TwinState objects
   * @param metric - The metric key to extract (e.g., 'heartRate')
   * @returns Readonly array of points with time (t) in epoch ms and value (v).
   */
  public static extractTimeSeriesFromHistory(history: ReadonlyArray<TwinState>, metric: string): ReadonlyArray<{ t: number; v: number }> {
    const points: Array<{ t: number; v: number }> = [];
    for (let i = 0; i < history.length; i++) {
      const state = history[i]!;
      const vital = state.vitals[metric];
      if (vital !== undefined) {
        const t = new Date(state.lastTimestamp).getTime();
        const v = vital.value;
        points.push({ t, v });
      }
    }
    return points;
  }

  /**
   * Computes window statistics (slope, velocity, acceleration) for a specific metric over history.
   * @param history - Readonly array of historical TwinState objects
   * @param metric - The metric key to compute stats for
   * @returns An object containing slope, velocity, and acceleration
   */
  public static computeWindowStats(history: ReadonlyArray<TwinState>, metric: string): { slope: number; velocity: number; acceleration: number } {
    const points = this.extractTimeSeriesFromHistory(history, metric);
    return {
      slope: this.computeOLSSlope(points),
      velocity: this.computeVelocity(points),
      acceleration: this.computeAcceleration(points)
    };
  }
}
