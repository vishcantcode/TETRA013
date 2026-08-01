import { z } from 'zod';
import { ConfidenceScoreSchema } from './vital';

/**
 * Clinical status grading for lab biomarker readings.
 */
export const BiomarkerStatusSchema = z.enum([
  'normal',
  'borderline',
  'elevated',
  'low',
  'critical'
]);
export type BiomarkerStatus = z.infer<typeof BiomarkerStatusSchema>;

/**
 * Diagnostic lab biomarker observation model.
 */
export const BiomarkerSchema = z.object({
  id: z.string().uuid('Biomarker ID must be a valid UUIDv4'),
  patientId: z.string().uuid('Patient ID must be a valid UUIDv4'),
  loincCode: z.string().min(1, 'LOINC code is required'),
  name: z.string().min(1, 'Biomarker name is required'),
  value: z.number(),
  unit: z.string().min(1, 'Unit is required'),
  status: BiomarkerStatusSchema.default('normal'),
  referenceRange: z.string().optional(),
  confidence: ConfidenceScoreSchema,
  timestamp: z.string().datetime('Timestamp must be an ISO 8601 string')
});
export type Biomarker = z.infer<typeof BiomarkerSchema>;

/**
 * Input DTO for creating a new Biomarker reading.
 */
export const CreateBiomarkerInputSchema = z.object({
  id: z.string().uuid().optional(),
  patientId: z.string().uuid('Patient ID must be a valid UUIDv4'),
  loincCode: z.string().min(1, 'LOINC code is required'),
  name: z.string().min(1, 'Biomarker name is required'),
  value: z.number(),
  unit: z.string().min(1, 'Unit is required'),
  status: BiomarkerStatusSchema.optional().default('normal'),
  referenceRange: z.string().optional(),
  confidence: ConfidenceScoreSchema.optional().default(1.0),
  timestamp: z.string().datetime('Timestamp must be an ISO 8601 string').optional()
});
export type CreateBiomarkerInput = z.infer<typeof CreateBiomarkerInputSchema>;

/**
 * Validates raw data against BiomarkerSchema. Throws ZodError on failure.
 */
export function validateBiomarker(data: unknown): Biomarker {
  return BiomarkerSchema.parse(data);
}

/**
 * Safely parses raw data against BiomarkerSchema. Returns null on failure.
 */
export function parseBiomarker(data: unknown): Biomarker | null {
  const result = BiomarkerSchema.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * Factory function to construct a verified Biomarker entity.
 */
export function createBiomarker(input: CreateBiomarkerInput): Biomarker {
  const validated = CreateBiomarkerInputSchema.parse(input);
  return BiomarkerSchema.parse({
    ...validated,
    id: validated.id || crypto.randomUUID(),
    timestamp: validated.timestamp || new Date().toISOString()
  });
}
