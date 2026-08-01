import { describe, it, expect } from 'vitest';
import {
  BiomarkerStatusSchema,
  BiomarkerSchema,
  validateBiomarker,
  parseBiomarker,
  createBiomarker
} from '../../src/domain';

describe('EWP-002: Biomarker Domain Model', () => {
  const validPatientId = '123e4567-e89b-12d3-a456-426614174000';

  it('validates BiomarkerStatusSchema values', () => {
    expect(BiomarkerStatusSchema.parse('normal')).toBe('normal');
    expect(BiomarkerStatusSchema.parse('borderline')).toBe('borderline');
    expect(BiomarkerStatusSchema.parse('elevated')).toBe('elevated');
    expect(BiomarkerStatusSchema.parse('critical')).toBe('critical');
    expect(() => BiomarkerStatusSchema.parse('unknown')).toThrow();
  });

  it('creates a valid Biomarker reading via createBiomarker factory', () => {
    const biomarker = createBiomarker({
      patientId: validPatientId,
      loincCode: '4548-4',
      name: 'Hemoglobin A1c',
      value: 5.6,
      unit: '%',
      referenceRange: '4.0 - 5.6%'
    });

    expect(biomarker.id).toBeDefined();
    expect(biomarker.patientId).toBe(validPatientId);
    expect(biomarker.loincCode).toBe('4548-4');
    expect(biomarker.value).toBe(5.6);
    expect(biomarker.status).toBe('normal');
    expect(biomarker.confidence).toBe(1.0);
  });

  it('validates a complete Biomarker object successfully', () => {
    const data = {
      id: '987e6543-e21b-12d3-a456-426614174999',
      patientId: validPatientId,
      loincCode: '2093-3',
      name: 'Cholesterol, Total',
      value: 240,
      unit: 'mg/dL',
      status: 'elevated',
      confidence: 0.95,
      timestamp: '2026-07-26T10:00:00.000Z'
    };

    const validated = validateBiomarker(data);
    expect(validated.status).toBe('elevated');
    expect(validated.value).toBe(240);
  });

  it('returns null on invalid parseBiomarker', () => {
    const parsed = parseBiomarker({ value: 'not-a-number' });
    expect(parsed).toBeNull();
  });
});
