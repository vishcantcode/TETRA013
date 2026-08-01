export interface TimeSeriesPoint {
  timestamp: number; // epoch ms
  value: number;
}

export interface LongitudinalStats {
  mean: number;
  stdDev: number;
  variance: number;
  median: number;
  mad: number; // Median Absolute Deviation
  min: number;
  max: number;
  slope: number;
  velocity: number;
  acceleration: number;
}

export class LongitudinalAnalyzer {
  /**
   * Computes statistical metrics over a sliding window array of time-series observations.
   */
  public static analyzeWindow(points: TimeSeriesPoint[]): LongitudinalStats {
    if (points.length === 0) {
      return {
        mean: 0,
        stdDev: 0,
        variance: 0,
        median: 0,
        mad: 0,
        min: 0,
        max: 0,
        slope: 0,
        velocity: 0,
        acceleration: 0
      };
    }

    const values = points.map((p) => p.value);
    const n = values.length;

    // 1. Min / Max / Mean
    let sum = 0;
    let min = values[0];
    let max = values[0];
    for (let i = 0; i < n; i++) {
      const v = values[i];
      sum += v;
      if (v < min) min = v;
      if (v > max) max = v;
    }
    const mean = sum / n;

    // 2. Variance & StdDev
    let varianceSum = 0;
    for (let i = 0; i < n; i++) {
      const diff = values[i] - mean;
      varianceSum += diff * diff;
    }
    const variance = n > 1 ? varianceSum / (n - 1) : 0;
    const stdDev = Math.sqrt(variance);

    // 3. Median & MAD
    const sorted = [...values].sort((a, b) => a - b);
    const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];

    const absoluteDeviations = values.map((v) => Math.abs(v - median)).sort((a, b) => a - b);
    const mad =
      n % 2 === 0
        ? (absoluteDeviations[n / 2 - 1] + absoluteDeviations[n / 2]) / 2
        : absoluteDeviations[Math.floor(n / 2)];

    // 4. Linear Trend (Slope) via Ordinary Least Squares (OLS)
    let slope = 0;
    let velocity = 0;
    let acceleration = 0;

    if (n >= 2) {
      let sumX = 0;
      let sumY = 0;
      let sumXY = 0;
      let sumXX = 0;

      const t0 = points[0].timestamp;
      for (let i = 0; i < n; i++) {
        const x = (points[i].timestamp - t0) / 1000; // time in seconds
        const y = points[i].value;
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumXX += x * x;
      }

      const denominator = n * sumXX - sumX * sumX;
      if (denominator !== 0) {
        slope = (n * sumXY - sumX * sumY) / denominator;
      }

      // Velocity: dy/dt over last 2 points
      const dt = (points[n - 1].timestamp - points[n - 2].timestamp) / 1000;
      if (dt > 0) {
        velocity = (points[n - 1].value - points[n - 2].value) / dt;
      }

      // Acceleration: d2y/dt2 over last 3 points
      if (n >= 3) {
        const dtPrev = (points[n - 2].timestamp - points[n - 3].timestamp) / 1000;
        if (dtPrev > 0 && dt > 0) {
          const vPrev = (points[n - 2].value - points[n - 3].value) / dtPrev;
          acceleration = (velocity - vPrev) / dt;
        }
      }
    }

    return {
      mean: Number(mean.toFixed(4)),
      stdDev: Number(stdDev.toFixed(4)),
      variance: Number(variance.toFixed(4)),
      median: Number(median.toFixed(4)),
      mad: Number(mad.toFixed(4)),
      min: Number(min.toFixed(4)),
      max: Number(max.toFixed(4)),
      slope: Number(slope.toFixed(6)),
      velocity: Number(velocity.toFixed(6)),
      acceleration: Number(acceleration.toFixed(6))
    };
  }
}
