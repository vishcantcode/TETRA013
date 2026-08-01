/**
 * Structural interface for Redis client commands.
 * Compatible with ioredis, node-redis, or mock in-memory test clients.
 */
export interface IRedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  del(key: string | string[]): Promise<number>;
  exists(key: string): Promise<boolean>;
  expire(key: string, ttlSeconds: number): Promise<boolean>;
  mget(keys: string[]): Promise<Array<string | null>>;
  mset(kvPairs: Record<string, string>): Promise<void>;
  ping(): Promise<string>;
  quit(): Promise<void>;
}

/**
 * In-memory Mock Redis Client implementation for zero-dependency testing & fast unit execution.
 */
export class MockRedisClient implements IRedisClient {
  private store = new Map<string, { value: string; expiresAt?: number }>();

  public async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  public async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
    this.store.set(key, { value, expiresAt });
  }

  public async del(key: string | string[]): Promise<number> {
    const keys = Array.isArray(key) ? key : [key];
    let count = 0;
    for (const k of keys) {
      if (this.store.delete(k)) count++;
    }
    return count;
  }

  public async exists(key: string): Promise<boolean> {
    const val = await this.get(key);
    return val !== null;
  }

  public async expire(key: string, ttlSeconds: number): Promise<boolean> {
    const entry = this.store.get(key);
    if (!entry) return false;
    entry.expiresAt = Date.now() + ttlSeconds * 1000;
    return true;
  }

  public async mget(keys: string[]): Promise<Array<string | null>> {
    const results: Array<string | null> = [];
    for (const k of keys) {
      results.push(await this.get(k));
    }
    return results;
  }

  public async mset(kvPairs: Record<string, string>): Promise<void> {
    for (const [k, v] of Object.entries(kvPairs)) {
      await this.set(k, v);
    }
  }

  public async ping(): Promise<string> {
    return 'PONG';
  }

  public async quit(): Promise<void> {
    this.store.clear();
  }
}
