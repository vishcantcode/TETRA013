import { IKafkaProducer } from '../events';
import { createEventEnvelope } from '../events/event-models';
import {
  InferenceResult,
  DriftReport,
  ForecastResult,
  ModelMetadata,
  PredictiveAITopics
} from './pais-types';

// ─────────────────────────────────────────────────────────────────────────────
// Prediction Publisher — Kafka event streaming for PAIS predictions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Publishes predictive AI events to Kafka topics with structured EventEnvelope payloads.
 *
 * Supported events:
 * - `patient.prediction.generated` — ML/fallback inference result
 * - `patient.model.drift.detected` — Data/concept drift alert
 * - `patient.model.promoted` — Model lifecycle stage transition
 * - `patient.forecast.generated` — Vital/risk trajectory forecast
 */
export class PredictionPublisher {
  private readonly producer: IKafkaProducer | undefined;

  public constructor(kafkaProducer?: IKafkaProducer) {
    this.producer = kafkaProducer;
  }

  /**
   * Publishes a prediction result to `patient.prediction.generated`.
   */
  public async publishPrediction(result: InferenceResult): Promise<void> {
    if (!this.producer) return;

    const envelope = createEventEnvelope(
      PredictiveAITopics.PREDICTION_GENERATED,
      result,
      result.explanation.traceId,
      'pais-engine'
    );

    await this.producer.produce(
      PredictiveAITopics.PREDICTION_GENERATED,
      result.patientId,
      JSON.stringify(envelope),
      {
        'event-type': PredictiveAITopics.PREDICTION_GENERATED,
        'trace-id': result.explanation.traceId,
        'patient-id': result.patientId
      }
    );
  }

  /**
   * Publishes a drift detection report to `patient.model.drift.detected`.
   */
  public async publishDriftAlert(report: DriftReport): Promise<void> {
    if (!this.producer) return;

    const envelope = createEventEnvelope(
      PredictiveAITopics.MODEL_DRIFT_DETECTED,
      report,
      report.reportId,
      'pais-engine'
    );

    await this.producer.produce(
      PredictiveAITopics.MODEL_DRIFT_DETECTED,
      report.modelId,
      JSON.stringify(envelope),
      {
        'event-type': PredictiveAITopics.MODEL_DRIFT_DETECTED,
        'model-id': report.modelId,
        'drift-severity': report.driftSeverity
      }
    );
  }

  /**
   * Publishes a model promotion event to `patient.model.promoted`.
   */
  public async publishModelPromotion(metadata: ModelMetadata): Promise<void> {
    if (!this.producer) return;

    const envelope = createEventEnvelope(
      PredictiveAITopics.MODEL_PROMOTED,
      metadata,
      metadata.modelId,
      'pais-engine'
    );

    await this.producer.produce(
      PredictiveAITopics.MODEL_PROMOTED,
      metadata.modelId,
      JSON.stringify(envelope),
      {
        'event-type': PredictiveAITopics.MODEL_PROMOTED,
        'model-id': metadata.modelId,
        'model-stage': metadata.stage
      }
    );
  }

  /**
   * Publishes a forecast result to `patient.forecast.generated`.
   */
  public async publishForecast(result: ForecastResult): Promise<void> {
    if (!this.producer) return;

    const envelope = createEventEnvelope(
      PredictiveAITopics.FORECAST_GENERATED,
      result,
      result.traceId,
      'pais-engine'
    );

    await this.producer.produce(
      PredictiveAITopics.FORECAST_GENERATED,
      result.patientId,
      JSON.stringify(envelope),
      {
        'event-type': PredictiveAITopics.FORECAST_GENERATED,
        'trace-id': result.traceId,
        'patient-id': result.patientId,
        'metric': result.metric
      }
    );
  }
}
