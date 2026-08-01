import { randomUUID } from 'crypto';
import {
  IModelMonitor,
  PAISEngineConfiguration,
  PAISEngineConfigurationSchema,
  ModelHealthSnapshot
} from './pais-types';

// ─────────────────────────────────────────────────────────────────────────────
// Model Monitor — PAIS v1.0 Model Health Monitoring (EWP-012)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Tracks model health metrics in configurable time windows:
 * - Latency statistics (mean, P95, P99)
 * - Throughput (predictions/second)
 * - Success/failure/fallback counts
 *
 * Each model maintains an independent monitoring window that can be
 * reset for periodic reporting cycles.
 */

interface MonitorWindow {
  readonly latencies: number[];
  successes: number;
  failures: number;
  fallbacks: number;
  readonly windowStartMs: number;
}

export class ModelMonitor implements IModelMonitor {
  private readonly config: PAISEngineConfiguration;
  private readonly windows: Map<string, MonitorWindow> = new Map();

  /**
   * Constructs the ModelMonitor.
   * @param config - Optional partial PAIS engine configuration
   */
  public constructor(config?: Partial<PAISEngineConfiguration>) {
    this.config = PAISEngineConfigurationSchema.parse(config ?? {});
  }

  /**
   * Records a single prediction execution for model health tracking.
   *
   * @param modelId - UUID of the model (or 'fallback' for deterministic)
   * @param latencyMs - Execution time in milliseconds
   * @param success - Whether the prediction completed successfully
   * @param fallback - Whether the deterministic fallback was used
   */
  public recordPrediction(
    modelId: string,
    latencyMs: number,
    success: boolean,
    fallback: boolean
  ): void {
    let window = this.windows.get(modelId);
    if (!window) {
      window = {
        latencies: [],
        successes: 0,
        failures: 0,
        fallbacks: 0,
        windowStartMs: Date.now()
      };
      this.windows.set(modelId, window);
    }

    window.latencies.push(latencyMs);
    if (success) {
      window.successes++;
    } else {
      window.failures++;
    }
    if (fallback) {
      window.fallbacks++;
    }
  }

  /**
   * Computes the value at a given percentile from a sorted array.
   *
   * @param sortedArr - Pre-sorted array of latency values
   * @param percentile - Percentile as decimal [0.0, 1.0]
   * @returns Latency value at the specified percentile
   */
  private static getPercentile(sortedArr: ReadonlyArray<number>, percentile: number): number {
    if (sortedArr.length === 0) return 0;
    const index = Math.ceil(percentile * sortedArr.length) - 1;
    return sortedArr[Math.max(0, index)]!;
  }

  /**
   * Generates a health snapshot for a model's monitoring window.
   *
   * Includes mean/P95/P99 latency, throughput, and prediction counts.
   *
   * @param modelId - UUID of the model to report on
   * @returns ModelHealthSnapshot conforming to PAIS schema
   */
  public getHealthSnapshot(modelId: string): ModelHealthSnapshot {
    const now = Date.now();
    const window = this.windows.get(modelId);

    if (!window) {
      return {
        modelId,
        snapshotId: randomUUID(),
        totalPredictions: 0,
        totalFailures: 0,
        totalFallbacks: 0,
        meanLatencyMs: 0,
        p95LatencyMs: 0,
        p99LatencyMs: 0,
        throughputPerSecond: 0,
        windowStartMs: now,
        windowEndMs: now,
        recordedAt: new Date().toISOString()
      };
    }

    const totalPredictions = window.successes + window.failures;
    const sorted = [...window.latencies].sort((a, b) => a - b);

    let meanLatencyMs = 0;
    if (sorted.length > 0) {
      let sum = 0;
      for (let i = 0; i < sorted.length; i++) {
        sum += sorted[i]!;
      }
      meanLatencyMs = sum / sorted.length;
    }

    const p95LatencyMs = ModelMonitor.getPercentile(sorted, 0.95);
    const p99LatencyMs = ModelMonitor.getPercentile(sorted, 0.99);
    const windowDurationSeconds = Math.max(1, (now - window.windowStartMs) / 1000);
    const throughputPerSecond = totalPredictions / windowDurationSeconds;

    return {
      modelId,
      snapshotId: randomUUID(),
      totalPredictions,
      totalFailures: window.failures,
      totalFallbacks: window.fallbacks,
      meanLatencyMs,
      p95LatencyMs,
      p99LatencyMs,
      throughputPerSecond,
      windowStartMs: window.windowStartMs,
      windowEndMs: now,
      recordedAt: new Date().toISOString()
    };
  }

  /**
   * Resets the monitoring window for a given model.
   * @param modelId - UUID of the model to reset
   */
  public resetWindow(modelId: string): void {
    this.windows.delete(modelId);
  }
}
