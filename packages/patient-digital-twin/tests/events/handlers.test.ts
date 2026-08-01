import { describe, it, expect } from 'vitest';
import {
  VitalIngestionHandler,
  VitalTelemetryRepository,
  RedisStateCache,
  MockRedisClient,
  IDbExecutor,
  QueryResult,
  createVital,
  createEventEnvelope
} from '../../src';

class MockDbExecutor implements IDbExecutor {
  public queries: any[] = [];
  async query<R extends Record<string, any> = any, I extends any[] = any[]>(
    sql: string,
    params?: I
  ): Promise<QueryResult<R>> {
    this.queries.push({ sql, params });
    return { rows: [], rowCount: 0 };
  }
}

describe('EWP-006: Event Handler Integration Tests', () => {
  const patientId = '123e4567-e89b-12d3-a456-426614174000';

  it('processes VitalIngestionHandler by writing to TimescaleDB and updating Redis cache', async () => {
    const mockDb = new MockDbExecutor();
    const vitalRepo = new VitalTelemetryRepository(mockDb);
    const redis = new MockRedisClient();
    const stateCache = new RedisStateCache(redis);

    const handler = new VitalIngestionHandler(vitalRepo, stateCache);

    const vital = createVital({
      patientId,
      metric: 'heartRate',
      value: 78,
      unit: 'bpm'
    });

    const envelope = createEventEnvelope('patient.vital.ingested', [vital]);
    await handler.handle(envelope);

    expect(mockDb.queries.length).toBe(1);
    expect(mockDb.queries[0].sql).toContain('INSERT INTO vitals_telemetry');

    const cachedVitals = await stateCache.getVitalsCache(patientId);
    expect(cachedVitals).not.toBeNull();
    expect(cachedVitals?.['heartRate']?.value).toBe(78);
  });
});
