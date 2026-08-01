import { DigitalTwinEngine } from '@healthsense/patient-digital-twin';
import { createSuccessResponse } from '../response';
import crypto from 'crypto';

const digitalTwinEngine = new DigitalTwinEngine();

export const enrollCondition = async (req: any, res: any) => {
  try {
    const patientId = req.user?.id || 'patient-123';
    const conditionName = req.body?.condition || 'diabetes';

    res.json(createSuccessResponse({
      condition: conditionName,
      enrolledAt: new Date().toISOString(),
      status: 'ACTIVE',
      carePlan: {
        id: `cp-${Date.now()}`,
        patientId,
        goals: [
          `Maintain target glycemic & blood pressure control for ${conditionName}`,
          'Daily vital tracking & medication compliance'
        ]
      }
    }, crypto.randomUUID()));
  } catch (err: any) {
    console.error('Enroll condition error:', err);
    res.status(500).json({ error: 'Failed to enroll condition' });
  }
};

export const fetchCarePlan = async (req: any, res: any) => {
  try {
    const patientId = req.user?.id || 'patient-123';
    res.json(createSuccessResponse({
      carePlan: {
        patientId,
        status: 'active',
        goals: [
          'Maintain target glycemic / blood pressure control per ICMR 2024 / ADA 2025',
          'Daily vital tracking & 30-min walking routine'
        ]
      }
    }, crypto.randomUUID()));
  } catch (err) {
    console.error('Fetch care plan error:', err);
    res.status(500).json({ error: 'Failed to fetch care plan' });
  }
};
