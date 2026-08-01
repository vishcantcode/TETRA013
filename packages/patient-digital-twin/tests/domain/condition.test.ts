import { describe, it, expect } from 'vitest';
import {
  ConditionStatusSchema,
  ConditionSeveritySchema,
  ConditionSchema,
  CreateConditionInputSchema,
  UpdateConditionInputSchema,
  validateCondition,
  parseCondition,
  createCondition
} from '../../src/domain';

describe('EWP-001: Condition Domain Model & Enums', () => {
  describe('Condition Enums & Sub-schemas', () => {
    it('validates ConditionStatus enum values correctly', () => {
      expect(ConditionStatusSchema.parse('active')).toBe('active');
      expect(ConditionStatusSchema.parse('remission')).toBe('remission');
      expect(ConditionStatusSchema.parse('resolved')).toBe('resolved');
      expect(ConditionStatusSchema.parse('relapse')).toBe('relapse');
      expect(() => ConditionStatusSchema.parse('cured')).toThrow();
    });

    it('validates ConditionSeverity enum values correctly', () => {
      expect(ConditionSeveritySchema.parse('mild')).toBe('mild');
      expect(ConditionSeveritySchema.parse('moderate')).toBe('moderate');
      expect(ConditionSeveritySchema.parse('severe')).toBe('severe');
      expect(ConditionSeveritySchema.parse('critical')).toBe('critical');
      expect(() => ConditionSeveritySchema.parse('low')).toThrow();
    });
  });

  describe('Condition Entity & Factory', () => {
    const validPatientId = '123e4567-e89b-12d3-a456-426614174000';
    const sampleInput = {
      patientId: validPatientId,
      icd10Code: 'I10',
      name: 'Essential (primary) hypertension',
      onsetDate: '2020-01-15T00:00:00.000Z',
      notes: 'Controlled via Lisinopril 10mg daily'
    };

    it('creates a valid Condition entity using createCondition factory', () => {
      const condition = createCondition(sampleInput);

      expect(condition.id).toBeDefined();
      expect(condition.patientId).toBe(validPatientId);
      expect(condition.icd10Code).toBe('I10');
      expect(condition.category).toBe('chronic');
      expect(condition.status).toBe('active');
      expect(condition.severity).toBe('moderate');
      expect(condition.createdAt).toBeDefined();
      expect(condition.updatedAt).toBeDefined();
    });

    it('validates a complete Condition object successfully', () => {
      const conditionData = {
        id: '987e6543-e21b-12d3-a456-426614174999',
        patientId: validPatientId,
        icd10Code: 'E11.9',
        name: 'Type 2 diabetes mellitus without complications',
        category: 'metabolic',
        status: 'active',
        severity: 'moderate',
        onsetDate: '2018-06-20T00:00:00.000Z',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z'
      };

      const validated = validateCondition(conditionData);
      expect(validated.icd10Code).toBe('E11.9');
      expect(validated.category).toBe('metabolic');
    });

    it('returns null when parseCondition receives invalid data', () => {
      const invalidData = {
        id: 'invalid-id',
        icd10Code: ''
      };

      const parsed = parseCondition(invalidData);
      expect(parsed).toBeNull();
    });

    it('throws ZodError when validateCondition is missing required fields', () => {
      expect(() =>
        validateCondition({
          patientId: validPatientId,
          name: 'Hypertension'
        })
      ).toThrow();
    });

    it('supports partial updates via UpdateConditionInputSchema', () => {
      const updatePayload = {
        status: 'remission' as const,
        notes: 'HbA1c lowered to 5.6%'
      };

      const validatedUpdate = UpdateConditionInputSchema.parse(updatePayload);
      expect(validatedUpdate.status).toBe('remission');
      expect(validatedUpdate.notes).toBe('HbA1c lowered to 5.6%');
    });
  });
});
