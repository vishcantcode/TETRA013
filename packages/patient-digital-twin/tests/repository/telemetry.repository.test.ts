import { describe, it, expect } from 'vitest';
import { TelemetryRepository, IDbExecutor, QueryResult, RepositoryFactory } from '../../src';

class MockDbExecutor implements IDbExecutor {
  async query<R extends Record<string, any> = any, I extends any[] = any[]>(
    _sql: string,
    _params?: I
  ): Promise<QueryResult<R>> {
    return { rows: [], rowCount: 0 };
  }
}

describe('EWP-005: TelemetryRepository Unified Wiring Tests', () => {
  it('instantiates unified TelemetryRepository via RepositoryFactory', () => {
    const mockDb = new MockDbExecutor();
    const factory = new RepositoryFactory(mockDb);
    const telemetryRepo = factory.createTelemetryRepository();

    expect(telemetryRepo).toBeInstanceOf(TelemetryRepository);
    expect(telemetryRepo.vitals).toBeDefined();
    expect(telemetryRepo.biomarkers).toBeDefined();
    expect(telemetryRepo.riskScores).toBeDefined();
  });
});
