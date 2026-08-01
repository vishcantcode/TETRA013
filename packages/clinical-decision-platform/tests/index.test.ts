import { describe, it, expect } from 'vitest';
import { DecisionAggregationPipeline } from '../src/pipeline';

describe('Clinical Decision Platform Pipeline', () => {
  it('should generate a valid ClinicalDecision when provided with evidence', () => {
    const pipeline = new DecisionAggregationPipeline();
    pipeline.addEvidence({
      sourceEngine: 'test-engine',
      confidence: 0.9,
      data: { actions: [{ id: '1', type: 'test', description: 'Test Action', executable: true }] },
      timestamp: new Date()
    });

    const decision = pipeline.generateDecision('pat-1', 'sess-1');
    expect(decision).toBeDefined();
    expect(decision.evidence.length).toBe(1);
    expect(decision.recommendations[0].actions.length).toBe(1);
  });
});
