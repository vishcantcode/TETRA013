import { pool } from '@healthsense/db';
import { createSuccessResponse } from '../response';
import crypto from 'crypto';

export const uploadRecord = async (req: any, res: any) => {
  const patientId = req.user.id;
  const { recordType, title, data } = req.body;

  if (!recordType || !title || !data) {
    return res.status(400).json({ error: 'Missing required fields: recordType, title, data' });
  }

  try {
    const recordRes = await pool.query(
      `INSERT INTO medical_records (patient_id, record_type, title, data) VALUES ($1, $2, $3, $4) RETURNING *`,
      [patientId, recordType, title, data]
    );

    res.json(createSuccessResponse({ record: recordRes.rows[0] }, crypto.randomUUID()));
  } catch (err) {
    console.error('Upload record error:', err);
    res.status(500).json({ error: 'Failed to upload medical record' });
  }
};

export const getRecords = async (req: any, res: any) => {
  try {
    const patientId = req.user.id;
    const recordsRes = await pool.query(
      `SELECT * FROM medical_records WHERE patient_id = $1 ORDER BY created_at DESC`,
      [patientId]
    );

    res.json(createSuccessResponse({ records: recordsRes.rows }, crypto.randomUUID()));
  } catch (err) {
    console.error('Get records error:', err);
    res.status(500).json({ error: 'Failed to fetch medical records' });
  }
};
