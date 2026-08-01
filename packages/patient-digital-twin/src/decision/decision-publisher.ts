import { IKafkaProducer, createEventEnvelope } from '../events';
import { ClinicalDecisionResult } from './cdis-types';

export class DecisionPublisher {
  private kafkaProducer?: IKafkaProducer;

  constructor(kafkaProducer?: IKafkaProducer) {
    this.kafkaProducer = kafkaProducer;
  }

  /**
   * Publishes deterministic clinical decision events to Kafka topics.
   */
  public async publishDecision(decision: ClinicalDecisionResult): Promise<void> {
    if (!this.kafkaProducer) return;

    // 1. Publish patient.decision.evaluated event
    const envelope = createEventEnvelope('patient.decision.evaluated', decision);
    await this.kafkaProducer.produce(
      'patient.decision.evaluated',
      decision.patientId,
      JSON.stringify(envelope)
    );

    // 2. Publish patient.recommendation.generated event
    const recEnvelope = createEventEnvelope('patient.recommendation.generated', decision.topRecommendation);
    await this.kafkaProducer.produce(
      'patient.recommendation.generated',
      decision.patientId,
      JSON.stringify(recEnvelope)
    );
  }
}
