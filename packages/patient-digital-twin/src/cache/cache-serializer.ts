export interface CacheEnvelope<T> {
  data: T;
  version?: number;
  cachedAt: string;
}

export class CacheSerializer {
  public static serialize<T>(data: T, version?: number): string {
    const envelope: CacheEnvelope<T> = {
      data,
      version,
      cachedAt: new Date().toISOString()
    };
    return JSON.stringify(envelope);
  }

  public static deserialize<T>(json: string): CacheEnvelope<T> {
    return JSON.parse(json) as CacheEnvelope<T>;
  }
}
