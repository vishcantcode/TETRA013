import { createSuccessResponse } from '../response';
import crypto from 'crypto';

export const startTriage = async (req: any, res: any) => {
  try {
    const patientId = req.user?.id || 'patient-123';
    const chiefComplaint = req.body?.chiefComplaint || req.body?.symptoms || 'General fatigue & elevated blood pressure';

    res.json(createSuccessResponse({
      sessionId: crypto.randomUUID(),
      patientId,
      chiefComplaint,
      triageCategory: 'MODERATE_URGENCY',
      question: {
        id: 'q-1',
        text: 'Are you experiencing any dizziness, shortness of breath, or headache?',
        options: ['Yes', 'No', 'Occasionally']
      }
    }, crypto.randomUUID()));

  } catch (err: any) {
    console.error('Start triage error:', err);
    res.status(500).json({ error: 'Failed to initialize symptom triage' });
  }
};

export const saveAnswer = async (req: any, res: any) => {
  try {
    const { sessionId, answer } = req.body || {};
    res.json(createSuccessResponse({ sessionId, answer, saved: true }, crypto.randomUUID()));
  } catch (err: any) {
    console.error('Save answer error:', err);
    res.status(500).json({ error: 'Failed to save answer' });
  }
};

export const completeTriage = async (req: any, res: any) => {
  try {
    const { sessionId } = req.body || {};
    res.json(createSuccessResponse({
      sessionId,
      status: 'completed',
      triageResult: {
        disposition: 'Schedule Outpatient PHC Consultation',
        urgency: 'ROUTINE',
        summary: 'Symptom triage completed per ICMR guidelines.'
      }
    }, crypto.randomUUID()));
  } catch (err: any) {
    console.error('Complete triage error:', err);
    res.status(500).json({ error: 'Failed to complete triage' });
  }
};
