import { describe, it, expect } from 'vitest';
import { TransactionManager, IDbPool, ITransactionalClient, QueryResult } from '../../src';

class MockTransactionalClient implements ITransactionalClient {
  public executedStatements: string[] = [];
  public released: boolean = false;

  async query<R extends Record<string, any> = any, I extends any[] = any[]>(
    sql: string,
    _params?: I
  ): Promise<QueryResult<R>> {
    this.executedStatements.push(sql);
    return { rows: [], rowCount: 0 };
  }

  release() {
    this.released = true;
  }
}

class MockDbPool implements IDbPool {
  public client = new MockTransactionalClient();

  async connect(): Promise<ITransactionalClient> {
    return this.client;
  }
}

describe('EWP-003: TransactionManager Atomic Transaction Tests', () => {
  it('commits transaction on successful callback execution', async () => {
    const pool = new MockDbPool();
    const tm = new TransactionManager(pool);

    const result = await tm.withTransaction(async (exec) => {
      await exec.query('INSERT INTO test VALUES (1)');
      return 'success';
    });

    expect(result).toBe('success');
    expect(pool.client.executedStatements).toEqual([
      'BEGIN',
      'INSERT INTO test VALUES (1)',
      'COMMIT'
    ]);
    expect(pool.client.released).toBe(true);
  });

  it('rolls back transaction when callback throws an exception', async () => {
    const pool = new MockDbPool();
    const tm = new TransactionManager(pool);

    await expect(
      tm.withTransaction(async (exec) => {
        await exec.query('INSERT INTO test VALUES (1)');
        throw new Error('Database write constraint error');
      })
    ).rejects.toThrow('Database write constraint error');

    expect(pool.client.executedStatements).toEqual([
      'BEGIN',
      'INSERT INTO test VALUES (1)',
      'ROLLBACK'
    ]);
    expect(pool.client.released).toBe(true);
  });
});
