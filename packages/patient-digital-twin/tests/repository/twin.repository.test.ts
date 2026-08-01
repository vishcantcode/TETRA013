import { describe, it, expect } from 'vitest';
import {
  TwinRepository,
  IDbExecutor,
  QueryResult,
  OptimisticLockError,
  createInitialTwinState
} from '../../src';

class MockDbExecutor implements IDbExecutor {
  public queries: Array<{ sql: string; params?: any[] }> = [];
  public mockRows: any[] = [];
  public mockRowCount: number = 1;

  async query<R extends Record<string, any> = any, I extends any[] = any[]>(
    sql: string,
    params?: I
  ): Promise<QueryResult<R>> {
    this.queries.push({ sql, params });
    return {
      rows: this.mockRows as R[],
      rowCount: this.mockRowCount
    };
  }
}

describe('EWP-003: TwinRepository Unit & Persistence Tests', () => {
  const validPatientId = '123e4567-e89b-12d3-a456-426614174000';

  it('inserts a new TwinState record when none exists', async () => {
    const mockDb = new MockDbExecutor();
    const repo = new TwinRepository(mockDb);

    const initialState = createInitialTwinState(validPatientId);
    mockDb.mockRows = []; // First SELECT returns 0 rows (new insertion path)

    // Override second query response for RETURNING
    let callCount = 0;
    mockDb.query = async (sql: string, params?: any[]) => {
      mockDb.queries.push({ sql, params });
      callCount++;
      if (callCount === 1) return { rows: [], rowCount: 0 };
      return {
        rows: [
          {
            state_json: JSON.stringify(initialState)
          }
        ],
        rowCount: 1
      };
    };

    const saved = await repo.saveTwin(initialState);
    expect(saved.patientId).toBe(validPatientId);
    expect(mockDb.queries.length).toBe(2);
    expect(mockDb.queries[1].sql).toContain('INSERT INTO patient_twins');
  });

  it('throws OptimisticLockError when update version mismatches database version', async () => {
    const mockDb = new MockDbExecutor();
    const repo = new TwinRepository(mockDb);

    const state = createInitialTwinState(validPatientId);
    state.version = 5; // Expected database version: 4

    mockDb.mockRows = [{ version: 2 }]; // Database is actually at version 2

    await expect(repo.saveTwin(state)).rejects.toThrow(OptimisticLockError);
  });

  it('retrieves TwinState by patient ID successfully', async () => {
    const mockDb = new MockDbExecutor();
    const repo = new TwinRepository(mockDb);
    const state = createInitialTwinState(validPatientId);

    mockDb.mockRows = [{ state_json: JSON.stringify(state) }];

    const fetched = await repo.findTwinByPatientId(validPatientId);
    expect(fetched).not.toBeNull();
    expect(fetched?.patientId).toBe(validPatientId);
  });

  it('deletes TwinState by patient ID successfully', async () => {
    const mockDb = new MockDbExecutor();
    const repo = new TwinRepository(mockDb);
    mockDb.mockRowCount = 1;

    const deleted = await repo.deleteTwin(validPatientId);
    expect(deleted).toBe(true);
    expect(mockDb.queries[0].sql).toContain('DELETE FROM patient_twins');
  });
});
