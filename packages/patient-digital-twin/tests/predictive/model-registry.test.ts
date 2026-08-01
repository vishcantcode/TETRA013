import { describe, it, expect, beforeEach } from 'vitest';
import { ModelRegistry } from '../../src/predictive/model-registry';
import { ModelMetadata } from '../../src/predictive/pais-types';

describe('ModelRegistry', () => {
  let registry: ModelRegistry;

  beforeEach(() => {
    registry = new ModelRegistry();
  });

  const createMetadata = (overrides?: Partial<ModelMetadata>): ModelMetadata => ({
    modelId: crypto.randomUUID(),
    name: 'test-model',
    version: '1.0.0',
    domain: 'deterioration',
    stage: 'development',
    accuracyMetrics: { auroc: 0.85, f1Score: 0.80 },
    checksum: 'abc123',
    inputFeatureCount: 8,
    outputDimensions: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  });

  it('registerModel() stores model', () => {
    const meta = createMetadata();
    registry.registerModel(meta);
    expect(registry.getModel(meta.modelId)).toBeDefined();
  });

  it('getModel() returns registered model', () => {
    const meta = createMetadata();
    registry.registerModel(meta);
    const fetched = registry.getModel(meta.modelId);
    expect(fetched?.modelId).toBe(meta.modelId);
  });

  it('getModel() returns null for unknown ID', () => {
    expect(registry.getModel(crypto.randomUUID())).toBeNull();
  });

  it('getProductionModel() returns production model for domain', () => {
    const meta = createMetadata({ stage: 'production', domain: 'deterioration' });
    registry.registerModel(meta);
    const prod = registry.getProductionModel('deterioration');
    expect(prod?.modelId).toBe(meta.modelId);
  });

  it('getProductionModel() returns null when no production model', () => {
    const meta = createMetadata({ stage: 'development' });
    registry.registerModel(meta);
    expect(registry.getProductionModel('deterioration')).toBeNull();
  });

  it('promoteModel() valid transition development → staging', () => {
    const meta = createMetadata({ stage: 'development' });
    registry.registerModel(meta);
    expect(() => registry.promoteModel(meta.modelId, 'staging')).not.toThrow();
    expect(registry.getModel(meta.modelId)?.stage).toBe('staging');
  });

  it('promoteModel() invalid transition deprecated → production throws', () => {
    const meta = createMetadata({ stage: 'deprecated' });
    registry.registerModel(meta);
    expect(() => registry.promoteModel(meta.modelId, 'production')).toThrow();
  });

  it('listModels() returns all, filtered by domain', () => {
    const meta1 = createMetadata({ domain: 'deterioration' });
    const meta2 = createMetadata({ domain: 'sepsis' });
    registry.registerModel(meta1);
    registry.registerModel(meta2);

    const all = registry.listModels();
    expect(all.length).toBe(2);

    const filtered = registry.listModels('sepsis');
    expect(filtered.length).toBe(1);
    expect(filtered[0].modelId).toBe(meta2.modelId);
  });

  it('deprecateModel() changes stage to deprecated', () => {
    const meta = createMetadata({ stage: 'production' });
    registry.registerModel(meta);
    registry.deprecateModel(meta.modelId);
    expect(registry.getModel(meta.modelId)?.stage).toBe('deprecated');
  });

  it('registerModel() throws on duplicate ID', () => {
    const meta = createMetadata();
    registry.registerModel(meta);
    expect(() => registry.registerModel(meta)).toThrow();
  });
});
