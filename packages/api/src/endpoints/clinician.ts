import { pool } from '@healthsense/db';
import { createSuccessResponse } from '../response';
import crypto from 'crypto';

export const getPatients = async (req: any, res: any) => {
  try {
    const query = `
      SELECT u.id, u.email, u.created_at, p.first_name, p.last_name, p.date_of_birth, p.gender, t.state as twin_state, t.version as twin_version
      FROM users u
      JOIN patient_profiles p ON u.id = p.user_id
      LEFT JOIN patient_twins t ON u.id = t.patient_id
      WHERE u.role = 'patient'
      ORDER BY p.last_name ASC
    `;
    const patientsRes = await pool.query(query);
    res.json(createSuccessResponse({ patients: patientsRes.rows }, crypto.randomUUID()));
  } catch (err) {
    console.error('Clinician getPatients error:', err);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
};

export const getPatientDetail = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const profileRes = await pool.query('SELECT * FROM patient_profiles WHERE user_id = $1', [id]);
    if (profileRes.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const twinRes = await pool.query('SELECT * FROM patient_twins WHERE patient_id = $1', [id]);
    const carePlanRes = await pool.query('SELECT * FROM care_plans WHERE patient_id = $1 ORDER BY created_at DESC LIMIT 1', [id]);
    const medsRes = await pool.query('SELECT * FROM medications WHERE patient_id = $1 ORDER BY created_at DESC', [id]);
    const assessmentsRes = await pool.query('SELECT * FROM health_assessments WHERE patient_id = $1 ORDER BY created_at DESC', [id]);
    const recordsRes = await pool.query('SELECT * FROM medical_records WHERE patient_id = $1 ORDER BY created_at DESC', [id]);

    res.json(createSuccessResponse({
      profile: profileRes.rows[0],
      twin: twinRes.rows[0] || null,
      carePlan: carePlanRes.rows[0] || null,
      medications: medsRes.rows,
      assessments: assessmentsRes.rows,
      medicalRecords: recordsRes.rows
    }, crypto.randomUUID()));
  } catch (err) {
    console.error('Clinician getPatientDetail error:', err);
    res.status(500).json({ error: 'Failed to fetch patient detail' });
  }
};

export const invitePatient = async (req: any, res: any) => {
  const clinicianId = req.user.id;
  const { patientEmail } = req.body;

  if (!patientEmail) {
    return res.status(400).json({ error: 'Patient email is required' });
  }

  try {
    const inviteCode = `INV-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const insertRes = await pool.query(
      `INSERT INTO patient_invitations (clinician_id, patient_email, invite_code, status) VALUES ($1, $2, $3, 'pending') RETURNING *`,
      [clinicianId, patientEmail, inviteCode]
    );

    res.json(createSuccessResponse({ invitation: insertRes.rows[0] }, crypto.randomUUID()));
  } catch (err) {
    console.error('Clinician invitePatient error:', err);
    res.status(500).json({ error: 'Failed to create patient invitation' });
  }
};
