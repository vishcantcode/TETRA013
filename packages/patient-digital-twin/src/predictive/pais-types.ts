import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────────────
// PAIS v1.0 — Predictive AI Platform Type System
// HealthSense OS — EWP-012
// Status: LOCKED & AUTHORITATIVE
// ─────────────────────────────────────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — Normalization Constants (DSCS-aligned)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Physiological normalization bounds for the 8-element dense vector.
 * Each tuple: [min, max] for clamp-based [0.0, 1.0] normalization.
 *
 * Vector layout:
 *   0: Heart Rate         [30.0, 220.0]  bpm
 *   1: Systolic BP        [60.0, 240.0]  mmHg
 *   2: Diastolic BP       [40.0, 140.0]  mmHg
 *   3: SpO₂              [50.0, 100.0]  %
 *   4: Respiratory Rate   [6.0,  60.0]   breaths/min
 *   5: Temperature        [30.0, 45.0]   °C
 *   6: Glucose            [20.0, 600.0]  mg/dL
 *   7: Composite Risk     [0.0,  1.0]    score
 */
export const NORMALIZATION_BOUNDS: ReadonlyArray<readonly [number, number]> = [
  [30.0, 220.0],   // heartRate
  [60.0, 240.0],   // bpSystolic
  [40.0, 140.0],   // bpDiastolic
  [50.0, 100.0],   // spo2
  [6.0, 60.0],     // respiratoryRate
  [30.0, 45.0],    // temperature
  [20.0, 600.0],   // glucose
  [0.0, 1.0]       // compositeRisk
] as const;

/**
 * Feature dimension labels mapped to vector indices.
 */
export const FEATURE_DIMENSION_LABELS: ReadonlyArray<string> = [
  'heartRate',
  'bpSystolic',
  'bpDiastolic',
  'spo2',
  'respiratoryRate',
  'temperature',
  'glucose',
  'compositeRisk'
] as const;

export const FEATURE_VECTOR_LENGTH = 8;

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — Predictive Feature Vector
// ═══════════════════════════════════════════════════════════════════════════════

export const PredictiveFeatureVectorSchema = z.object({
  patientId: z.string().uuid(),
  timestamp: z.number().int().nonnegative(),
  /** Normalized 8-element dense vector (Float64Array serialized as number[]) */
  rawVector: z.array(z.number()).length(FEATURE_VECTOR_LENGTH),
  /** Derived hemodynamic features */
  meanArterialPressure: z.number().optional(),
  pulsePressure: z.number().optional(),
  shockIndex: z.number().optional(),
  /** Longitudinal statistics */
  olsSlope: z.number().default(0.0),
  velocity: z.number().default(0.0),
  acceleration: z.number().default(0.0),
  /** Composite scores */
  compositeVitalStability: z.number().min(0.0).max(1.0).default(1.0),
  overallConfidence: z.number().min(0.0).max(1.0).default(1.0),
  /** Feature version for reproducibility */
  featureVersion: z.string().default('1.0.0')
});
export type PredictiveFeatureVector = z.infer<typeof PredictiveFeatureVectorSchema>;

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — Model Stage & Metadata
// ═══════════════════════════════════════════════════════════════════════════════

export const ModelStageSchema = z.enum([
  'development',
  'staging',
  'production',
  'deprecated'
]);
export type ModelStage = z.infer<typeof ModelStageSchema>;

/**
 * Valid stage transitions for model lifecycle governance.
 * Enforced by ModelRegistry.promoteModel().
 */
export const VALID_STAGE_TRANSITIONS: ReadonlyMap<ModelStage, ReadonlyArray<ModelStage>> = new Map([
  ['development', ['staging', 'deprecated']],
  ['staging', ['production', 'development', 'deprecated']],
  ['production', ['deprecated']],
  ['deprecated', []]
]);

export const PredictionDomainSchema = z.enum([
  'deterioration',
  'pharmacology',
  'biomarker',
  'risk'
]);
export type PredictionDomain = z.infer<typeof PredictionDomainSchema>;

