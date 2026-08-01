import { describe, it, expect } from 'vitest';
import {
  DynamicStateCompiler,
  CompilerFactory,
  createEventEnvelope,
  createVital,
  MockRedisClient,
  RedisStateCache,
  MockKafkaClient
} from '../../src';

describe('EWP-007: DynamicStateCompiler Integration & Determinism Tests', () => {
  const patientId = '123e4567-e89b-12d3-a456-426614174000';

  it('compiles chronological events into a unified TwinState entity', async () => {
    const kafka = new MockKafkaClient();
    const producer = kafka.createProducer();
    const redis = new MockRedisClient();
    const stateCache = new RedisStateCache(redis);

    const compiler = CompilerFactory.createCompiler(
      { enableAuditSnapshotLogging: false },
      undefined,
      undefined,
      stateCache,
      producer
    );

    const vital1 = createVital({ patientId, metric: 'heartRate', value: 72, unit: 'bpm' });
    const vital2 = createVital({ patientId, metric: 'spo2', value: 99, unit: '%' });

    const event1 = createEventEnvelope('patient.vital.ingested', [vital1]);
    const event2 = createEventEnvelope('patient.vital.ingested', [vital2]);

    const compiledState = await compiler.compile(patientId, [event1, event2]);

    expect(compiledState.patientId).toBe(patientId);
    expect(compiledState.version).toBe(3);
    expect(compiledState.vitals.heartRate?.value).toBe(72);
    expect(compiledState.vitals.spo2?.value).toBe(99);

    // Verify Redis cache write-through
    const cachedState = await stateCache.getTwinState(patientId);
    expect(cachedState).not.toBeNull();
    expect(cachedState?.version).toBe(3);
  });

  it('guarantees deterministic execution outputs for identical event inputs', async () => {
    const compiler1 = new DynamicStateCompiler({ enableKafkaEventPublishing: false, enableWriteThroughCache: false });
    const compiler2 = new DynamicStateCompiler({ enableKafkaEventPublishing: false, enableWriteThroughCache: false });

    const vital = createVital({ patientId, metric: 'heartRate', value: 85, unit: 'bpm' });
    const fixedISO = '2026-07-26T12:00:00.000Z';
    const event = createEventEnvelope('patient.vital.ingested', [vital]);
    event.metadata.timestamp = fixedISO;

    const state1 = await compiler1.compile(patientId, [event]);
    const state2 = await compiler2.compile(patientId, [event]);

    const exported1 = compiler1.exportState(state1);
    const exported2 = compiler2.exportState(state2);

    expect(exported1).toBe(exported2);
  });

  it('exports and imports TwinState deterministically', () => {
    const compiler = new DynamicStateCompiler();
    const vital = createVital({ patientId, metric: 'heartRate', value: 80, unit: 'bpm' });
    const event = createEventEnvelope('patient.vital.ingested', [vital]);

    return compiler.compile(patientId, [event]).then((state) => {
      const json = compiler.exportState(state);
      const imported = compiler.importState(json);

      expect(imported.patientId).toBe(state.patientId);
      expect(imported.version).toBe(state.version);
    });
  });
});
