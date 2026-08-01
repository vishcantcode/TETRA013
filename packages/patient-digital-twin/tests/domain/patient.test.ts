import { describe, it, expect } from 'vitest';
import {
  GenderSchema,
  PatientRoleSchema,
  PatientStatusSchema,
  AddressSchema,
  EmergencyContactSchema,
  PatientSchema,
  CreatePatientInputSchema,
  UpdatePatientInputSchema,
  validatePatient,
  parsePatient,
  createPatient
} from '../../src/domain';

describe('EWP-001: Patient Domain Model & Enums', () => {
  describe('Enums & Sub-schemas', () => {
    it('validates Gender enum values correctly', () => {
      expect(GenderSchema.parse('male')).toBe('male');
      expect(GenderSchema.parse('female')).toBe('female');
      expect(GenderSchema.parse('other')).toBe('other');
      expect(GenderSchema.parse('unknown')).toBe('unknown');
      expect(() => GenderSchema.parse('invalid')).toThrow();
    });

    it('validates PatientRole enum values correctly', () => {
      expect(PatientRoleSchema.parse('patient')).toBe('patient');
      expect(PatientRoleSchema.parse('clinician')).toBe('clinician');
      expect(PatientRoleSchema.parse('admin')).toBe('admin');
      expect(PatientRoleSchema.parse('caregiver')).toBe('caregiver');
      expect(PatientRoleSchema.parse('system')).toBe('system');
      expect(() => PatientRoleSchema.parse('doctor')).toThrow();
    });

    it('validates PatientStatus enum values correctly', () => {
      expect(PatientStatusSchema.parse('registered')).toBe('registered');
      expect(PatientStatusSchema.parse('active')).toBe('active');
      expect(PatientStatusSchema.parse('suspended')).toBe('suspended');
      expect(PatientStatusSchema.parse('deceased')).toBe('deceased');
      expect(PatientStatusSchema.parse('archived')).toBe('archived');
      expect(() => PatientStatusSchema.parse('unknown_status')).toThrow();
    });

    it('validates AddressSchema with default country', () => {
      const address = AddressSchema.parse({
        street: '123 Health Way',
        city: 'Boston',
        state: 'MA',
        postalCode: '02115'
      });
      expect(address.country).toBe('USA');
      expect(address.city).toBe('Boston');
    });

    it('validates EmergencyContactSchema', () => {
      const contact = EmergencyContactSchema.parse({
        name: 'Jane Doe',
        relationship: 'Spouse',
        phoneNumber: '555-0199',
        email: 'jane.doe@example.com'
      });
      expect(contact.name).toBe('Jane Doe');
      expect(contact.relationship).toBe('Spouse');
    });
  });

  describe('Patient Entity & Factory', () => {
    const sampleInput = {
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1985-05-15T00:00:00.000Z',
      gender: 'male' as const,
      phoneNumber: '555-0100'
    };

    it('creates a valid Patient entity using createPatient factory', () => {
      const patient = createPatient(sampleInput);

      expect(patient.id).toBeDefined();
      expect(patient.email).toBe('john.doe@example.com');
      expect(patient.role).toBe('patient');
      expect(patient.status).toBe('registered');
      expect(patient.tenantId).toBe('default');
      expect(patient.createdAt).toBeDefined();
      expect(patient.updatedAt).toBeDefined();
    });

    it('validates a complete Patient object successfully', () => {
      const patientData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'sarah.connor@example.com',
        role: 'patient',
        firstName: 'Sarah',
        lastName: 'Connor',
        dateOfBirth: '1975-11-20T00:00:00.000Z',
        gender: 'female',
        status: 'active',
        tenantId: 'mayo-clinic',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z'
      };

      const validated = validatePatient(patientData);
      expect(validated.id).toBe(patientData.id);
      expect(validated.tenantId).toBe('mayo-clinic');
    });

    it('returns null when parsePatient receives invalid data', () => {
      const invalidData = {
        id: 'not-a-uuid',
        email: 'invalid-email'
      };

      const parsed = parsePatient(invalidData);
      expect(parsed).toBeNull();
    });

    it('throws ZodError when validatePatient receives invalid email or missing fields', () => {
      expect(() =>
        validatePatient({
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'not-an-email',
          firstName: 'John'
        })
      ).toThrow();
    });

    it('allows partial update validations via UpdatePatientInputSchema', () => {
      const updatePayload = {
        firstName: 'Johnny',
        phoneNumber: '555-9999'
      };

      const validatedUpdate = UpdatePatientInputSchema.parse(updatePayload);
      expect(validatedUpdate.firstName).toBe('Johnny');
      expect(validatedUpdate.phoneNumber).toBe('555-9999');
    });
  });
});
