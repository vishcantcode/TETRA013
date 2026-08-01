import { describe, it, expect } from 'vitest';
import {
  MockRedisClient,
  RedisStateCache,
  createInitialTwinState,
  createVital
} from '../../src';

describe('EWP-004: RedisStateCache Unit & Integration Tests', () => {
  const patientId = '123e4567-e89b-12d3-a456-426614174000';

  it('stores and retrieves TwinState from hot cache successfully', async () => {
    const redis = new MockRedisClient();
    const cache = new RedisStateCache(redis);
    const state = createInitialTwinState(patientId);

    await cache.setTwinState(state);

    const retrieved = await cache.getTwinState(patientId);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.patientId).toBe(patientId);
    expect(retrieved?.version).toBe(1);
  });

  it('returns null on cache miss', async () => {
    const redis = new MockRedisClient();
    const cache = new RedisStateCache(redis);

    const retrieved = await cache.getTwinState('non-existent-id');
    expect(retrieved).toBeNull();
  });

  it('executes read-through cache pattern on miss', async () => {
    const redis = new MockRedisClient();
    const cache = new RedisStateCache(redis);
    const dbState = createInitialTwinState(patientId);

    let dbCallCount = 0;
    const fetchFromDb = async () => {
      dbCallCount++;
      return dbState;
    };

    // First call: Cache miss -> queries DB and populates cache
    const res1 = await cache.readThroughTwinState(patientId, fetchFromDb);
    expect(res1?.patientId).toBe(patientId);
    expect(dbCallCount).toBe(1);

    // Second call: Cache hit -> returns directly from Redis without calling DB
    const res2 = await cache.readThroughTwinState(patientId, fetchFromDb);
    expect(res2?.patientId).toBe(patientId);
    expect(dbCallCount).toBe(1);
  });

  it('executes write-through cache pattern', async () => {
    const redis = new MockRedisClient();
    const cache = new RedisStateCache(redis);
    const state = createInitialTwinState(patientId);

    let dbPersisted = false;
    const persistToDb = async (s: typeof state) => {
      dbPersisted = true;
      return s;
    };

    const res = await cache.writeThroughTwinState(state, persistToDb);
    expect(res.patientId).toBe(patientId);
    expect(dbPersisted).toBe(true);

    const cached = await cache.getTwinState(patientId);
    expect(cached).not.toBeNull();
  });

  it('stores and retrieves vitals dictionary cache', async () => {
    const redis = new MockRedisClient();
    const cache = new RedisStateCache(redis);
    const vital = createVital({
      patientId,
      metric: 'heartRate',
      value: 75,
      unit: 'bpm'
    });

    const dict = { heartRate: vital };
    await cache.setVitalsCache(patientId, dict);

    const retrieved = await cache.getVitalsCache(patientId);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.['heartRate']?.value).toBe(75);
  });
});
