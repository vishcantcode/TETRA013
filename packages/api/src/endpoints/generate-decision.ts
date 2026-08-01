import { DecisionAggregationPipeline, DecisionEvidence } from '@healthsense/clinical-decision-platform';
import { createSuccessResponse } from '../response';
import crypto from 'crypto';

export const generateDecision = async (req: any, res: any) => {
  const patientId = req.user?.id || 'demo-user-001';
  const sessionId = req.body?.sessionId || crypto.randomUUID();
  const evidencePayloads = req.body?.evidence || [];

  const pipeline = new DecisionAggregationPipeline();

  for (const evidenceData of evidencePayloads) {
    const evidence: DecisionEvidence = {
      sourceEngine: evidenceData.source || 'unknown',
      confidence: evidenceData.confidence || 0.8,
      data: evidenceData.data,
      timestamp: new Date()
    };
    pipeline.addEvidence(evidence);
  }

  try {
    const decision = pipeline.generateDecision(patientId, sessionId);
    return res.json(createSuccessResponse({ draft: decision }, crypto.randomUUID()));
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