export const AccuracyMetricsSchema = z.object({
  auroc: z.number().min(0.0).max(1.0),
  f1Score: z.number().min(0.0).max(1.0),
  mae: z.number().nonnegative().optional(),
  rmse: z.number().nonnegative().optional(),
  precision: z.number().min(0.0).max(1.0).optional(),
  recall: z.number().min(0.0).max(1.0).optional()
});
export type AccuracyMetrics = z.infer<typeof AccuracyMetricsSchema>;

export const ModelMetadataSchema = z.object({
  modelId: z.string().uuid(),
  name: z.string().min(1),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must be SemVer (e.g. 1.0.0)'),
  domain: PredictionDomainSchema,
  stage: ModelStageSchema,
  accuracyMetrics: AccuracyMetricsSchema,
  checksum: z.string().min(1),
  inputFeatureCount: z.number().int().positive().default(FEATURE_VECTOR_LENGTH),
  outputDimensions: z.number().int().positive().default(1),
  trainingDatasetSize: z.number().int().nonnegative().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});
export type ModelMetadata = z.infer<typeof ModelMetadataSchema>;

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — Inference Request & Result
// ═══════════════════════════════════════════════════════════════════════════════

export const InferenceRequestSchema = z.object({
  requestId: z.string().uuid(),
  patientId: z.string().uuid(),
  features: PredictiveFeatureVectorSchema,
  targetHorizonHours: z.number().positive().max(168),
  modelId: z.string().uuid().optional(),
  domain: PredictionDomainSchema.optional()
});
export type InferenceRequest = z.infer<typeof InferenceRequestSchema>;

export const FeatureAttributionSchema = z.object({
  featureName: z.string(),
  featureIndex: z.number().int().nonnegative(),
  value: z.number(),
  attributionScore: z.number(),
  direction: z.enum(['escalating', 'protective', 'neutral'])
});
export type FeatureAttribution = z.infer<typeof FeatureAttributionSchema>;

export const PredictionExplanationSchema = z.object({
  predictionId: z.string().uuid(),
  traceId: z.string().uuid(),
  topAttributions: z.array(FeatureAttributionSchema),
  confidenceScore: z.number().min(0.0).max(1.0),
  fallbackTriggered: z.boolean().default(false),
  rationale: z.string(),
  modelVersion: z.string().optional()
});
export type PredictionExplanation = z.infer<typeof PredictionExplanationSchema>;

export const ConfidenceIntervalSchema = z.object({
  lower: z.number(),
  upper: z.number(),
  level: z.number().min(0.0).max(1.0).default(0.95)
});
export type ConfidenceInterval = z.infer<typeof ConfidenceIntervalSchema>;

export const InferenceResultSchema = z.object({
  predictionId: z.string().uuid(),
  patientId: z.string().uuid(),
  timestamp: z.string().datetime(),
  horizonHours: z.number().positive(),
  predictedRiskScore: z.number().min(0.0).max(1.0),
  deteriorationProbability: z.number().min(0.0).max(1.0),
  predictedStateVector: z.array(z.number()),
  confidenceInterval: ConfidenceIntervalSchema,
  explanation: PredictionExplanationSchema,
  executionTimeMs: z.number().nonnegative(),
  modelId: z.string().uuid().optional(),
  domain: PredictionDomainSchema.optional()
});
export type InferenceResult = z.infer<typeof InferenceResultSchema>;

// ═══════════════════════════════════════════════════════════════════════════════
// §5 — Forecast Types
// ═══════════════════════════════════════════════════════════════════════════════

export const ForecastPointSchema = z.object({
  timestampMs: z.number().int().nonnegative(),
  value: z.number(),
  confidence: z.number().min(0.0).max(1.0),
  lower: z.number(),
  upper: z.number()
});
export type ForecastPoint = z.infer<typeof ForecastPointSchema>;

export const ForecastResultSchema = z.object({
  patientId: z.string().uuid(),
  metric: z.string(),
  horizonHours: z.number().positive(),
  points: z.array(ForecastPointSchema).min(1),
  overallConfidence: z.number().min(0.0).max(1.0),
  trendDirection: z.enum(['rising', 'stable', 'falling']),
  traceId: z.string().uuid(),
  generatedAt: z.string().datetime()
});
export type ForecastResult = z.infer<typeof ForecastResultSchema>;

