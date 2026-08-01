import { describe, it, expect, vi } from 'vitest';
import { IntelligencePipeline } from '../src/pipeline';
import { AIOrchestrationEngine } from '../src/orchestrator';
import { SafetyEngine } from '../src/safety';
import { DecisionSynthesisEngine } from '../src/synthesis';
import { InputNormalizationEngine, ClinicalContextEngine, ClinicalRuleEngine, TimelineEngine } from '@healthsense/clinical-models';
import { ConfidenceEngine } from '@healthsense/confidence';
import { ExplainabilityEngine } from '@healthsense/explainability';

describe('IntelligencePipeline', () => {
  it('executes full pipeline successfully', async () => {
    const aiProvider = { execute: vi.fn().mockResolvedValue('Take rest') };
    const pipeline = new IntelligencePipeline(
      new InputNormalizationEngine(),
      new ClinicalContextEngine(),
      new ClinicalRuleEngine(),
      new AIOrchestrationEngine(aiProvider),
      new SafetyEngine(),
      new ConfidenceEngine(),
      new ExplainabilityEngine(),
      new DecisionSynthesisEngine(),
      new TimelineEngine()
    );

    const result = await pipeline.execute([{ type: 'symptom', value: 'headache', timestamp: new Date(), source: 'user' }], { id: 'p1', age: 30, gender: 'male', conditions: [] });
    
    expect(result.decision).toBeDefined();
    expect(result.explanation).toBeDefined();
    expect(aiProvider.execute).toHaveBeenCalled();
  });
});
