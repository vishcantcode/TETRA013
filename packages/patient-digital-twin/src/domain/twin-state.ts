import { z } from 'zod';
import { VitalSchema, Vital } from './vital';
import { BiomarkerSchema, Biomarker } from './biomarker';
import { MedicationStateSchema, MedicationState } from './medication-state';
import { RiskScoreSchema, RiskScore } from './risk-score';
import { ConditionSchema, Condition } from './condition';

/**
 * Operational state status of a patient digital twin.
 */
export const TwinSyncStatusSchema = z.enum([
  'initialized',
  'synchronizing',
  'steady',
  'stale',
  'error'
]);
export type TwinSyncStatus = z.infer<typeof TwinSyncStatusSchema>;

/**
 * Full structural Patient Digital Twin State model.
 */
export const TwinStateSchema = z.object({
  patientId: z.string().uuid('Patient ID must be a valid UUIDv4'),
  version: z.number().int().min(1).default(1),
  status: TwinSyncStatusSchema.default('initialized'),
  vitals: z.record(VitalSchema).default({}),
  biomarkers: z.record(BiomarkerSchema).default({}),
  medications: z.array(MedicationStateSchema).default([]),
  riskScores: z.record(RiskScoreSchema).default({}),
  conditions: z.array(ConditionSchema).default([]),
  lastTimestamp: z.string().datetime('Last timestamp must be an ISO 8601 string')
});
export type TwinState = z.infer<typeof TwinStateSchema>;

/**
 * Numerical State Vector interface representation for high-speed algorithmic computing.
 */
export const TwinStateVectorSchema = z.object({
  patientId: z.string().uuid(),
  version: z.number().int(),
  timestamp: z.number(), // Epoch milliseconds
  vectorValues: z.array(z.number())
});
export type TwinStateVector = z.infer<typeof TwinStateVectorSchema>;

/**
 * Validates raw data against TwinStateSchema. Throws ZodError on failure.
 */
export function validateTwinState(data: unknown): TwinState {
  return TwinStateSchema.parse(data);
}

/**
 * Safely parses raw data against TwinStateSchema. Returns null on failure.
 */
export function parseTwinState(data: unknown): TwinState | null {
  const result = TwinStateSchema.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * Factory function to create an initial default TwinState for a new patient.
 */
export function createInitialTwinState(patientId: string): TwinState {
  const uuidCheck = z.string().uuid().parse(patientId);
  const now = new Date().toISOString();

  return TwinStateSchema.parse({
    patientId: uuidCheck,
    version: 1,
    status: 'initialized',
    vitals: {},
    biomarkers: {},
    medications: [],
    riskScores: {},
    conditions: [],
    lastTimestamp: now
  });
}

/**
 * Serializes a TwinState instance into a deterministic JSON string.
 */
export function serializeTwinState(state: TwinState): string {
  const validated = validateTwinState(state);
  return JSON.stringify(validated);
}

/**
 * Deserializes a raw JSON string into a validated TwinState object.
 */
export function deserializeTwinState(json: string): TwinState {
  const parsed = JSON.parse(json);
  return validateTwinState(parsed);
}

/**
 * Converts a TwinState into a high-performance continuous Float64Array numerical state vector
 * for Dynamic State Compiler (DSC) and real-time DSP anomaly algorithms.
 *
 * Vector Layout Indices:
 * 0: heartRate
 * 1: bpSystolic
 * 2: bpDiastolic
 * 3: spo2
 * 4: respiratoryRate
 * 5: temperature
 * 6: glucose
 * 7: sepsisNEWS2 score (if present)
 */
export function toStateVector(state: TwinState): Float64Array {
  const validated = validateTwinState(state);
  const vector = new Float64Array(8);

  vector[0] = validated.vitals['heartRate']?.value ?? 0.0;
  vector[1] = validated.vitals['bpSystolic']?.value ?? 0.0;
  vector[2] = validated.vitals['bpDiastolic']?.value ?? 0.0;
  vector[3] = validated.vitals['spo2']?.value ?? 0.0;
  vector[4] = validated.vitals['respiratoryRate']?.value ?? 0.0;
  vector[5] = validated.vitals['temperature']?.value ?? 0.0;
  vector[6] = validated.vitals['glucose']?.value ?? 0.0;
  vector[7] = validated.riskScores['sepsisNEWS2']?.score ?? 0.0;

  return vector;
}
