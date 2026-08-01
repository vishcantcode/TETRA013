import { EventEnvelope, EventMetadataSchema } from './event-models';
import { IKafkaMessage, IKafkaProducer } from './kafka-client';
import { getDlqTopic } from './topics';

export interface IEventHandler<T = any> {
  handle(envelope: EventEnvelope<T>): Promise<void>;
}

export class EventRouter {
  private handlers = new Map<string, IEventHandler>();
  private processedEventIds = new Set<string>();
  private producer: IKafkaProducer | null;
  public processedCount: number = 0;
  public failedCount: number = 0;
  public dlqCount: number = 0;

  constructor(producer?: IKafkaProducer) {
    this.producer = producer || null;
  }

  /**
   * Registers a handler for a given topic or event type.
   */
  public registerHandler(topicOrEventType: string, handler: IEventHandler): void {
    this.handlers.set(topicOrEventType, handler);
  }

  /**
   * Dispatches an incoming Kafka message to its registered handler.
   * Enforces idempotency and routes to DLQ if handler fails.
   */
  public async dispatch(message: IKafkaMessage): Promise<void> {
    try {
      const parsed = JSON.parse(message.value);
      if (!parsed || !parsed.metadata || !parsed.metadata.eventId) {
        throw new Error('Invalid event envelope format: missing metadata.eventId');
      }

      // 1. Validate Metadata Schema
      const metadata = EventMetadataSchema.parse(parsed.metadata);

      // 2. Idempotency Check
      if (this.processedEventIds.has(metadata.eventId)) {
        return; // Duplicate event ignored safely
      }

      // 3. Resolve Handler by EventType or Topic
      const handler = this.handlers.get(metadata.eventType) || this.handlers.get(message.topic);
      if (!handler) {
        return;
      }

      // 4. Execute Handler
      await handler.handle(parsed as EventEnvelope<any>);
      this.processedEventIds.add(metadata.eventId);
      this.processedCount++;
    } catch (error) {
      this.failedCount++;
      if (this.producer) {
        const dlqTopic = getDlqTopic(message.topic);
        await this.producer.produce(dlqTopic, message.key, message.value, {
          ...message.headers,
          'x-error-reason': String(error)
        });
        this.dlqCount++;
      } else {
        throw error;
      }
    }
  }
}
