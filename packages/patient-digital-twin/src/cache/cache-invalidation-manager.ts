import { IRedisClient } from './redis-client';
import { CacheKeyBuilder } from './cache-key-builder';
import { RedisStateCache } from './redis-state-cache';
import { TwinState } from '../domain';

export class CacheInvalidationManager {
  private redis: IRedisClient;
  private stateCache: RedisStateCache;

  constructor(redis: IRedisClient, stateCache: RedisStateCache) {
    this.redis = redis;
    this.stateCache = stateCache;
  }

  /**
   * Clears all cached keys for a single patient (TwinState, Vitals, Biomarkers, Medications, RiskScores).
   */
  public async invalidatePatientAll(patientId: string): Promise<number> {
    const keys = [
      CacheKeyBuilder.patientTwinKey(patientId),
      CacheKeyBuilder.vitalCollectionKey(patientId),
      CacheKeyBuilder.biomarkerCollectionKey(patientId),
      CacheKeyBuilder.medicationCollectionKey(patientId),
      CacheKeyBuilder.riskScoreCollectionKey(patientId)
    ];

    return await this.redis.del(keys);
  }

  /**
   * Batch invalidates cache entries for multiple patients.
   */
  public async invalidateBatch(patientIds: string[]): Promise<number> {
    let deletedCount = 0;
    for (const id of patientIds) {
      deletedCount += await this.invalidatePatientAll(id);
    }
    return deletedCount;
  }

  /**
   * Refreshes cache entry directly by querying the authoritative database layer.
   */
  public async refreshCache(
    patientId: string,
    fetchState: () => Promise<TwinState | null>
  ): Promise<TwinState | null> {
    await this.invalidatePatientAll(patientId);
    const freshState = await fetchState();
    if (freshState) {
      await this.stateCache.setTwinState(freshState);
    }
    return freshState;
  }
}
