import { randomUUID } from 'crypto';
import type { TwinState } from '../domain/twin-state';
import type { IKafkaProducer } from '../events';
import type { TwinRepository } from '../repository/twin.repository';
import type { RedisStateCache } from '../cache/redis-state-cache';
import {
  PAISEngineConfigurationSchema,
  PAISEngineConfiguration,
  InferenceRequest,
  InferenceResult,
  ForecastResult,
  IPredictiveAIEngine,
  IFeatureEngineeringPipeline,
  IModelRegistry,
  IInferenceEngine,
  IForecastEngine,
  IExplainabilityEngine,
  IUncertaintyEngine,
  IDriftDetector,
  IModelMonitor,
  PredictiveFeatureVector
} from './pais-types';
import { FeatureExtractionEngine } from './feature-extraction-engine';
import { FeatureStore } from './feature-store';
import { ModelRegistry } from './model-registry';
import { InferenceEngine } from './inference-engine';
import { ForecastEngine } from './forecast-engine';
import { PredictionExplainabilityEngine } from './prediction-explainability';
import { UncertaintyEngine } from './uncertainty-engine';
import { DriftDetector } from './drift-detector';
import { ModelMonitor } from './model-monitor';
import { PredictionPublisher } from './prediction-publisher';

// ─────────────────────────────────────────────────────────────────────────────
// Predictive AI Engine — Master Orchestrator (PAIS v1.0)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Master Predictive AI Platform engine implementing the complete PAIS v1.0 specification.
 *
 * Orchestrates the full AI prediction pipeline:
 * 1. Feature extraction from TwinState (zero-allocation Float64Array)
 * 2. Feature caching in the Feature Store
 * 3. Model selection from the Model Registry
 * 4. ML inference with deterministic fallback
 * 5. Uncertainty estimation with confidence intervals
 * 6. Explainable AI proof chain generation
 * 7. Model health monitoring
 * 8. Kafka event publishing
 *
 * Integration Points:
 * - Consumes: TwinState (DSCS/EWP-007), ClinicalSummary (EWP-008), PhysiologicalTrajectory (EWP-009)
 * - Produces: InferenceResult, ForecastResult, DriftReport → Kafka
 * - Stores: Redis (write-through cache), PostgreSQL (audit trail)
 */
export class PredictiveAIEngine implements IPredictiveAIEngine {
  private readonly config: PAISEngineConfiguration;
  private readonly _featurePipeline: FeatureExtractionEngine;
  private readonly featureStore: FeatureStore;
  private readonly _modelRegistry: ModelRegistry;
  private readonly _inferenceEngine: InferenceEngine;
  private readonly _forecastEngine: ForecastEngine;
  private readonly _explainabilityEngine: PredictionExplainabilityEngine;
  private readonly _uncertaintyEngine: UncertaintyEngine;
  private readonly _driftDetector: DriftDetector;
  private readonly _modelMonitor: ModelMonitor;
  private readonly publisher: PredictionPublisher;

  public constructor(
    config?: Partial<PAISEngineConfiguration>,
    _twinRepo?: TwinRepository,
    _stateCache?: RedisStateCache,
    kafkaProducer?: IKafkaProducer
  ) {
    this.config = PAISEngineConfigurationSchema.parse(config ?? {});
    this._featurePipeline = new FeatureExtractionEngine();
    this.featureStore = new FeatureStore(config);
    this._modelRegistry = new ModelRegistry();
    this._inferenceEngine = new InferenceEngine(config, this._modelRegistry);
    this._forecastEngine = new ForecastEngine(config);
    this._explainabilityEngine = new PredictionExplainabilityEngine();
    this._uncertaintyEngine = new UncertaintyEngine(config);
    this._driftDetector = new DriftDetector(config);
    this._modelMonitor = new ModelMonitor(config);
    this.publisher = new PredictionPublisher(kafkaProducer);
  }

  // ─── Interface Property Accessors ──────────────────────────────────────────

  public get featurePipeline(): IFeatureEngineeringPipeline {
    return this._featurePipeline;
  }

  public get modelRegistry(): IModelRegistry {
    return this._modelRegistry;
  }

  public get inferenceEngine(): IInferenceEngine {
    return this._inferenceEngine;
  }

  public get forecastEngine(): IForecastEngine {
    return this._forecastEngine;
  }

  public get explainabilityEngine(): IExplainabilityEngine {
    return this._explainabilityEngine;
  }

  public get uncertaintyEngine(): IUncertaintyEngine {
    return this._uncertaintyEngine;
  }

  public get driftDetector(): IDriftDetector {
    return this._driftDetector;
  }

  public get modelMonitor(): IModelMonitor {
    return this._modelMonitor;
  }

  // ─── Core Prediction Pipeline ──────────────────────────────────────────────

