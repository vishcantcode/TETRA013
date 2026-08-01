import { SymptomTriageEngine } from '@healthsense/clinical-models';
import { TwinRepositoryDB, TriageRepository } from '@healthsense/db';
import { TwinFactory } from '@healthsense/patient-digital-twin';
import { createSuccessResponse } from '../response';
import { air } from '@healthsense/air';
import { createHIEKContext } from '@healthsense/hiek';
import crypto from 'crypto';

const triageEngine = new SymptomTriageEngine();
const twinRepo = new TwinRepositoryDB();
const triageRepo = new TriageRepository();

export const startTriage = async (req: any, res: any) => {
  try {
    const patientId = req.user?.id || 'anonymous';
    const correlationId = crypto.randomUUID();

    const hiekContext = createHIEKContext({
      correlationId,
      user: { id: patientId, role: 'patient', email: `${patientId}@healthsense.internal` }
    });

    const airRes = await air.routeAndExecute({
      workflowName: 'SymptomTriageWorkflow',
      context: hiekContext,
      input: req.body,
      handler: async (input, ctx) => {
        let twinRecord = await twinRepo.findByPatientId(patientId);
        let twinState: any;
        if (!twinRecord) {
          const initialTwin = TwinFactory.createInitial(patientId);
          await twinRepo.saveRecord(patientId, initialTwin.currentVersion, initialTwin.profile, initialTwin.clinicalHistory, initialTwin.snapshots);
          twinState = initialTwin.profile;
        } else {
          twinState = twinRecord.state;
        }

        const chiefComplaint = input.chiefComplaint || input.symptoms || 'General discomfort';
        const initialQuestions = triageEngine.determineNextQuestions([{ id: crypto.randomUUID(), symptom: chiefComplaint, timestamp: new Date() }] as any);
        
        const session = await triageRepo.create({
          patient_id: patientId,
          status: 'in_progress',
          symptoms: [{ symptom: chiefComplaint, timestamp: new Date() }]
        });

        return {
          sessionId: session.id,
          question: initialQuestions[0] || { id: crypto.randomUUID(), text: 'Please describe your symptoms in detail.', options: [] }
        };
      }
    });

    if (airRes.status === 'FAILED') {
      return res.status(500).json({ error: airRes.error || 'Triage workflow execution failed' });
    }

    res.json(createSuccessResponse(airRes.data, correlationId));

  } catch (err: any) {
    console.error('Start triage error:', err);
    res.status(500).json({ error: 'Failed to initialize symptom triage' });
  }
};

export const saveAnswer = async (req: any, res: any) => {
  try {
    const { sessionId, answer } = req.body;
    if (!sessionId) return res.status(400).json({ error: 'Missing sessionId' });

    const session = await triageRepo.findById(sessionId);
    if (session) {
      (session as any).metadata = { ...(session as any).metadata, lastAnswer: answer };
      await triageRepo.save(session);
    }
    res.json(createSuccessResponse({ success: true }, crypto.randomUUID()));
  } catch (err: any) {
    console.error('Save answer error:', err);
    res.status(500).json({ error: 'Failed to save answer' });
  }
};

export const completeTriage = async (req: any, res: any) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ error: 'Missing sessionId' });

    const session = await triageRepo.findById(sessionId);
    if (session) {
      session.status = 'completed';
      await triageRepo.save(session);
    }
    res.json(createSuccessResponse({ status: 'completed' }, crypto.randomUUID()));
  } catch (err: any) {
    console.error('Complete triage error:', err);
    res.status(500).json({ error: 'Failed to complete triage' });
  }
};