// ═══════════════════════════════════════════════════════════════════════════════
// §6 — Drift Detection Types
// ═══════════════════════════════════════════════════════════════════════════════

export const DriftReportSchema = z.object({
  modelId: z.string().uuid(),
  reportId: z.string().uuid(),
  psiScore: z.number().nonnegative(),
  ksStatistic: z.number().min(0.0).max(1.0),
  isDrifting: z.boolean(),
  driftSeverity: z.enum(['none', 'minor', 'moderate', 'severe']),
  affectedFeatures: z.array(z.string()),
  baselineSampleCount: z.number().int().nonnegative(),
  currentSampleCount: z.number().int().nonnegative(),
  detectedAt: z.string().datetime()
});
export type DriftReport = z.infer<typeof DriftReportSchema>;

// ═══════════════════════════════════════════════════════════════════════════════
// §7 — Uncertainty Types
// ═══════════════════════════════════════════════════════════════════════════════

export const UncertaintyEstimateSchema = z.object({
  predictionId: z.string().uuid(),
  aleatoric: z.number().nonnegative(),
  epistemic: z.number().nonnegative(),
  totalUncertainty: z.number().nonnegative(),
  isOutOfDistribution: z.boolean(),
  calibrationScore: z.number().min(0.0).max(1.0),
  reliabilityScore: z.number().min(0.0).max(1.0)
});
export type UncertaintyEstimate = z.infer<typeof UncertaintyEstimateSchema>;

// ═══════════════════════════════════════════════════════════════════════════════
// §8 — Model Monitoring Types
// ═══════════════════════════════════════════════════════════════════════════════

export const ModelHealthSnapshotSchema = z.object({
  modelId: z.string().uuid(),
  snapshotId: z.string().uuid(),
  totalPredictions: z.number().int().nonnegative(),
  totalFailures: z.number().int().nonnegative(),
  totalFallbacks: z.number().int().nonnegative(),
  meanLatencyMs: z.number().nonnegative(),
  p95LatencyMs: z.number().nonnegative(),
  p99LatencyMs: z.number().nonnegative(),
  throughputPerSecond: z.number().nonnegative(),
  accuracyMetrics: AccuracyMetricsSchema.optional(),
  windowStartMs: z.number().int().nonnegative(),
  windowEndMs: z.number().int().nonnegative(),
  recordedAt: z.string().datetime()
});
export type ModelHealthSnapshot = z.infer<typeof ModelHealthSnapshotSchema>;

// ═══════════════════════════════════════════════════════════════════════════════
// §9 — Feature Store Types
// ═══════════════════════════════════════════════════════════════════════════════

export const StoredFeatureRecordSchema = z.object({
  patientId: z.string().uuid(),
  featureVersion: z.string(),
  features: PredictiveFeatureVectorSchema,
  storedAt: z.string().datetime(),
  ttlMs: z.number().int().positive().default(86_400_000)
});
export type StoredFeatureRecord = z.infer<typeof StoredFeatureRecordSchema>;

// ═══════════════════════════════════════════════════════════════════════════════
// §10 — Engine Configuration
// ═══════════════════════════════════════════════════════════════════════════════

