import { WorkflowRuntime } from '@healthsense/workflow-runtime';
import { medicationIntelligenceWorkflows } from '@healthsense/medication-intelligence';
import { TwinRepositoryDB, MedicationRepository, pool } from '@healthsense/db';
import { TwinFactory } from '@healthsense/patient-digital-twin';
import { createSuccessResponse } from '../response';
import crypto from 'crypto';

const runtime = new WorkflowRuntime();
medicationIntelligenceWorkflows.forEach((workflow, index) => {
  if (!workflow) {
    console.warn(`Workflow ${index} is undefined`);
    return;
  }

  if (!workflow.metadata || !workflow.metadata.name) {
    console.warn(`Workflow ${index} has no metadata.name`);
    return;
  }

  runtime.registry.register(workflow as any);
});
const twinRepo = new TwinRepositoryDB();
const medRepo = new MedicationRepository();

export const enrollMedication = async (req: any, res: any) => {
  try {
    const patientId = req.user?.id || 'anonymous';
    const { name, dosage, frequency, course } = req.body;

    let twinRecord = await twinRepo.findByPatientId(patientId);
    let twin: any;
    if (!twinRecord) {
      const initialTwin = TwinFactory.createInitial(patientId);
      await twinRepo.saveRecord(patientId, initialTwin.currentVersion, initialTwin.profile, initialTwin.clinicalHistory, initialTwin.snapshots);
      twin = {
        patientId,
        version: initialTwin.currentVersion,
        state: initialTwin.profile,
        clinicalHistory: initialTwin.clinicalHistory,
        snapshots: initialTwin.snapshots
      };
    } else {
      twin = {
        patientId: twinRecord.patient_id,
        version: twinRecord.version,
        state: twinRecord.state,
        clinicalHistory: twinRecord.clinical_history,
        snapshots: twinRecord.snapshots
      };
    }

    const session: any = await runtime.startSession('MedicationEnrollmentWorkflow', {
      patientId,
      medication: { name, dosage, frequency, course }
    });

    const sessionIdStr = typeof session === 'string' ? session : session?.id || crypto.randomUUID();

    const execResult = await runtime.executeStep(sessionIdStr, 'check_safety', { twin });

    if (execResult.error) {
      return res.status(400).json({ error: execResult.error });
    }

    // Wrap medication persistence in a transaction
    await pool.query('BEGIN');
    try {
      await medRepo.create({
        patient_id: patientId,
        name,
        dosage,
        frequency,
        status: 'active',
        start_date: new Date()
      });

      await pool.query('COMMIT');
    } catch (txErr) {
      await pool.query('ROLLBACK');
      throw txErr;
    }

    res.json(createSuccessResponse({
      sessionId: sessionIdStr,
      medication: { name, dosage, frequency },
      safetyEvaluation: execResult.data
    }, crypto.randomUUID()));

  } catch (err: any) {
    console.error('Medication enrollment error:', err);
    res.status(500).json({ error: 'Failed to enroll medication' });
  }
};

export const getMedicationProfile = async (req: any, res: any) => {
  try {
    const patientId = req.user?.id || 'anonymous';
    const medications = await medRepo.findByPatientId(patientId);
    res.json(createSuccessResponse(medications, crypto.randomUUID()));
  } catch (err: any) {
    console.error('Fetch medication profile error:', err);
    res.status(500).json({ error: 'Failed to fetch medication profile' });
  }
};

export const recordAdministration = async (req: any, res: any) => {
  try {
    const { medicationId, status, notes } = req.body;
    res.json(createSuccessResponse({
      id: crypto.randomUUID(),
      medicationId,
      status: status || 'administered',
      timestamp: new Date().toISOString(),
      notes
    }, crypto.randomUUID()));
  } catch (err: any) {
    console.error('Record administration error:', err);
    res.status(500).json({ error: 'Failed to record medication administration' });
  }
};
