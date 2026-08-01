import type { IFeatureStore, PAISEngineConfiguration, PredictiveFeatureVector, StoredFeatureRecord } from './pais-types';
import { PAISEngineConfigurationSchema } from './pais-types';

export class FeatureStore implements IFeatureStore {
  private readonly storeMap: Map<string, StoredFeatureRecord>;
  private readonly config: PAISEngineConfiguration;

  /**
   * Constructs a new FeatureStore.
   * @param config - Optional engine configuration overrides
   */
  constructor(config?: Partial<PAISEngineConfiguration>) {
    this.storeMap = new Map<string, StoredFeatureRecord>();
    this.config = PAISEngineConfigurationSchema.parse(config ?? {});
  }

  /**
   * Stores a predictive feature vector in memory.
   * @param features - The feature vector to store
   */
  public async store(features: PredictiveFeatureVector): Promise<void> {
    const record: StoredFeatureRecord = {
      patientId: features.patientId,
      featureVersion: features.featureVersion ?? '1.0.0',
      features: features,
      storedAt: new Date().toISOString(),
      ttlMs: this.config.featureStoreTtlMs
    };
    this.storeMap.set(features.patientId, record);
  }

  /**
   * Retrieves a stored feature record if it exists and is within TTL.
   * @param patientId - The patient ID to retrieve features for
   * @returns The stored feature record, or null if not found or expired
   */
  public async retrieve(patientId: string): Promise<StoredFeatureRecord | null> {
    const record = this.storeMap.get(patientId);
    if (record === undefined) {
      return null;
    }

    const storedAt = new Date(record.storedAt).getTime();
    const now = Date.now();

    if (now - storedAt > record.ttlMs) {
      this.storeMap.delete(patientId);
      return null;
    }

    return record;
  }

  /**
   * Invalidates and removes a stored feature record.
   * @param patientId - The patient ID to invalidate
   */
  public async invalidate(patientId: string): Promise<void> {
    this.storeMap.delete(patientId);
  }

  /**
   * Returns the current number of records in the store.
   * @returns The store size
   */
  public size(): number {
    return this.storeMap.size;
  }

  /**
   * Cleans up the store by removing all expired entries.
   */
  public cleanup(): void {
    const now = Date.now();
    for (const [patientId, record] of this.storeMap.entries()) {
      const storedAt = new Date(record.storedAt).getTime();
      if (now - storedAt > record.ttlMs) {
        this.storeMap.delete(patientId);
      }
    }
  }
}
