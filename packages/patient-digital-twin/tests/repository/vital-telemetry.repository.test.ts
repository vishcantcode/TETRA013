import { describe, it, expect } from 'vitest';
import {
  VitalTelemetryRepository,
  IDbExecutor,
  QueryResult,
  createVital
} from '../../src';

class MockDbExecutor implements IDbExecutor {
  public queries: Array<{ sql: string; params?: any[] }> = [];
  public mockRows: any[] = [];

  async query<R extends Record<string, any> = any, I extends any[] = any[]>(
    sql: string,
    params?: I
  ): Promise<QueryResult<R>> {
    this.queries.push({ sql, params });
    return { rows: this.mockRows as R[], rowCount: this.mockRows.length };
  }
}

describe('EWP-005: VitalTelemetryRepository Unit & Integration Tests', () => {
  const patientId = '123e4567-e89b-12d3-a456-426614174000';

  it('performs high-throughput multi-row bulk insert into vitals_telemetry', async () => {
    const mockDb = new MockDbExecutor();
    const repo = new VitalTelemetryRepository(mockDb);

    const vital1 = createVital({ patientId, metric: 'heartRate', value: 72, unit: 'bpm' });
    const vital2 = createVital({ patientId, metric: 'bpSystolic', value: 120, unit: 'mmHg' });

    await repo.bulkInsertVitals([vital1, vital2]);

    expect(mockDb.queries.length).toBe(1);
    expect(mockDb.queries[0].sql).toContain('INSERT INTO vitals_telemetry');
    expect(mockDb.queries[0].params?.length).toBe(14); // 7 params * 2 items
  });

  it('queries time-range telemetry observations', async () => {
    const mockDb = new MockDbExecutor();
    const repo = new VitalTelemetryRepository(mockDb);

    mockDb.mockRows = [
      {
        patient_id: patientId,
        metric: 'heartRate',
        value: 74,
        unit: 'bpm',
        confidence: 1.0,
        timestamp: '2026-07-26T12:00:00.000Z',
        half_life_ms: 300000
      }
    ];

    const results = await repo.queryTimeRange(
      patientId,
      'heartRate',
      '2026-07-26T00:00:00.000Z',
      '2026-07-26T23:59:59.000Z'
    );

    expect(results.length).toBe(1);
    expect(results[0].value).toBe(74);
  });

  it('queries hourly aggregate buckets', async () => {
    const mockDb = new MockDbExecutor();
    const repo = new VitalTelemetryRepository(mockDb);

    mockDb.mockRows = [
      {
        bucket: '2026-07-26T12:00:00.000Z',
        metric: 'heartRate',
        avg_value: 73.5,
        min_value: 70,
        max_value: 78,
        sample_count: 60
      }
    ];

    const buckets = await repo.queryHourlyAggregates(
      patientId,
      'heartRate',
      '2026-07-26T00:00:00.000Z',
      '2026-07-26T23:59:59.000Z'
    );

    expect(buckets.length).toBe(1);
    expect(buckets[0].avgValue).toBe(73.5);
    expect(buckets[0].count).toBe(60);
  });
});
