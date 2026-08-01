import { z } from 'zod';
import { ConditionStatusSchema, ConditionSeveritySchema } from './enums';

/**
 * Complete enterprise Condition domain model representing a diagnosed medical condition or chronic disease.
 */
export const ConditionSchema = z.object({
  id: z.string().uuid('Condition ID must be a valid UUIDv4'),
  patientId: z.string().uuid('Patient ID must be a valid UUIDv4'),
  icd10Code: z.string().min(1, 'ICD-10 code is required'),
  name: z.string().min(1, 'Condition name is required'),
  category: z.string().default('chronic'),
  status: ConditionStatusSchema.default('active'),
  severity: ConditionSeveritySchema.default('moderate'),
  onsetDate: z.string().datetime('Onset date must be an ISO 8601 string'),
  resolvedDate: z.string().datetime('Resolved date must be an ISO 8601 string').optional(),
  notes: z.string().optional(),
  createdAt: z.string().datetime('Created at must be an ISO 8601 string'),
  updatedAt: z.string().datetime('Updated at must be an ISO 8601 string')
});
export type Condition = z.infer<typeof ConditionSchema>;

/**
 * Input DTO for creating a new Condition record.
 */
export const CreateConditionInputSchema = z.object({
  id: z.string().uuid().optional(),
  patientId: z.string().uuid('Patient ID must be a valid UUIDv4'),
  icd10Code: z.string().min(1, 'ICD-10 code is required'),
  name: z.string().min(1, 'Condition name is required'),
  category: z.string().optional().default('chronic'),
  status: ConditionStatusSchema.optional().default('active'),
  severity: ConditionSeveritySchema.optional().default('moderate'),
  onsetDate: z.string().datetime('Onset date must be an ISO 8601 string'),
  resolvedDate: z.string().datetime('Resolved date must be an ISO 8601 string').optional(),
  notes: z.string().optional()
});
export type CreateConditionInput = z.infer<typeof CreateConditionInputSchema>;

/**
 * Input DTO for updating an existing Condition record.
 */
export const UpdateConditionInputSchema = CreateConditionInputSchema.partial().omit({
  id: true,
  patientId: true
});
export type UpdateConditionInput = z.infer<typeof UpdateConditionInputSchema>;

/**
 * Validates raw data against ConditionSchema.
 * Throws a ZodError if validation fails.
 */
export function validateCondition(data: unknown): Condition {
  return ConditionSchema.parse(data);
}

/**
 * Safely parses raw data against ConditionSchema.
 * Returns null if parsing fails.
 */
export function parseCondition(data: unknown): Condition | null {
  const result = ConditionSchema.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * Factory function to create a fully initialized Condition entity.
 */
export function createCondition(input: CreateConditionInput): Condition {
  const validated = CreateConditionInputSchema.parse(input);
  const now = new Date().toISOString();

  return ConditionSchema.parse({
    ...validated,
    id: validated.id || crypto.randomUUID(),
    createdAt: now,
    updatedAt: now
  });
}
