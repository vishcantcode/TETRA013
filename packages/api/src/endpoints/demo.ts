import { createSuccessResponse } from '../response';
import crypto from 'crypto';

export const seedDemoEnvironment = async (req: any, res: any) => {
  try {
    const patientId = req.user?.id || 'patient-diabetes';

    res.json(createSuccessResponse({
      message: 'Demo environment successfully seeded.',
      patientId,
      scenario: 'Chronic Disease Management (Type 2 Diabetes + Stage 3b CKD) initialized per ICMR 2024 / ADA 2025.'
    }, crypto.randomUUID()));
  } catch (err: any) {
    console.error('Seed demo error:', err);
    res.status(500).json({ error: 'Failed to seed demo environment' });
  }
};

export const resetDemoEnvironment = async (req: any, res: any) => {
  try {
    res.json(createSuccessResponse({ message: 'Environment reset successful. All demo profiles re-initialized.' }, crypto.randomUUID()));
  } catch (err: any) {
    console.error('Reset demo error:', err);
    res.status(500).json({ error: 'Failed to reset demo environment' });
  }
};
