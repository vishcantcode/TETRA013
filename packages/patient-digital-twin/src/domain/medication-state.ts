import { z } from 'zod';

/**
 * Active pharmacological state representation for a single medication in patient twin memory.
 */
export const MedicationStateSchema = z.object({
  id: z.string().uuid('Medication State ID must be a valid UUIDv4'),
  patientId: z.string().uuid('Patient ID must be a valid UUIDv4'),
  rxNormCode: z.string().min(1, 'RxNorm code is required'),
  name: z.string().min(1, 'Medication name is required'),
  dosage: z.string().min(1, 'Dosage string is required'),
  frequency: z.string().default('daily'),
  plasmaConcentrationEst: z.number().min(0.0).default(1.0),
  lastAdministeredAt: z.string().datetime().optional(),
  active: z.boolean().default(true)
});
export type MedicationState = z.infer<typeof MedicationStateSchema>;

/**
 * Input DTO for creating a new MedicationState item.
 */
export const CreateMedicationStateInputSchema = z.object({
  id: z.string().uuid().optional(),
  patientId: z.string().uuid('Patient ID must be a valid UUIDv4'),
  rxNormCode: z.string().min(1, 'RxNorm code is required'),
  name: z.string().min(1, 'Medication name is required'),
  dosage: z.string().min(1, 'Dosage string is required'),
  frequency: z.string().optional().default('daily'),
  plasmaConcentrationEst: z.number().min(0.0).optional().default(1.0),
  lastAdministeredAt: z.string().datetime().optional(),
  active: z.boolean().optional().default(true)
});
export type CreateMedicationStateInput = z.infer<typeof CreateMedicationStateInputSchema>;

/**
 * Validates raw data against MedicationStateSchema. Throws ZodError on failure.
 */
export function validateMedicationState(data: unknown): MedicationState {
  return MedicationStateSchema.parse(data);
}

/**
 * Safely parses raw data against MedicationStateSchema. Returns null on failure.
 */
export function parseMedicationState(data: unknown): MedicationState | null {
  const result = MedicationStateSchema.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * Factory function to construct a verified MedicationState entity.
 */
export function createMedicationState(input: CreateMedicationStateInput): MedicationState {
  const validated = CreateMedicationStateInputSchema.parse(input);
  return MedicationStateSchema.parse({
    ...validated,
    id: validated.id || crypto.randomUUID()
  });
}
