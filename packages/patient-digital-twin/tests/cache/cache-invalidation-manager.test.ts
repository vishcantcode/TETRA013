import { describe, it, expect } from 'vitest';
import {
  MockRedisClient,
  RedisStateCache,
  CacheInvalidationManager,
  createInitialTwinState
} from '../../src';

describe('EWP-004: CacheInvalidationManager Unit Tests', () => {
  const patientId = '123e4567-e89b-12d3-a456-426614174000';

  it('invalidates all cache keys for a patient', async () => {
    const redis = new MockRedisClient();
    const stateCache = new RedisStateCache(redis);
    const manager = new CacheInvalidationManager(redis, stateCache);

    const state = createInitialTwinState(patientId);
    await stateCache.setTwinState(state);

    let cached = await stateCache.getTwinState(patientId);
    expect(cached).not.toBeNull();

    await manager.invalidatePatientAll(patientId);

    cached = await stateCache.getTwinState(patientId);
    expect(cached).toBeNull();
  });

  it('refreshes cache from database source', async () => {
    const redis = new MockRedisClient();
    const stateCache = new RedisStateCache(redis);
    const manager = new CacheInvalidationManager(redis, stateCache);
    const freshState = createInitialTwinState(patientId);

    const refreshed = await manager.refreshCache(patientId, async () => freshState);
    expect(refreshed?.patientId).toBe(patientId);

    const cached = await stateCache.getTwinState(patientId);
    expect(cached).not.toBeNull();
  });
});
