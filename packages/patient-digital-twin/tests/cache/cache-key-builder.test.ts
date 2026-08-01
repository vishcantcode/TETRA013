import { describe, it, expect } from 'vitest';
import { CacheKeyBuilder } from '../../src';

describe('EWP-004: CacheKeyBuilder Unit Tests', () => {
  const patientId = '123e4567-e89b-12d3-a456-426614174000';

  it('builds valid standardized Redis cache keys', () => {
    expect(CacheKeyBuilder.patientTwinKey(patientId)).toBe(
      `healthsense:twin:${patientId}:state`
    );
    expect(CacheKeyBuilder.vitalCollectionKey(patientId)).toBe(
      `healthsense:twin:${patientId}:vitals`
    );
    expect(CacheKeyBuilder.biomarkerCollectionKey(patientId)).toBe(
      `healthsense:twin:${patientId}:biomarkers`
    );
    expect(CacheKeyBuilder.medicationCollectionKey(patientId)).toBe(
      `healthsense:twin:${patientId}:medications`
    );
    expect(CacheKeyBuilder.riskScoreCollectionKey(patientId)).toBe(
      `healthsense:twin:${patientId}:risk`
    );
    expect(CacheKeyBuilder.lockKey(patientId)).toBe(
      `healthsense:twin:${patientId}:lock`
    );
  });
});
