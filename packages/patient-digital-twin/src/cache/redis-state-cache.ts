import { IRedisClient } from './redis-client';
import { CacheKeyBuilder } from './cache-key-builder';
import { CacheSerializer } from './cache-serializer';
import { TwinState, validateTwinState, Vital, Biomarker } from '../domain';

export class RedisStateCache {
  private redis: IRedisClient;
  private defaultTtlSeconds: number;

  constructor(redis: IRedisClient, defaultTtlSeconds: number = 259200) {
    this.redis = redis;
    this.defaultTtlSeconds = defaultTtlSeconds;
  }

  /**
   * Fetches TwinState from Redis cache. Returns null on cache miss.
   */
  public async getTwinState(patientId: string): Promise<TwinState | null> {
    const key = CacheKeyBuilder.patientTwinKey(patientId);
    const raw = await this.redis.get(key);
    if (!raw) return null;

    try {
      const envelope = CacheSerializer.deserialize<TwinState>(raw);
      return validateTwinState(envelope.data);
    } catch {
      await this.redis.del(key);
      return null;
    }
  }

  /**
   * Caches a TwinState in Redis with specified TTL.
   */
  public async setTwinState(
    state: TwinState,
    ttlSeconds: number = this.defaultTtlSeconds
  ): Promise<void> {
    const validated = validateTwinState(state);
    const key = CacheKeyBuilder.patientTwinKey(validated.patientId);
    const serialized = CacheSerializer.serialize(validated, validated.version);
    await this.redis.set(key, serialized, ttlSeconds);
  }

  /**
   * Invalidates a patient twin state cache entry.
   */
  public async invalidateTwinState(patientId: string): Promise<void> {
    const key = CacheKeyBuilder.patientTwinKey(patientId);
    await this.redis.del(key);
  }

  /**
   * Read-through cache pattern: returns cached TwinState or fetches from DB and caches result.
   */
  public async readThroughTwinState(
    patientId: string,
    fetchFromDb: () => Promise<TwinState | null>
  ): Promise<TwinState | null> {
    const cached = await this.getTwinState(patientId);
    if (cached) return cached;

    const dbState = await fetchFromDb();
    if (dbState) {
      await this.setTwinState(dbState);
    }
    return dbState;
  }

  /**
   * Write-through cache pattern: persists to DB first, then updates Redis cache atomically.
   */
  public async writeThroughTwinState(
    state: TwinState,
    persistToDb: (s: TwinState) => Promise<TwinState>
  ): Promise<TwinState> {
    const persisted = await persistToDb(state);
    await this.setTwinState(persisted);
    return persisted;
  }

  /**
   * Fetches latest vitals dictionary from cache.
   */
  public async getVitalsCache(patientId: string): Promise<Record<string, Vital> | null> {
    const key = CacheKeyBuilder.vitalCollectionKey(patientId);
    const raw = await this.redis.get(key);
    if (!raw) return null;
    try {
      const envelope = CacheSerializer.deserialize<Record<string, Vital>>(raw);
      return envelope.data;
    } catch {
      return null;
    }
  }

  /**
   * Caches latest vitals dictionary in Redis.
   */
  public async setVitalsCache(
    patientId: string,
    vitals: Record<string, Vital>,
    ttlSeconds: number = 300
  ): Promise<void> {
    const key = CacheKeyBuilder.vitalCollectionKey(patientId);
    const serialized = CacheSerializer.serialize(vitals);
    await this.redis.set(key, serialized, ttlSeconds);
  }

  /**
   * Fetches latest lab biomarkers dictionary from cache.
   */
  public async getBiomarkersCache(patientId: string): Promise<Record<string, Biomarker> | null> {
    const key = CacheKeyBuilder.biomarkerCollectionKey(patientId);
    const raw = await this.redis.get(key);
    if (!raw) return null;
    try {
      const envelope = CacheSerializer.deserialize<Record<string, Biomarker>>(raw);
      return envelope.data;
    } catch {
      return null;
    }
  }

  /**
   * Caches lab biomarkers dictionary in Redis.
   */
  public async setBiomarkersCache(
    patientId: string,
    biomarkers: Record<string, Biomarker>,
    ttlSeconds: number = 3600
  ): Promise<void> {
    const key = CacheKeyBuilder.biomarkerCollectionKey(patientId);
    const serialized = CacheSerializer.serialize(biomarkers);
    await this.redis.set(key, serialized, ttlSeconds);
  }
}