export const PAISEngineConfigurationSchema = z.object({
  /** Temporal confidence half-life in milliseconds (default: 5 minutes) */
  defaultHalfLifeMs: z.number().int().positive().default(300_000),
  /** Maximum prediction horizon in hours (default: 24h) */
  maxPredictionHorizonHours: z.number().int().positive().default(24),
  /** Inference timeout in milliseconds (P95 target: 15ms, hard limit: 30ms) */
  inferenceTimeoutMs: z.number().int().positive().default(15),
  /** Inference hard timeout in milliseconds */
  inferenceHardTimeoutMs: z.number().int().positive().default(30),
  /** Retry attempts for transient inference failures */
  inferenceRetryAttempts: z.number().int().nonnegative().default(1),
  /** Risk penalty multiplier α for MCDA (CDIS-aligned) */
  riskPenaltyAlpha: z.number().default(1.5),
  /** Contraindication penalty multiplier β (CDIS-aligned) */
  contraindicationPenaltyBeta: z.number().default(100.0),
  /** PSI threshold for drift detection */
  driftPsiThreshold: z.number().positive().default(0.25),
  /** KS statistic threshold for drift detection */
  driftKsThreshold: z.number().positive().default(0.05),
  /** Number of bins for PSI histogram computation */
  driftBinCount: z.number().int().positive().default(10),
  /** Feature store TTL in milliseconds (default: 24h) */
  featureStoreTtlMs: z.number().int().positive().default(86_400_000),
  /** Monitoring window size in milliseconds (default: 5 minutes) */
  monitoringWindowMs: z.number().int().positive().default(300_000),
  /** Confidence interval level (default: 95%) */
  confidenceLevel: z.number().min(0.0).max(1.0).default(0.95),
  /** Z-score for confidence interval (default: 1.96 for 95%) */
  confidenceZScore: z.number().positive().default(1.96),
  /** Enable deterministic fallback when model fails */
  enableFallbackToRuleEngine: z.boolean().default(true),
  /** Enable Redis write-through cache for predictions */
  enableWriteThroughCache: z.boolean().default(true),
  /** Enable audit logging for all predictions */
  enableAuditLogging: z.boolean().default(true),
  /** Enable Kafka event publishing */
  enableKafkaEventPublishing: z.boolean().default(true)
});
export type PAISEngineConfiguration = z.infer<typeof PAISEngineConfigurationSchema>;

// ═══════════════════════════════════════════════════════════════════════════════
// §11 — Public Engine Interfaces
// ═══════════════════════════════════════════════════════════════════════════════

import type { TwinState } from '../domain/twin-state';

/**
 * Feature engineering pipeline — extracts ML-ready feature vectors from TwinState.
 */
export interface IFeatureEngineeringPipeline {
  extractFeatures(state: TwinState, history?: ReadonlyArray<TwinState>): PredictiveFeatureVector;
  extractRawVector(state: TwinState, buffer?: Float64Array): Float64Array;
}

/**
 * Feature store — persists and retrieves computed feature vectors.
 */
export interface IFeatureStore {
  store(features: PredictiveFeatureVector): Promise<void>;
  retrieve(patientId: string): Promise<StoredFeatureRecord | null>;
  invalidate(patientId: string): Promise<void>;
}

/**
 * Model registry — manages model lifecycle artifacts.
 */
export interface IModelRegistry {
  registerModel(metadata: ModelMetadata, modelBinary: ArrayBuffer): Promise<void>;
  getModel(modelId: string): Promise<{ metadata: ModelMetadata; binary: ArrayBuffer } | null>;
  getProductionModel(domain: PredictionDomain): Promise<ModelMetadata | null>;
  promoteModel(modelId: string, targetStage: ModelStage): Promise<void>;
  listModels(domain?: PredictionDomain): ReadonlyArray<ModelMetadata>;
  deprecateModel(modelId: string): Promise<void>;
}

/**
 * Inference engine — executes model inference with fallback.
 */
export interface IInferenceEngine {
  predict(request: InferenceRequest): Promise<InferenceResult>;
  predictBatch(requests: ReadonlyArray<InferenceRequest>): Promise<ReadonlyArray<InferenceResult>>;
}

/**
 * Forecast engine — vital and risk trajectory forecasting.
 */
export interface IForecastEngine {
  forecastVital(
    patientId: string,
    metric: string,
    history: ReadonlyArray<{ timestamp: number; value: number }>,
    horizonHours: number
  ): ForecastResult;
  forecastRisk(
    patientId: string,
    history: ReadonlyArray<{ timestamp: number; value: number }>,
    horizonHours: number
  ): ForecastResult;
}

/**
 * Explainability engine — generates feature attributions and proof chains.
 */
export interface IExplainabilityEngine {
  computeFeatureAttributions(features: PredictiveFeatureVector, riskScore: number): ReadonlyArray<FeatureAttribution>;
  generateExplanation(
    predictionId: string,
    features: PredictiveFeatureVector,
    riskScore: number,
    fallbackTriggered: boolean,
    modelVersion?: string
  ): PredictionExplanation;
}

/**
 * Uncertainty engine — confidence intervals and OOD detection.
 */
export interface IUncertaintyEngine {
  estimateUncertainty(
    predictionId: string,
    features: PredictiveFeatureVector,
    riskScore: number
  ): UncertaintyEstimate;
  computeConfidenceInterval(
    riskScore: number,
    uncertainty: number,
    level?: number
  ): ConfidenceInterval;
}

