import { describe, it, expect } from 'vitest';
import {
  VitalMetricSchema,
  ConfidenceScoreSchema,
  VitalUnitSchema,
  VitalSchema,
  validateVital,
  parseVital,
  createVital
} from '../../src/domain';

describe('EWP-002: Vital Domain Model', () => {
  const validPatientId = '123e4567-e89b-12d3-a456-426614174000';

  it('validates VitalMetricSchema values', () => {
    expect(VitalMetricSchema.parse('heartRate')).toBe('heartRate');
    expect(VitalMetricSchema.parse('bpSystolic')).toBe('bpSystolic');
    expect(VitalMetricSchema.parse('spo2')).toBe('spo2');
    expect(() => VitalMetricSchema.parse('invalid_metric')).toThrow();
  });

  it('validates ConfidenceScoreSchema range [0.0, 1.0]', () => {
    expect(ConfidenceScoreSchema.parse(0.95)).toBe(0.95);
    expect(ConfidenceScoreSchema.parse(0.0)).toBe(0.0);
    expect(ConfidenceScoreSchema.parse(1.0)).toBe(1.0);
    expect(() => ConfidenceScoreSchema.parse(1.5)).toThrow();
    expect(() => ConfidenceScoreSchema.parse(-0.1)).toThrow();
  });

  it('validates VitalUnitSchema', () => {
    expect(VitalUnitSchema.parse('bpm')).toBe('bpm');
    expect(VitalUnitSchema.parse('mmHg')).toBe('mmHg');
    expect(VitalUnitSchema.parse('%')).toBe('%');
    expect(() => VitalUnitSchema.parse('lbs')).toThrow();
  });

  it('creates a valid Vital entity via createVital factory', () => {
    const vital = createVital({
      patientId: validPatientId,
      metric: 'heartRate',
      value: 75,
      unit: 'bpm'
    });

    expect(vital.id).toBeDefined();
    expect(vital.patientId).toBe(validPatientId);
    expect(vital.metric).toBe('heartRate');
    expect(vital.value).toBe(75);
    expect(vital.unit).toBe('bpm');
    expect(vital.confidence).toBe(1.0);
    expect(vital.halfLifeMs).toBe(300000);
    expect(vital.timestamp).toBeDefined();
  });

  it('validates a complete Vital object successfully', () => {
    const data = {
      id: '987e6543-e21b-12d3-a456-426614174999',
      patientId: validPatientId,
      metric: 'spo2',
      value: 98,
      unit: '%',
      confidence: 0.99,
      timestamp: '2026-07-26T12:00:00.000Z',
      halfLifeMs: 60000
    };

    const validated = validateVital(data);
    expect(validated.metric).toBe('spo2');
    expect(validated.confidence).toBe(0.99);
  });

  it('returns null on invalid parseVital', () => {
    const invalid = parseVital({ metric: 'unknown' });
    expect(invalid).toBeNull();
  });
});
