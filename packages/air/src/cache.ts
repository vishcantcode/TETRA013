import crypto from 'node:crypto';

export interface AIRCacheEntry<T = any> {
  key: string;
  patientId: string | null;
  data: T;
  createdAt: Date;
  expiresAt: Date;
}

export class AIRClinicalCache {
  private static instance: AIRClinicalCache;
  private cacheMap: Map<string, AIRCacheEntry> = new Map();

  public static getInstance(): AIRClinicalCache {
    if (!AIRClinicalCache.instance) {
      AIRClinicalCache.instance = new AIRClinicalCache();
    }
    return AIRClinicalCache.instance;
  }

  public generateKey(workflowName: string, patientId: string | null, payload: any): string {
    const raw = `${workflowName}:${patientId || 'anon'}:${JSON.stringify(payload || {})}`;
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  public get<T = any>(key: string): T | null {
    const entry = this.cacheMap.get(key);
    if (!entry) return null;

    if (new Date() > entry.expiresAt) {
      this.cacheMap.delete(key);
      return null;
    }

    return entry.data as T;
  }

  public set<T = any>(key: string, patientId: string | null, data: T, ttlSeconds: number = 60): void {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlSeconds * 1000);
    this.cacheMap.set(key, { key, patientId, data, createdAt: now, expiresAt });
  }

  public invalidatePatient(patientId: string): void {
    for (const [key, entry] of this.cacheMap.entries()) {
      if (entry.patientId === patientId) {
        this.cacheMap.delete(key);
      }
    }
  }

  public clear(): void {
    this.cacheMap.clear();
  }
}
