import { PreventiveIntelligenceEngine } from '@healthsense/preventive-intelligence';
import { LongitudinalIntelligenceEngine } from '@healthsense/longitudinal-intelligence';
import { TwinRepositoryDB } from '@healthsense/db';
import { createSuccessResponse } from '../response';
import { air } from '@healthsense/air';
import { createHIEKContext } from '@healthsense/hiek';
import crypto from 'crypto';

const pie = new PreventiveIntelligenceEngine();
const lcie = new LongitudinalIntelligenceEngine();
const twinRepo = new TwinRepositoryDB();

export const generatePreventiveAssessment = async (req: any, res: any) => {
  try {
    const patientId = req.user?.id || 'anonymous';
    const correlationId = crypto.randomUUID();

    const hiekContext = createHIEKContext({
      correlationId,
      user: { id: patientId, role: 'patient', email: `${patientId}@healthsense.internal` }
    });

    const airRes = await air.routeAndExecute({
      workflowName: 'PreventiveAssessmentWorkflow',
      context: hiekContext,
      ttlSeconds: 60,
      handler: async () => {
        const twinRecord = await twinRepo.findByPatientId(patientId);
        const state = twinRecord ? twinRecord.state : {};
        const assessment = pie.calculateRisk(state, []);
        return { assessment };
      }
    });

    if (airRes.status === 'FAILED') {
      return res.status(500).json({ error: airRes.error || 'Preventive assessment failed' });
    }

    res.json(createSuccessResponse(airRes.data, correlationId));

  } catch (err: any) {
    console.error('Preventive assessment error:', err);
    res.status(500).json({ error: 'Failed to generate preventive assessment' });
  }
};

export const getRiskProfile = async (req: any, res: any) => {
  try {
    const patientId = req.user?.id || 'anonymous';
    const correlationId = crypto.randomUUID();

    const hiekContext = createHIEKContext({
      correlationId,
      user: { id: patientId, role: 'patient', email: `${patientId}@healthsense.internal` }
    });

    const airRes = await air.routeAndExecute({
      workflowName: 'RiskProfileWorkflow',
      context: hiekContext,
      ttlSeconds: 60,
      handler: async () => {
        const twinRecord = await twinRepo.findByPatientId(patientId);
        const state = twinRecord ? twinRecord.state : {};
        const riskProfile = pie.calculateRisk(state, []);
        return { riskProfile };
      }
    });

    if (airRes.status === 'FAILED') {
      return res.status(500).json({ error: airRes.error || 'Failed to fetch risk profile' });
    }

    res.json(createSuccessResponse(airRes.data, correlationId));

  } catch (err: any) {
    console.error('Risk profile error:', err);
    res.status(500).json({ error: 'Failed to fetch risk profile' });
  }
};

export const getLongitudinalTrends = async (req: any, res: any) => {
  try {
    const patientId = req.user?.id || 'anonymous';
    const correlationId = crypto.randomUUID();

    const hiekContext = createHIEKContext({
      correlationId,
      user: { id: patientId, role: 'patient', email: `${patientId}@healthsense.internal` }
    });

    const airRes = await air.routeAndExecute({
      workflowName: 'LongitudinalTrendsWorkflow',
      context: hiekContext,
      ttlSeconds: 60,
      handler: async () => {
        const twinRecord = await twinRepo.findByPatientId(patientId);
        if (!twinRecord) throw new Error('Twin not found');
        
        const insights = lcie.analyze(twinRecord.state as any);
        const trends = insights.filter((i: any) => i.type === 'trend');
        return { trends };
      }
    });

    if (airRes.status === 'FAILED') {
      return res.status(500).json({ error: airRes.error || 'Failed to fetch trends' });
    }

    res.json(createSuccessResponse(airRes.data, correlationId));

  } catch (err: any) {
    console.error('Longitudinal trends error:', err);
    res.status(500).json({ error: 'Failed to fetch longitudinal trends' });
  }
};
