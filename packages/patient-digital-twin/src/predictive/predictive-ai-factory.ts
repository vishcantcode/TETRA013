import { PredictiveAIEngine } from './predictive-ai-engine';
import type { PAISEngineConfiguration } from './pais-types';
import type { TwinRepository } from '../repository/twin.repository';
import type { RedisStateCache } from '../cache/redis-state-cache';
import type { IKafkaProducer } from '../events';

// ─────────────────────────────────────────────────────────────────────────────
// Predictive AI Factory — PAIS v1.0 Factory Pattern
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Factory for creating configured PredictiveAIEngine instances.
 *
 * Follows the established HealthSense factory pattern used by:
 * - PhysiologicalModelFactory (EWP-009)
 * - ClinicalDecisionFactory (EWP-011)
 * - CompilerFactory (EWP-007)
 *
 * @example
 * ```typescript
 * const engine = PredictiveAIFactory.createEngine(
 *   { inferenceTimeoutMs: 10, enableKafkaEventPublishing: true },
 *   twinRepo,
 *   stateCache,
 *   kafkaProducer
 * );
 * const result = await engine.executePrediction(twinState, history);
 * ```
 */
export class PredictiveAIFactory {
  /**
   * Creates a fully configured PredictiveAIEngine instance.
   *
   * @param config - Optional partial configuration (defaults applied by Zod schema)
   * @param twinRepo - Optional TwinRepository for PostgreSQL persistence
   * @param stateCache - Optional RedisStateCache for write-through caching
   * @param kafkaProducer - Optional IKafkaProducer for event streaming
   * @returns Configured PredictiveAIEngine instance
   */
  public static createEngine(
    config?: Partial<PAISEngineConfiguration>,
    twinRepo?: TwinRepository,
    stateCache?: RedisStateCache,
    kafkaProducer?: IKafkaProducer
  ): PredictiveAIEngine {
    return new PredictiveAIEngine(config, twinRepo, stateCache, kafkaProducer);
  }
}
