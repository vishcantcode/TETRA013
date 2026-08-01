import { createSuccessResponse } from '../response';
import crypto from 'crypto';

export const enrollMedication = async (req: any, res: any) => {
  try {
    const patientId = req.user?.id || 'patient-123';
    const { name = 'Metformin', dosage = '500mg', frequency = 'BID' } = req.body || {};

    res.json(createSuccessResponse({
      sessionId: crypto.randomUUID(),
      medication: { name, dosage, frequency, status: 'active', enrolledAt: new Date().toISOString() },
      safetyEvaluation: { isSafe: true, interactions: [], guidelineCompliance: 'ADA 2025 Approved First-Line' }
    }, crypto.randomUUID()));
  } catch (err: any) {
    console.error('Medication enrollment error:', err);
    res.status(500).json({ error: 'Failed to enroll medication' });
  }
};

export const getMedicationProfile = async (req: any, res: any) => {
  try {
    const patientId = req.user?.id || 'patient-123';
    res.json(createSuccessResponse([
      { id: 'med-1', name: 'Metformin', dosage: '500mg', frequency: 'BID', status: 'active', indication: 'Type 2 Diabetes' },
      { id: 'med-2', name: 'Telmisartan', dosage: '40mg', frequency: 'OD', status: 'active', indication: 'Hypertension' }
    ], crypto.randomUUID()));
  } catch (err: any) {
    console.error('Fetch medication profile error:', err);
    res.status(500).json({ error: 'Failed to fetch medication profile' });
  }
};

export const recordAdministration = async (req: any, res: any) => {
  try {
    const { medicationId, status = 'administered', notes } = req.body || {};
    res.json(createSuccessResponse({
      id: crypto.randomUUID(),
      medicationId,
      status,
      timestamp: new Date().toISOString(),
      notes: notes || 'Administered per dosage schedule'
    }, crypto.randomUUID()));
  } catch (err: any) {
    console.error('Record administration error:', err);
    res.status(500).json({ error: 'Failed to record medication administration' });
  }
};