  /**
   * Executes the complete PAIS prediction pipeline for a single patient state.
   *
   * Pipeline stages:
   * 1. Extract predictive features from TwinState
   * 2. Cache features in the Feature Store
   * 3. Build inference request
   * 4. Execute model inference (with timeout + fallback)
   * 5. Generate explainability proof chain
   * 6. Estimate uncertainty and confidence intervals
   * 7. Record model health metrics
   * 8. Publish prediction event to Kafka
   *
   * @param state - Current patient TwinState from Dynamic State Compiler
   * @param history - Optional historical TwinState snapshots for longitudinal features
   * @returns Complete InferenceResult with explanation, uncertainty, and trace lineage
   */
  public async executePrediction(
    state: TwinState,
    history?: ReadonlyArray<TwinState>
  ): Promise<InferenceResult> {
    const startMs = performance.now();

    // Stage 1: Feature extraction
    const features: PredictiveFeatureVector = this._featurePipeline.extractFeatures(state, history);

    // Stage 2: Cache features
    await this.featureStore.store(features);

    // Stage 3: Build inference request
    const request: InferenceRequest = {
      requestId: randomUUID(),
      patientId: state.patientId,
      features,
      targetHorizonHours: this.config.maxPredictionHorizonHours
    };

    // Stage 4: Execute inference
    let result: InferenceResult;
    let inferenceSuccess = true;
    let fallbackUsed = false;

    try {
      result = await this._inferenceEngine.predict(request);
      fallbackUsed = result.explanation.fallbackTriggered;
    } catch {
      inferenceSuccess = false;
      fallbackUsed = true;
      // This path should not normally be reached since InferenceEngine handles fallback internally
      const { FallbackRuleEngine } = await import('./fallback-rule-engine');
      result = FallbackRuleEngine.generateFallbackResult(request, features);
    }

    // Stage 5: Record monitoring metrics
    const executionTimeMs = performance.now() - startMs;
    const monitorModelId = result.modelId ?? 'fallback';
    this._modelMonitor.recordPrediction(monitorModelId, executionTimeMs, inferenceSuccess, fallbackUsed);

    // Stage 6: Publish to Kafka
    if (this.config.enableKafkaEventPublishing) {
      await this.publisher.publishPrediction(result);
    }

    return result;
  }

  /**
   * Executes batch predictions for multiple patient states.
   *
   * Each prediction is executed independently; individual failures do not
   * short-circuit the batch. Failed predictions fall back to deterministic rules.
   *
   * @param states - Array of patient TwinState snapshots
   * @returns Array of InferenceResults (one per input state)
   */
  public async executeBatchPrediction(
    states: ReadonlyArray<TwinState>
  ): Promise<ReadonlyArray<InferenceResult>> {
    const results: InferenceResult[] = [];
    for (const state of states) {
      const result = await this.executePrediction(state);
      results.push(result);
    }
    return results;
  }

  /**
   * Executes vital/risk forecasts for specified metrics over a time horizon.
   *
   * Uses OLS linear extrapolation from longitudinal history to project
   * future trajectories with confidence decay.
   *
   * @param state - Current patient TwinState
   * @param history - Historical TwinState snapshots for trend analysis
   * @param metrics - Array of vital metric names to forecast (e.g., ['heartRate', 'spo2'])
   * @param horizonHours - Forecast horizon in hours
   * @returns Array of ForecastResults (one per metric)
   */
  public executeForecasts(
    state: TwinState,
    history: ReadonlyArray<TwinState>,
    metrics: ReadonlyArray<string>,
    horizonHours: number
  ): ReadonlyArray<ForecastResult> {
    const results: ForecastResult[] = [];

    for (const metric of metrics) {
      // Extract time series from history
      const timeSeriesPoints: Array<{ timestamp: number; value: number }> = [];

      for (const h of history) {
        const vital = h.vitals[metric];
        if (vital) {
          timeSeriesPoints.push({
            timestamp: new Date(h.lastTimestamp).getTime(),
            value: vital.value
          });
        }
      }

      // Add current state
      const currentVital = state.vitals[metric];
      if (currentVital) {
        timeSeriesPoints.push({
          timestamp: new Date(state.lastTimestamp).getTime(),
          value: currentVital.value
        });
      }

      if (timeSeriesPoints.length >= 2) {
        const forecast = metric === 'compositeRisk'
          ? this._forecastEngine.forecastRisk(state.patientId, timeSeriesPoints, horizonHours)
          : this._forecastEngine.forecastVital(state.patientId, metric, timeSeriesPoints, horizonHours);

        results.push(forecast);

        // Publish forecast to Kafka
        if (this.config.enableKafkaEventPublishing) {
          void this.publisher.publishForecast(forecast);
        }
      }
    }

    return results;
  }
}
