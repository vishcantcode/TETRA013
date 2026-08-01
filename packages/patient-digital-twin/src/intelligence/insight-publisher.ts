import { IKafkaProducer, createEventEnvelope } from '../events';
import { ClinicalSummary } from './types';

export class InsightPublisher {
  private kafkaProducer?: IKafkaProducer;

  constructor(kafkaProducer?: IKafkaProducer) {
    this.kafkaProducer = kafkaProducer;
  }

  /**
   * Publishes deterministic clinical intelligence insights to Kafka topics.
   */
  public async publishSummary(summary: ClinicalSummary): Promise<void> {
    if (!this.kafkaProducer) return;

    // 1. Publish summary updated event
    const summaryEvent = createEventEnvelope('patient.summary.updated', summary);
    await this.kafkaProducer.produce(
      'patient.summary.updated',
      summary.patientId,
      JSON.stringify(summaryEvent)
    );

    // 2. Publish risk updated event if risk score is elevated
    if (summary.riskInsight.compositeRiskScore > 0.5) {
      const riskEvent = createEventEnvelope('patient.risk.updated', summary.riskInsight);
      await this.kafkaProducer.produce(
        'patient.risk.updated',
        summary.patientId,
        JSON.stringify(riskEvent)
      );
    }
  }
}
