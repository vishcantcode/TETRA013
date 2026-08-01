import { z } from 'zod';

/**
 * Standard vital sign metric types tracked by the bio-digital twin.
 */
export const VitalMetricSchema = z.enum([
  'heartRate',
  'bpSystolic',
  'bpDiastolic',
  'spo2',
  'respiratoryRate',
  'temperature',
  'glucose'
]);
export type VitalMetric = z.infer<typeof VitalMetricSchema>;

/**
 * Confidence score between 0.0 and 1.0 representing signal quality or decay.
 */
export const ConfidenceScoreSchema = z
  .number()
  .min(0.0, 'Confidence score cannot be less than 0.0')
  .max(1.0, 'Confidence score cannot exceed 1.0')
  .default(1.0);
export type ConfidenceScore = z.infer<typeof ConfidenceScoreSchema>;

/**
 * Standard units for vital metric signs.
 */
export const VitalUnitSchema = z.enum([
  'bpm',
  'mmHg',
  '%',
  'breaths/min',
  'degC',
  'mg/dL'
]);
export type VitalUnit = z.infer<typeof VitalUnitSchema>;

/**
 * Single vital sign observation reading.
 */
export const VitalSchema = z.object({
  id: z.string().uuid('Vital ID must be a valid UUIDv4'),
  patientId: z.string().uuid('Patient ID must be a valid UUIDv4'),
  metric: VitalMetricSchema,
  value: z.number(),
  unit: VitalUnitSchema,
  confidence: ConfidenceScoreSchema,
  timestamp: z.string().datetime('Timestamp must be an ISO 8601 string'),
  halfLifeMs: z.number().positive().default(300000) // Default 5 minutes
});
export type Vital = z.infer<typeof VitalSchema>;

/**
 * Input DTO for creating a new Vital observation.
 */
export const CreateVitalInputSchema = z.object({
  id: z.string().uuid().optional(),
  patientId: z.string().uuid('Patient ID must be a valid UUIDv4'),
  metric: VitalMetricSchema,
  value: z.number(),
  unit: VitalUnitSchema,
  confidence: ConfidenceScoreSchema.optional().default(1.0),
  timestamp: z.string().datetime('Timestamp must be an ISO 8601 string').optional(),
  halfLifeMs: z.number().positive().optional().default(300000)
});
export type CreateVitalInput = z.infer<typeof CreateVitalInputSchema>;

/**
 * Validates raw input against VitalSchema. Throws ZodError on failure.
 */
export function validateVital(data: unknown): Vital {
  return VitalSchema.parse(data);
}

/**
 * Safely parses raw input against VitalSchema. Returns null on failure.
 */
export function parseVital(data: unknown): Vital | null {
  const result = VitalSchema.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * Factory function to construct a verified Vital entity.
 */
export function createVital(input: CreateVitalInput): Vital {
  const validated = CreateVitalInputSchema.parse(input);
  return VitalSchema.parse({
    ...validated,
    id: validated.id || crypto.randomUUID(),
    timestamp: validated.timestamp || new Date().toISOString()
  });
}
