import { createSuccessResponse } from '../response';
import { pool } from '@healthsense/db';
import crypto from 'crypto';

export const getAssessments = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const assessmentsRes = await pool.query('SELECT * FROM health_assessments WHERE patient_id = $1 ORDER BY created_at DESC', [userId]);
    res.json(createSuccessResponse({ assessments: assessmentsRes.rows }, crypto.randomUUID()));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error fetching assessments' });
  }
};

export const getAssessment = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const assessmentRes = await pool.query('SELECT * FROM health_assessments WHERE id = $1 AND patient_id = $2', [id, userId]);
    
    if (assessmentRes.rows.length === 0) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    
    res.json(createSuccessResponse({ assessment: assessmentRes.rows[0] }, crypto.randomUUID()));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error fetching assessment' });
  }
};
