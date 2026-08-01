import { BaseRepository } from './base-repository.js';
import { pool } from './pool.js';

export interface AssessmentRecord {
  id: string;
  patient_id: string;
  assessment_type: string;
  result: any;
  decision: any;
  created_at: Date;
}

export class AssessmentRepository extends BaseRepository<AssessmentRecord> {
  constructor() { super('health_assessments'); }

  async findByPatientId(patientId: string): Promise<AssessmentRecord[]> {
    const res = await pool.query('SELECT * FROM health_assessments WHERE patient_id = $1 ORDER BY created_at DESC', [patientId]);
    return res.rows;
  }

  async findById(id: string): Promise<AssessmentRecord | null> {
    const res = await pool.query('SELECT * FROM health_assessments WHERE id = $1', [id]);
    return res.rows[0] || null;
  }

  async saveAssessment(assessment: Omit<AssessmentRecord, 'id' | 'created_at'>): Promise<AssessmentRecord> {
    const res = await pool.query(
      `INSERT INTO health_assessments (patient_id, assessment_type, result, decision) VALUES ($1, $2, $3, $4) RETURNING *`,
      [assessment.patient_id, assessment.assessment_type, assessment.result, assessment.decision]
    );
    return res.rows[0];
  }
}
