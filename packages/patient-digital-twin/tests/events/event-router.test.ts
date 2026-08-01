import { describe, it, expect } from 'vitest';
import {
  EventRouter,
  MockKafkaClient,
  createEventEnvelope,
  PatientTwinTopics,
  IEventHandler
} from '../../src';

describe('EWP-006: EventRouter & Idempotency Tests', () => {
  it('dispatches valid messages to registered event handlers', async () => {
    const router = new EventRouter();
    let handledCount = 0;

    const mockHandler: IEventHandler = {
      handle: async () => {
        handledCount++;
      }
    };

    router.registerHandler('patient.vital.ingested', mockHandler);

    const envelope = createEventEnvelope('patient.vital.ingested', { metric: 'heartRate' });
    await router.dispatch({
      topic: PatientTwinTopics.PATIENT_VITAL_INGESTED,
      value: JSON.stringify(envelope)
    });

    expect(handledCount).toBe(1);
    expect(router.processedCount).toBe(1);
  });

  it('enforces idempotency and ignores duplicate event IDs', async () => {
    const router = new EventRouter();
    let handledCount = 0;

    const mockHandler: IEventHandler = {
      handle: async () => {
        handledCount++;
      }
    };

    router.registerHandler('patient.vital.ingested', mockHandler);

    const envelope = createEventEnvelope('patient.vital.ingested', { metric: 'heartRate' });
    const msg = {
      topic: PatientTwinTopics.PATIENT_VITAL_INGESTED,
      value: JSON.stringify(envelope)
    };

    // First dispatch -> handled
    await router.dispatch(msg);
    // Second dispatch with same eventId -> ignored safely
    await router.dispatch(msg);

    expect(handledCount).toBe(1);
    expect(router.processedCount).toBe(1);
  });

  it('routes failed event messages to Dead-Letter Queue (DLQ)', async () => {
    const kafka = new MockKafkaClient();
    const producer = kafka.createProducer();
    const router = new EventRouter(producer);

    const failingHandler: IEventHandler = {
      handle: async () => {
        throw new Error('Processing failed');
      }
    };

    router.registerHandler('patient.vital.ingested', failingHandler);

    const envelope = createEventEnvelope('patient.vital.ingested', { metric: 'heartRate' });
    await router.dispatch({
      topic: PatientTwinTopics.PATIENT_VITAL_INGESTED,
      value: JSON.stringify(envelope)
    });

    expect(router.failedCount).toBe(1);
    expect(router.dlqCount).toBe(1);

    const mockProducer = producer as any;
    expect(mockProducer.producedMessages.length).toBe(1);
    expect(mockProducer.producedMessages[0].topic).toBe('patient.vital.ingested.dlq');
  });
});