/**
 * Drift detector — monitors data and concept drift.
 */
export interface IDriftDetector {
  computePSI(expected: Float64Array, actual: Float64Array, binCount?: number): number;
  computeKSStatistic(expected: Float64Array, actual: Float64Array): number;
  evaluateDrift(modelId: string, expected: Float64Array, actual: Float64Array): DriftReport;
  isDrifting(psi: number, ksStatistic: number): boolean;
}

/**
 * Model monitor — tracks model health and performance.
 */
export interface IModelMonitor {
  recordPrediction(modelId: string, latencyMs: number, success: boolean, fallback: boolean): void;
  getHealthSnapshot(modelId: string): ModelHealthSnapshot;
  resetWindow(modelId: string): void;
}

/**
 * Master Predictive AI Engine — top-level orchestrator.
 */
export interface IPredictiveAIEngine {
  readonly featurePipeline: IFeatureEngineeringPipeline;
  readonly modelRegistry: IModelRegistry;
  readonly inferenceEngine: IInferenceEngine;
  readonly forecastEngine: IForecastEngine;
  readonly explainabilityEngine: IExplainabilityEngine;
  readonly uncertaintyEngine: IUncertaintyEngine;
  readonly driftDetector: IDriftDetector;
  readonly modelMonitor: IModelMonitor;
  executePrediction(state: TwinState, history?: ReadonlyArray<TwinState>): Promise<InferenceResult>;
  executeBatchPrediction(states: ReadonlyArray<TwinState>): Promise<ReadonlyArray<InferenceResult>>;
  executeForecasts(
    state: TwinState,
    history: ReadonlyArray<TwinState>,
    metrics: ReadonlyArray<string>,
    horizonHours: number
  ): ReadonlyArray<ForecastResult>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §12 — Kafka Event Topic Constants
// ═══════════════════════════════════════════════════════════════════════════════

export const PredictiveAITopics = {
  PREDICTION_GENERATED: 'patient.prediction.generated',
  MODEL_DRIFT_DETECTED: 'patient.model.drift.detected',
  MODEL_PROMOTED: 'patient.model.promoted',
  MODEL_DEPRECATED: 'patient.model.deprecated',
  FORECAST_GENERATED: 'patient.forecast.generated',
  TWIN_STATE_UPDATES: 'twin.state.updates.v1'
} as const;

export type PredictiveAITopic = typeof PredictiveAITopics[keyof typeof PredictiveAITopics];

// ═══════════════════════════════════════════════════════════════════════════════
// §13 — Deterministic Fallback Constants
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Deterministic fallback feature weights for risk computation.
 * Used when ML model is unavailable, times out, or returns invalid results.
 * Weights sum to 1.0.
 */
export const FALLBACK_FEATURE_WEIGHTS: ReadonlyArray<number> = [
  0.20,  // heartRate
  0.10,  // bpSystolic
  0.05,  // bpDiastolic
  0.20,  // spo2 (inverted: lower = higher risk)
  0.15,  // respiratoryRate
  0.10,  // temperature
  0.10,  // glucose
  0.10   // compositeRisk
] as const;

/**
 * Clinical threshold boundaries for deterioration probability computation.
 * Each tuple: [lowerCritical, lowerWarning, upperWarning, upperCritical]
 */
export const CLINICAL_THRESHOLDS: ReadonlyArray<readonly [number, number, number, number]> = [
  [40.0, 50.0, 100.0, 150.0],   // heartRate bpm
  [70.0, 90.0, 160.0, 200.0],   // bpSystolic mmHg
  [40.0, 60.0, 90.0, 110.0],    // bpDiastolic mmHg
  [85.0, 92.0, 100.0, 100.0],   // spo2 % (only lower thresholds matter)
  [8.0, 12.0, 20.0, 30.0],      // respiratoryRate
  [35.0, 36.1, 37.8, 39.5],     // temperature °C
  [54.0, 70.0, 180.0, 300.0],   // glucose mg/dL
  [0.0, 0.0, 0.7, 0.9]          // compositeRisk
] as const;
