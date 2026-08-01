import { BaseRepository } from './base-repository.js';
import { pool } from './pool.js';

export interface CarePlanRecord {
  id: string;
  patient_id: string;
  status: string;
  goals: any;
  conditions: any;
  created_at: Date;
  updated_at: Date;
}

export class CarePlanRepository extends BaseRepository<CarePlanRecord> {
  constructor() { super('care_plans'); }

  async findByPatientId(patientId: string): Promise<CarePlanRecord | null> {
    const res = await pool.query('SELECT * FROM care_plans WHERE patient_id = $1 AND status = \'active\' ORDER BY created_at DESC LIMIT 1', [patientId]);
    return res.rows[0] || null;
  }

  async savePlan(plan: Omit<CarePlanRecord, 'id' | 'created_at' | 'updated_at'>): Promise<CarePlanRecord> {
    const res = await pool.query(
      `INSERT INTO care_plans (patient_id, status, goals, conditions) VALUES ($1, $2, $3, $4) RETURNING *`,
      [plan.patient_id, plan.status, plan.goals, plan.conditions]
    );
    return res.rows[0];
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await pool.query('UPDATE care_plans SET status = $1, updated_at = NOW() WHERE id = $2', [status, id]);
  }
}
