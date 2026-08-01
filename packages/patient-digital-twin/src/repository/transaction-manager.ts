import { IDbExecutor } from './db-connection';

/**
 * Interface for managing atomic database transactions.
 */
export interface ITransactionManager {
  withTransaction<T>(callback: (transactionExecutor: IDbExecutor) => Promise<T>): Promise<T>;
}

/**
 * Interface representing a transactional client capable of BEGIN / COMMIT / ROLLBACK.
 */
export interface ITransactionalClient extends IDbExecutor {
  release?(): void;
}

/**
 * Interface representing a pool that can produce transactional clients.
 */
export interface IDbPool {
  connect(): Promise<ITransactionalClient>;
}

/**
 * TransactionManager implementation executing callbacks inside an isolated transaction block.
 */
export class TransactionManager implements ITransactionManager {
  private pool: IDbPool;

  constructor(pool: IDbPool) {
    this.pool = pool;
  }

  public async withTransaction<T>(
    callback: (transactionExecutor: IDbExecutor) => Promise<T>
  ): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      if (client.release) {
        client.release();
      }
    }
  }
}
