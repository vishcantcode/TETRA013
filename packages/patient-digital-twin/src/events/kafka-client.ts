/**
 * Message record passed to or received from Kafka brokers.
 */
export interface IKafkaMessage {
  topic: string;
  key?: string;
  value: string;
  headers?: Record<string, string>;
  timestamp?: string;
}

/**
 * Interface abstraction for a Kafka Producer.
 */
export interface IKafkaProducer {
  produce(topic: string, key: string | undefined, value: string, headers?: Record<string, string>): Promise<void>;
  produceBatch(messages: IKafkaMessage[]): Promise<void>;
}

/**
 * Interface abstraction for a Kafka Consumer.
 */
export interface IKafkaConsumer {
  subscribe(topics: string[], handler: (message: IKafkaMessage) => Promise<void>): Promise<void>;
  unsubscribe(): Promise<void>;
}

/**
 * Interface for Kafka client management.
 */
export interface IKafkaClient {
  createProducer(): IKafkaProducer;
  createConsumer(groupId?: string): IKafkaConsumer;
  ping(): Promise<boolean>;
  disconnect(): Promise<void>;
}

/**
 * In-Memory Mock Kafka Client for fast, zero-dependency unit testing and event pipeline verification.
 */
export class MockKafkaProducer implements IKafkaProducer {
  public producedMessages: IKafkaMessage[] = [];
  private broker: MockKafkaClient;

  constructor(broker: MockKafkaClient) {
    this.broker = broker;
  }

  public async produce(
    topic: string,
    key: string | undefined,
    value: string,
    headers?: Record<string, string>
  ): Promise<void> {
    const msg: IKafkaMessage = {
      topic,
      key,
      value,
      headers,
      timestamp: new Date().toISOString()
    };
    this.producedMessages.push(msg);
    await this.broker.dispatchMessage(msg);
  }

  public async produceBatch(messages: IKafkaMessage[]): Promise<void> {
    for (const msg of messages) {
      await this.produce(msg.topic, msg.key, msg.value, msg.headers);
    }
  }
}

export class MockKafkaConsumer implements IKafkaConsumer {
  public subscribedTopics: string[] = [];
  public handler: ((message: IKafkaMessage) => Promise<void>) | null = null;
  private broker: MockKafkaClient;

  constructor(broker: MockKafkaClient) {
    this.broker = broker;
  }

  public async subscribe(
    topics: string[],
    handler: (message: IKafkaMessage) => Promise<void>
  ): Promise<void> {
    this.subscribedTopics = topics;
    this.handler = handler;
    this.broker.registerConsumer(this);
  }

  public async unsubscribe(): Promise<void> {
    this.subscribedTopics = [];
    this.handler = null;
  }
}

export class MockKafkaClient implements IKafkaClient {
  private consumers: MockKafkaConsumer[] = [];

  public createProducer(): IKafkaProducer {
    return new MockKafkaProducer(this);
  }

  public createConsumer(): IKafkaConsumer {
    return new MockKafkaConsumer(this);
  }

  public registerConsumer(consumer: MockKafkaConsumer): void {
    this.consumers.push(consumer);
  }

  public async dispatchMessage(msg: IKafkaMessage): Promise<void> {
    for (const consumer of this.consumers) {
      if (consumer.subscribedTopics.includes(msg.topic) && consumer.handler) {
        await consumer.handler(msg);
      }
    }
  }

  public async ping(): Promise<boolean> {
    return true;
  }

  public async disconnect(): Promise<void> {
    this.consumers = [];
  }
}
