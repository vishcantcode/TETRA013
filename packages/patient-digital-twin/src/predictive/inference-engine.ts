import type {
  IInferenceEngine,
  InferenceRequest,
  InferenceResult,
  IModelRegistry,
  PAISEngineConfiguration
} from './pais-types';
import {
  PAISEngineConfigurationSchema,
  InferenceRequestSchema,
  FALLBACK_FEATURE_WEIGHTS
} from './pais-types';
import { FallbackRuleEngine } from './fallback-rule-engine';
import * as crypto from 'crypto';

/**
 * InferenceEngine subsystem for EWP-012.
 * Executes machine learning inferences with rigorous latency enforcement and fallback.
 */
export class InferenceEngine implements IInferenceEngine {
  private readonly config: PAISEngineConfiguration;
  private readonly modelRegistry?: IModelRegistry;

  /**
   * Initializes the inference engine.
   *
   * @param config - The partial engine configuration.
   * @param modelRegistry - The optional model registry dependency.
   */
  constructor(config?: Partial<PAISEngineConfiguration>, modelRegistry?: IModelRegistry) {
    this.config = PAISEngineConfigurationSchema.parse(config || {});
    this.modelRegistry = modelRegistry;
  }

  /**
   * Enforces a timeout on an asynchronous operation.
   *
   * @param promise - The promise to track.
   * @param timeoutMs - The maximum allowed time in milliseconds.
   * @returns A promise resolving to the inner result.
   * @throws Error if the timeout is exceeded before resolution.
   */
  private async enforceTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    let timeoutId: NodeJS.Timeout;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('Inference timeout')), timeoutMs);
    });
    
    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      clearTimeout(timeoutId!);
    }
  }

  /**
   * Executes the core ML model inference process.
   * Currently computes a deterministic prediction using feature vectors.
   *
   * @param request - The validated inference request.
   * @returns The generated inference result.
   */
  private async executeModelInference(request: InferenceRequest): Promise<InferenceResult> {
    const start = performance.now();
    
    let riskScore = 0.0;
    const features = request.features;
    for (let i = 0; i < 8; i++) {
      const weight = FALLBACK_FEATURE_WEIGHTS[i] || 0.0;
      let val = features.rawVector[i] || 0.0;
      // SpO2 inversion
      if (i === 3) {
        val = 1.0 - val;
      }
      riskScore += val * weight;
    }
    
    riskScore = Math.max(0.0, Math.min(1.0, riskScore));
    const predictionId = crypto.randomUUID();
    const end = performance.now();
    
    const result: InferenceResult = {
      predictionId,
      patientId: request.patientId,
      timestamp: new Date().toISOString(),
      horizonHours: request.targetHorizonHours,
      predictedRiskScore: riskScore,
      deteriorationProbability: riskScore, // simplified proxy
      predictedStateVector: Array.from(features.rawVector),
      confidenceInterval: {
        lower: Math.max(0.0, riskScore - 0.05),
        upper: Math.min(1.0, riskScore + 0.05),
        level: this.config.confidenceLevel
      },
      explanation: {
        predictionId,
        traceId: crypto.randomUUID(),
        topAttributions: [],
        confidenceScore: 0.9,
        fallbackTriggered: false,
        rationale: 'Simulated ML model prediction based on weighted feature sum'
      },
      executionTimeMs: Math.round(end - start),
      modelId: request.modelId,
      domain: request.domain
    };
    
    return result;
  }

  /**
   * Validates and executes a single inference request.
   * On failure or timeout, delegates transparently to the FallbackRuleEngine.
   *
   * @param request - The incoming inference request.
   * @returns The processed inference result.
   */
  public async predict(request: InferenceRequest): Promise<InferenceResult> {
    const validatedRequest = InferenceRequestSchema.parse(request);
    const start = performance.now();
    
    try {
      const result = await this.enforceTimeout(
        this.executeModelInference(validatedRequest),
        this.config.inferenceHardTimeoutMs
      );
      return result;
    } catch (error) {
      const fallbackResult = FallbackRuleEngine.generateFallbackResult(validatedRequest, validatedRequest.features);
      const end = performance.now();
      fallbackResult.executionTimeMs = Math.round(end - start);
      return fallbackResult;
    }
  }

  /**
   * Processes a batch of inference requests concurrently.
   * Individual failures use fallback execution.
   *
   * @param requests - The batch of incoming inference requests.
   * @returns The ordered array of results.
   */
  public async predictBatch(requests: ReadonlyArray<InferenceRequest>): Promise<ReadonlyArray<InferenceResult>> {
    const promises = requests.map(req => this.predict(req));
    return Promise.all(promises);
  }
}
