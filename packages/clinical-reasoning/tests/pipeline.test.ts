import { describe, it, expect } from 'vitest';
import { ClinicalReasoningPipeline } from '../src/pipeline';
import { ReasoningReplayService } from '../src/testing/replay';
import { ReasoningContext, ReasoningRequest } from '../src/contracts';

describe('Clinical Reasoning Pipeline', () => {
  const testContext: ReasoningContext = {
    config: {
      enableStrictValidation: true,
      priorityThreshold: 0.8,
      maxHypotheses: 5,
      safetyMode: 'strict'
    },
    metadata: {
      traceId: 'trace-1',
      patientId: 'pat-1',
      sessionId: 'sess-1',
      timestamp: new Date(),
      executionMode: 'live'
    }
  };

  const testRequest: ReasoningRequest = {
    patientId: 'pat-1',
    sessionId: 'sess-1',
    rawEvidence: [
      { source: 'symptom-triage', confidence: 0.95, payload: { risk: 'high' } }
    ]
  };

  it('should be deterministic across multiple executions', async () => {
    const pipeline = new ClinicalReasoningPipeline();
    
    const execution1 = await pipeline.execute(testContext, testRequest);
    const execution2 = await pipeline.execute(testContext, testRequest);

    expect(execution1.draft.actions).toEqual(execution2.draft.actions);
    expect(execution1.safety.isSafe).toEqual(execution2.safety.isSafe);
    expect(execution1.draft.severity).toEqual(execution2.draft.severity);
  });

  it('should replay successfully producing identical outputs', async () => {
    const pipeline = new ClinicalReasoningPipeline();
    const liveExecution = await pipeline.execute(testContext, testRequest);

    const originalHash = (new ReasoningReplayService() as any).hashDecision(liveExecution);

    const replayService = new ReasoningReplayService();
    const replayResult = await replayService.replay(testContext, testRequest, originalHash);

    expect(replayResult.match).toBe(true);
  });
});
