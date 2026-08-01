import { z } from 'zod';
import {
  GenderSchema,
  PatientRoleSchema,
  PatientStatusSchema,
  Gender,
  PatientRole,
  PatientStatus
} from './enums';

/**
 * Address representation for patient demographic records.
 */
export const AddressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State/Province is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required').default('USA')
});
export type Address = z.infer<typeof AddressSchema>;

/**
 * Emergency contact details for acute clinical escalation.
 */
export const EmergencyContactSchema = z.object({
  name: z.string().min(1, 'Contact name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  phoneNumber: z.string().min(7, 'Valid phone number is required'),
  email: z.string().email('Invalid emergency contact email').optional()
});
export type EmergencyContact = z.infer<typeof EmergencyContactSchema>;

/**
 * Complete enterprise Patient domain model.
 */
export const PatientSchema = z.object({
  id: z.string().uuid('Patient ID must be a valid UUIDv4'),
  email: z.string().email('Valid patient email is required'),
  role: PatientRoleSchema.default('patient'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().datetime('Date of birth must be an ISO 8601 string'),
  gender: GenderSchema,
  phoneNumber: z.string().optional(),
  address: AddressSchema.optional(),
  emergencyContact: EmergencyContactSchema.optional(),
  status: PatientStatusSchema.default('registered'),
  tenantId: z.string().min(1).default('default'),
  createdAt: z.string().datetime('Created at must be an ISO 8601 string'),
  updatedAt: z.string().datetime('Updated at must be an ISO 8601 string')
});
export type Patient = z.infer<typeof PatientSchema>;

/**
 * Input DTO for creating a new patient record.
 */
export const CreatePatientInputSchema = z.object({
  id: z.string().uuid().optional(),
  email: z.string().email('Valid patient email is required'),
  role: PatientRoleSchema.optional().default('patient'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().datetime('Date of birth must be an ISO 8601 string'),
  gender: GenderSchema,
  phoneNumber: z.string().optional(),
  address: AddressSchema.optional(),
  emergencyContact: EmergencyContactSchema.optional(),
  status: PatientStatusSchema.optional().default('registered'),
  tenantId: z.string().optional().default('default')
});
export type CreatePatientInput = z.infer<typeof CreatePatientInputSchema>;

/**
 * Input DTO for updating an existing patient record.
 */
export const UpdatePatientInputSchema = CreatePatientInputSchema.partial().omit({ id: true });
export type UpdatePatientInput = z.infer<typeof UpdatePatientInputSchema>;

/**
 * Validates raw data against the complete PatientSchema.
 * Throws a ZodError if validation fails.
 */
export function validatePatient(data: unknown): Patient {
  return PatientSchema.parse(data);
}

/**
 * Safely parses raw data against PatientSchema.
 * Returns null if parsing fails.
 */
export function parsePatient(data: unknown): Patient | null {
  const result = PatientSchema.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * Factory function to create a fully initialized Patient entity from CreatePatientInput.
 */
export function createPatient(input: CreatePatientInput): Patient {
  const validated = CreatePatientInputSchema.parse(input);
  const now = new Date().toISOString();
  
  return PatientSchema.parse({
    ...validated,
    id: validated.id || crypto.randomUUID(),
    createdAt: now,
    updatedAt: now
  });
}
