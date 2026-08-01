import { randomUUID } from 'crypto';
import type {
  IForecastEngine,
  ForecastResult,
  ForecastPoint,
  PAISEngineConfiguration
} from './pais-types';
import {
  PAISEngineConfigurationSchema
} from './pais-types';
import { LongitudinalFeatureEngine } from './longitudinal-feature-engine';

// ─────────────────────────────────────────────────────────────────────────────
// Forecast Engine — PAIS v1.0 Vital & Risk Trajectory Forecasting (EWP-012)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates forward projections of vital metrics and risk scores using
 * OLS linear extrapolation with exponentially decaying confidence.
 *
 * Confidence decay: C(t) = C₀ × 2^(−Δt / τ)
 * Uncertainty growth: σ(t) = σ₀ × √(Δt / τ)
 * Bounds: value ± z × σ(t)
 *
 * Generates 1 forecast point per hour for the specified horizon.
 */
export class ForecastEngine implements IForecastEngine {
  private readonly config: PAISEngineConfiguration;

  /**
   * Initializes the forecast engine with configuration.
   * @param config - Optional partial PAIS engine configuration
   */
  public constructor(config?: Partial<PAISEngineConfiguration>) {
    this.config = PAISEngineConfigurationSchema.parse(config ?? {});
  }

  /**
   * Generates linearly extrapolated forecast points with decaying confidence.
   *
   * @param lastTimestamp - Epoch ms of the last observation
   * @param lastValue - Value at the last observation
   * @param slope - OLS linear trend slope (value change per millisecond)
   * @param horizonMs - Total forecast horizon in milliseconds
   * @param numPoints - Number of forecast points to generate
   * @returns Array of ForecastPoint with value, confidence, and bounds
   */
  private linearExtrapolate(
    lastTimestamp: number,
    lastValue: number,
    slope: number,
    horizonMs: number,
    numPoints: number
  ): ReadonlyArray<ForecastPoint> {
    if (numPoints <= 0) return [];

    const dtStep = horizonMs / numPoints;
    const forecast: ForecastPoint[] = [];

    const baseConfidence = 0.95;
    const halfLife = this.config.defaultHalfLifeMs;
    const zScore = this.config.confidenceZScore;
    const uncertaintyBase = 0.05;

    for (let i = 1; i <= numPoints; i++) {
      const dt = dtStep * i;
      const forecastTime = lastTimestamp + dt;
      const forecastValue = lastValue + slope * dt;

      // Confidence decays exponentially: C₀ × 2^(−Δt/τ)
      const confidence = Math.max(0.0, Math.min(1.0,
        baseConfidence * Math.pow(2, -dt / halfLife)
      ));

      // Uncertainty grows with √time
      const uncertainty = uncertaintyBase * Math.sqrt(dt / halfLife);

      forecast.push({
        timestampMs: forecastTime,
        value: forecastValue,
        confidence,
        lower: forecastValue - zScore * uncertainty,
        upper: forecastValue + zScore * uncertainty
      });
    }

    return forecast;
  }

  /**
   * Forecasts the future trajectory for a particular vital sign metric.
   *
   * Uses OLS slope from the historical time series to extrapolate linearly.
   * Each forecast point includes decaying confidence and widening bounds.
   *
   * @param patientId - UUID of the patient
   * @param metric - The vital metric name (e.g., 'heartRate', 'spo2')
   * @param history - Historical observation sequence with timestamp and value
   * @param horizonHours - Forecast duration in hours
   * @returns Complete ForecastResult with trajectory points and trend direction
   */
  public forecastVital(
    patientId: string,
    metric: string,
    history: ReadonlyArray<{ timestamp: number; value: number }>,
    horizonHours: number
  ): ForecastResult {
    // Convert {timestamp, value} → {t, v} for OLS computation
    const olsPoints: ReadonlyArray<{ t: number; v: number }> = history.map(p => ({
      t: p.timestamp,
      v: p.value
    }));

    const slope = LongitudinalFeatureEngine.computeOLSSlope(olsPoints);
    const horizonMs = horizonHours * 3_600_000;
    const numPoints = Math.max(1, Math.round(horizonHours));

    const lastPoint = history[history.length - 1];
    const lastTimestamp = lastPoint ? lastPoint.timestamp : Date.now();
    const lastValue = lastPoint ? lastPoint.value : 0;

    const points = this.linearExtrapolate(lastTimestamp, lastValue, slope, horizonMs, numPoints);

    let trendDirection: 'rising' | 'stable' | 'falling' = 'stable';
    if (slope > 1e-9) trendDirection = 'rising';
    else if (slope < -1e-9) trendDirection = 'falling';

    const lastForecastPoint = points.length > 0 ? points[points.length - 1] : undefined;

    return {
      patientId,
      metric,
      horizonHours,
      points: points as ForecastPoint[],
      overallConfidence: lastForecastPoint ? lastForecastPoint.confidence : 0,
      trendDirection,
      traceId: randomUUID(),
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Forecasts the future trajectory for the composite risk score.
   *
   * @param patientId - UUID of the patient
   * @param history - Historical risk assessment sequence
   * @param horizonHours - Forecast duration in hours
   * @returns Complete ForecastResult for risk trajectory
   */
  public forecastRisk(
    patientId: string,
    history: ReadonlyArray<{ timestamp: number; value: number }>,
    horizonHours: number
  ): ForecastResult {
    return this.forecastVital(patientId, 'compositeRisk', history, horizonHours);
  }
}
