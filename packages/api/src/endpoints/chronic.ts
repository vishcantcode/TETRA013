import { WorkflowRuntime } from '@healthsense/workflow-runtime';
import { diabetesEnrollmentWorkflow, hypertensionEnrollmentWorkflow } from '@healthsense/chronic-disease';
import { TwinRepositoryDB, CarePlanRepository, pool } from '@healthsense/db';
import { TwinFactory, LongitudinalContextEngine } from '@healthsense/patient-digital-twin';
import { createSuccessResponse } from '../response';
import crypto from 'crypto';

const runtime = new WorkflowRuntime();
runtime.registry.register(diabetesEnrollmentWorkflow);
runtime.registry.register(hypertensionEnrollmentWorkflow);

const twinRepo = new TwinRepositoryDB();
const carePlanRepo = new CarePlanRepository();
const contextEngine = new LongitudinalContextEngine();

export const enrollCondition = async (req: any, res: any) => {
  try {
    const patientId = req.user?.id || 'anonymous';
    const conditionName = req.body?.condition || 'diabetes';
    const workflowName = `${conditionName}Enrollment`;

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

    const context = {
      workflowId: workflowName,
      sessionId: crypto.randomUUID(),
      patientId,
      correlationId: crypto.randomUUID(),
      featureFlags: {},
      locale: 'en-US',
      timezone: 'UTC',
      executionMode: 'sync',
      connectivityState: 'online',
      workflowVersion: '1.0.0',
      capabilityMetadata: {},
      permissions: [],
      requestMetadata: {},
      auditMetadata: {},
      currentState: 'CREATED',
      data: { longitudinalContext: twin, input: req.body }
    };

    const result = await runtime.executeWorkflow(workflowName, context);
    
    // Wrap multi-table writes in a transaction for consistency
    await pool.query('BEGIN');
    try {
      // Save generated care plan into DB
      const carePlan = await carePlanRepo.savePlan({
        patient_id: patientId,
        status: 'active',
        goals: [
          { id: 'goal-1', title: `Maintain target glycemic / blood pressure control for ${conditionName}`, status: 'in_progress' },
          { id: 'goal-2', title: 'Daily vital tracking & medication compliance', status: 'in_progress' }
        ],
        conditions: [{ name: conditionName, enrolledAt: new Date().toISOString(), severity: 'moderate' }]
      });

      // Update Digital Twin state
      const delta = contextEngine.computeDelta(twin, result.data);
      const updatedTwin: any = contextEngine.applyDelta(twin, delta);
      await twinRepo.saveRecord(patientId, updatedTwin.currentVersion || updatedTwin.version || 1, updatedTwin.profile || updatedTwin.state || {}, updatedTwin.clinicalHistory || {}, updatedTwin.snapshots || []);

      await pool.query('COMMIT');

      res.json(createSuccessResponse({ condition: conditionName, carePlan, twinVersion: updatedTwin.currentVersion || updatedTwin.version || 1 }, crypto.randomUUID()));
    } catch (txErr) {
      await pool.query('ROLLBACK');
      throw txErr;
    }
  } catch (err: any) {
    console.error('Enroll condition error:', err);
    res.status(500).json({ error: 'Failed to enroll condition' });
  }
};

export const fetchCarePlan = async (req: any, res: any) => {
  try {
    const patientId = req.user.id;
    const carePlan = await carePlanRepo.findByPatientId(patientId);
    res.json(createSuccessResponse({ carePlan }, crypto.randomUUID()));
  } catch (err) {
    console.error('Fetch care plan error:', err);
    res.status(500).json({ error: 'Failed to fetch care plan' });
  }
};
