/**
 * Standardized Kafka topic names for the Patient Digital Twin Platform.
 */
export const PatientTwinTopics = {
  PATIENT_STATE_CREATED: 'patient.state.created',
  PATIENT_STATE_UPDATED: 'patient.state.updated',
  PATIENT_VITAL_INGESTED: 'patient.vital.ingested',
  PATIENT_BIOMARKER_INGESTED: 'patient.biomarker.ingested',
  PATIENT_MEDICATION_UPDATED: 'patient.medication.updated',
  PATIENT_RISK_UPDATED: 'patient.risk.updated',
  TELEMETRY_INGESTED: 'telemetry.ingested',
  TWIN_CACHE_INVALIDATE: 'twin.cache.invalidate',
  /** PAIS (EWP-012) Kafka topics */
  PATIENT_PREDICTION_GENERATED: 'patient.prediction.generated',
  PATIENT_MODEL_DRIFT_DETECTED: 'patient.model.drift.detected',
  PATIENT_MODEL_PROMOTED: 'patient.model.promoted',
  PATIENT_FORECAST_GENERATED: 'patient.forecast.generated',
  TWIN_STATE_UPDATES: 'twin.state.updates.v1'
} as const;

export type PatientTwinTopic = typeof PatientTwinTopics[keyof typeof PatientTwinTopics];

/**
 * Returns the Dead-Letter Queue (DLQ) topic name for a target topic.
 */
export function getDlqTopic(topic: string, dlqSuffix: string = '.dlq'): string {
  return `${topic}${dlqSuffix}`;
}
