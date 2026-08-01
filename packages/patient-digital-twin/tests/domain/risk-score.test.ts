import { describe, it, expect } from 'vitest';
import {
  RiskTrendSchema,
  RiskScoreSchema,
  validateRiskScore,
  parseRiskScore,
  createRiskScore
} from '../../src/domain';

describe('EWP-002: RiskScore Domain Model', () => {
  const validPatientId = '123e4567-e89b-12d3-a456-426614174000';

  it('validates RiskTrendSchema values', () => {
    expect(RiskTrendSchema.parse('rising')).toBe('rising');
    expect(RiskTrendSchema.parse('stable')).toBe('stable');
    expect(RiskTrendSchema.parse('falling')).toBe('falling');
    expect(() => RiskTrendSchema.parse('increasing')).toThrow();
  });

  it('creates a valid RiskScore via createRiskScore factory', () => {
    const risk = createRiskScore({
      patientId: validPatientId,
      riskType: 'sepsisNEWS2',
      score: 0.82,
      trend: 'rising',
      evidenceIds: ['evt_123', 'evt_456']
    });

    expect(risk.id).toBeDefined();
    expect(risk.patientId).toBe(validPatientId);
    expect(risk.riskType).toBe('sepsisNEWS2');
    expect(risk.score).toBe(0.82);
    expect(risk.trend).toBe('rising');
    expect(risk.evidenceIds).toEqual(['evt_123', 'evt_456']);
  });

  it('throws when risk score is outside range [0.0, 1.0]', () => {
    expect(() =>
      createRiskScore({
        patientId: validPatientId,
        riskType: 'cardiovascular',
        score: 1.5
      })
    ).toThrow();
  });
});
