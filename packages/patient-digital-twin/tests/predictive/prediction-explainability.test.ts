import { describe, it, expect } from 'vitest';
import { PredictionExplainabilityEngine } from '../../src/predictive/prediction-explainability-engine';

describe('PredictionExplainabilityEngine', () => {
  it('classifyDirection() returns neutral for |score| < 0.01', () => {
    expect(PredictionExplainabilityEngine.classifyDirection(0.005)).toBe('neutral');
    expect(PredictionExplainabilityEngine.classifyDirection(-0.005)).toBe('neutral');
  });

  it('classifyDirection() returns escalating for positive score', () => {
    expect(PredictionExplainabilityEngine.classifyDirection(0.05)).toBe('escalating');
  });

  it('classifyDirection() returns protective for negative score', () => {
    expect(PredictionExplainabilityEngine.classifyDirection(-0.05)).toBe('protective');
  });

  it('computeFeatureAttributions() returns 8 attributions', () => {
    const rawVector = Array.from(new Float64Array([75, 120, 80, 98, 16, 37, 100, 0]));
    const attributions = PredictionExplainabilityEngine.computeFeatureAttributions(rawVector, 0.8);
    expect(attributions.length).toBe(8);
  });

  it('computeFeatureAttributions() sorted by |attributionScore| descending', () => {
    const rawVector = Array.from(new Float64Array([150, 70, 40, 88, 30, 39.5, 300, 0])); // Extreme values to generate varying scores
    const attributions = PredictionExplainabilityEngine.computeFeatureAttributions(rawVector, 0.9);
    
    for (let i = 0; i < attributions.length - 1; i++) {
      expect(Math.abs(attributions[i].attributionScore)).toBeGreaterThanOrEqual(Math.abs(attributions[i+1].attributionScore));
    }
  });

  it('generateExplanation() includes traceId (UUID)', () => {
    const rawVector = Array.from(new Float64Array([75, 120, 80, 98, 16, 37, 100, 0]));
    const expl = PredictionExplainabilityEngine.generateExplanation(rawVector, 0.8);
    expect(expl.traceId).toBeDefined();
    expect(expl.traceId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });

  it('generateExplanation() topAttributions has max 5 entries', () => {
    const rawVector = Array.from(new Float64Array([150, 70, 40, 88, 30, 39.5, 300, 1]));
    const expl = PredictionExplainabilityEngine.generateExplanation(rawVector, 0.9);
    expect(expl.topAttributions.length).toBeLessThanOrEqual(5);
  });

  it('generateExplanation() rationale mentions escalating features', () => {
    const rawVector = Array.from(new Float64Array([150, 70, 40, 88, 30, 39.5, 300, 1]));
    const expl = PredictionExplainabilityEngine.generateExplanation(rawVector, 0.9);
    expect(expl.rationale).toContain('escalating');
  });
});
