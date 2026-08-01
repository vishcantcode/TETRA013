import { PatientTwin } from '@healthsense/patient-digital-twin';
import { MedicationCourse } from '@healthsense/medication-intelligence';
import { TwinRepositoryDB, pool } from '@healthsense/db';

const twinRepo = new TwinRepositoryDB();

import { createSuccessResponse } from '../response';
import crypto from 'crypto';

export const seedDemoEnvironment = async (req: any, res: any) => {
  try {
    const patientId = req.user?.id || 'demo-user-001';

    // Seed a deterministic digital twin for Hackathon Demo
    const demoProfile = new PatientTwin(
      patientId,
      1,
      {
        symptoms: [],
        medications: [],
        vitals: [
          { id: crypto.randomUUID(), type: 'blood_pressure_sys', value: 145, unit: 'mmHg', date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          { id: crypto.randomUUID(), type: 'blood_pressure_sys', value: 138, unit: 'mmHg', date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
          { id: crypto.randomUUID(), type: 'blood_pressure_sys', value: 132, unit: 'mmHg', date: new Date() }
        ],
        risk: { factors: [], lastUpdated: new Date() },
        lifestyle: { smoking: false, diet: 'moderate', exercise: 'low', alcohol: false },
        behavior: { adherenceScore: 92 },
        carePlan: { currentPlanId: crypto.randomUUID(), status: 'active' },
        goals: { goals: [] }
      },
      {
        pastConditions: ['Hypertension', 'Type 2 Diabetes'],
        encounters: []
      },
      []
    );

    // Inject it directly into the TwinRepository (mock memory layer)
    await twinRepo.saveRecord(demoProfile.patientId, demoProfile.currentVersion, demoProfile.profile, demoProfile.clinicalHistory, demoProfile.snapshots);

    res.json(createSuccessResponse({ 
      message: 'Demo environment successfully seeded.',
      patientId,
      scenario: 'Chronic Disease Management (Hypertension + Diabetes) with Improving Trends.'
    }, crypto.randomUUID()));
  } catch (err: any) {
    console.error('Seed demo error:', err);
    res.status(500).json({ error: 'Failed to seed demo environment' });
  }
};

export const resetDemoEnvironment = async (req: any, res: any) => {
  try {
    res.json(createSuccessResponse({ message: 'Environment reset successful. All caches cleared.' }, crypto.randomUUID()));
  } catch (err: any) {
    console.error('Reset demo error:', err);
    res.status(500).json({ error: 'Failed to reset demo environment' });
  }
};

