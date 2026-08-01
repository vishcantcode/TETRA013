import { describe, it, expect } from 'vitest';
import { VitalRepository, IDbExecutor, QueryResult, createVital } from '../../src';

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

describe('EWP-003: VitalRepository Persistence Tests', () => {
  const validPatientId = '123e4567-e89b-12d3-a456-426614174000';

  it('saves single vital observation to vitals table', async () => {
    const mockDb = new MockDbExecutor();
    const repo = new VitalRepository(mockDb);

    const vital = createVital({
      patientId: validPatientId,
      metric: 'heartRate',
      value: 72,
      unit: 'bpm'
    });

    const saved = await repo.saveVital(vital);
    expect(saved.value).toBe(72);
    expect(mockDb.queries[0].sql).toContain('INSERT INTO vitals');
    expect(mockDb.queries[0].params?.[2]).toBe('heartRate');
  });

  it('queries latest vitals for a patient', async () => {
    const mockDb = new MockDbExecutor();
    const repo = new VitalRepository(mockDb);

    mockDb.mockRows = [
      {
        id: '123e4567-e89b-12d3-a456-426614174001',
        patient_id: validPatientId,
        metric: 'heartRate',
        value: 74,
        unit: 'bpm',
        confidence: 1.0,
        timestamp: '2026-07-26T12:00:00.000Z',
        half_life_ms: 300000
      }
    ];

    const latest = await repo.findLatestVitals(validPatientId);
    expect(latest['heartRate']).toBeDefined();
    expect(latest['heartRate'].value).toBe(74);
  });
});
