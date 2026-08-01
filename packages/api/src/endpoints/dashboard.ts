import { createSuccessResponse } from '../response';
import crypto from 'crypto';

export const getDashboardData = async (req: any, res: any) => {
  try {
    const patientId = req.user?.id || 'patient-123';

    res.json(createSuccessResponse({
      patientId,
      overallRiskScore: 82,
      healthScore: 78,
      adherence: 90,
      activeConditions: ['Type 2 Diabetes Mellitus', 'Essential Hypertension'],
      insight: 'High glycemic risk (HbA1c 8.4%) with Stage 3b CKD progression alert per ICMR 2024 / ADA 2025.',
      confidence: 0.94,
      recommendation: 'Maintain Metformin + ACEi/ARB therapy and schedule Nephrology consultation within 48h.',
      recentActivity: [
        { id: '1', title: 'Diagnostic Report Ingested', timestamp: 'Today, 09:30 AM' },
        { id: '2', title: '5-Disease Risk Model Evaluated', timestamp: 'Today, 09:31 AM' }
      ]
    }, crypto.randomUUID()));

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};
