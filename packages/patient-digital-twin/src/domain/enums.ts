import { z } from 'zod';

/**
 * Gender identity or biological sex classification according to healthcare standards.
 */
export const GenderSchema = z.enum(['male', 'female', 'other', 'unknown']);
export type Gender = z.infer<typeof GenderSchema>;

/**
 * Access control roles within the HealthSense OS platform.
 */
export const PatientRoleSchema = z.enum([
  'patient',
  'clinician',
  'admin',
  'caregiver',
  'system'
]);
export type PatientRole = z.infer<typeof PatientRoleSchema>;

/**
 * Lifecycle status of a Patient record.
 */
export const PatientStatusSchema = z.enum([
  'registered',
  'active',
  'suspended',
  'deceased',
  'archived'
]);
export type PatientStatus = z.infer<typeof PatientStatusSchema>;

/**
 * Clinical status of a diagnosed condition.
 */
export const ConditionStatusSchema = z.enum([
  'active',
  'remission',
  'resolved',
  'relapse'
]);
export type ConditionStatus = z.infer<typeof ConditionStatusSchema>;

/**
 * Severity grading of a diagnosed clinical condition.
 */
export const ConditionSeveritySchema = z.enum([
  'mild',
  'moderate',
  'severe',
  'critical'
]);
export type ConditionSeverity = z.infer<typeof ConditionSeveritySchema>;
