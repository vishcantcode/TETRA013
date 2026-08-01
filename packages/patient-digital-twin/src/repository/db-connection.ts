import { z } from 'zod';

/**
 * Standard PostgreSQL query result row interface.
 */
export interface QueryResultRow {
  [column: string]: any;
}

/**
 * Standard database query response structure.
 */
export interface QueryResult<R extends QueryResultRow = any> {
  rows: R[];
  rowCount: number | null;
}

/**
 * Interface abstraction for executing database queries.
 * Compatible with pg.Pool, pg.Client, transaction clients, or mock test drivers.
 */
export interface IDbExecutor {
  query<R extends QueryResultRow = any, I extends any[] = any[]>(
    queryText: string,
    values?: I
  ): Promise<QueryResult<R>>;
}

/**
 * Zod Schema for validating PostgreSQL connection configuration.
 */
export const PgConfigSchema = z.object({
  host: z.string().min(1, 'Host is required').default('localhost'),
  port: z.number().int().positive().default(5432),
  database: z.string().min(1, 'Database name is required').default('healthsense'),
  user: z.string().min(1, 'Database user is required').default('postgres'),
  password: z.string().default('postgres'),
  maxPoolSize: z.number().int().positive().default(20),
  idleTimeoutMs: z.number().int().positive().default(30000)
});
export type DbConnectionConfig = z.infer<typeof PgConfigSchema>;

/**
 * Custom error thrown when an optimistic locking version collision occurs.
 */
export class OptimisticLockError extends Error {
  public readonly entityId: string;
  public readonly expectedVersion: number;
  public readonly actualVersion: number;

  constructor(entityId: string, expectedVersion: number, actualVersion: number) {
    super(
      `Optimistic lock collision on entity '${entityId}'. Expected version ${expectedVersion}, but database has version ${actualVersion}.`
    );
    this.name = 'OptimisticLockError';
    this.entityId = entityId;
    this.expectedVersion = expectedVersion;
    this.actualVersion = actualVersion;
  }
}
