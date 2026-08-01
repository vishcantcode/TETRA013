import { createSuccessResponse } from '../response';
import { pool } from '@healthsense/db';
import crypto from 'crypto';

export const getTimeline = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    
    // Fetch different events
    const assessmentsRes = await pool.query('SELECT id, assessment_type as type, created_at, result FROM health_assessments WHERE patient_id = $1', [userId]);
    const medicationsRes = await pool.query('SELECT id, name, prescribed_date as created_at FROM medications WHERE patient_id = $1', [userId]);
    const carePlansRes = await pool.query('SELECT id, status, created_at FROM care_plans WHERE patient_id = $1', [userId]);

    const events = [];
    
    for (const a of assessmentsRes.rows) {
      events.push({ id: a.id, type: 'assessment', title: `Assessment: ${a.type}`, date: a.created_at, metadata: a.result });
    }
    
    for (const m of medicationsRes.rows) {
      events.push({ id: m.id, type: 'medication', title: `Prescribed: ${m.name}`, date: m.created_at, metadata: {} });
    }
    
    for (const c of carePlansRes.rows) {
      events.push({ id: c.id, type: 'care_plan', title: `Care Plan: ${c.status}`, date: c.created_at, metadata: {} });
    }
    
    events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    res.json(createSuccessResponse({ events }, crypto.randomUUID()));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error fetching timeline' });
  }
};
