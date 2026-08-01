import { BaseRepository } from './base-repository.js';
import { pool } from './pool.js';

export interface MedicationRecord {
  id: string;
  patient_id: string;
  name: string;
  dosage: string;
  frequency: string;
  active: boolean;
  prescribed_date: Date | null;
  data: any;
  created_at: Date;
  updated_at: Date;
}

export class MedicationRepository extends BaseRepository<MedicationRecord> {
  constructor() { super('medications'); }

  async findByPatientId(patientId: string): Promise<MedicationRecord[]> {
    const res = await pool.query('SELECT * FROM medications WHERE patient_id = $1 ORDER BY created_at DESC', [patientId]);
    return res.rows;
  }

  async findActive(patientId: string): Promise<MedicationRecord[]> {
    const res = await pool.query('SELECT * FROM medications WHERE patient_id = $1 AND active = true ORDER BY created_at DESC', [patientId]);
    return res.rows;
  }

  async saveMedication(med: Omit<MedicationRecord, 'id' | 'created_at' | 'updated_at'>): Promise<MedicationRecord> {
    const res = await pool.query(
      `INSERT INTO medications (patient_id, name, dosage, frequency, active, prescribed_date, data) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [med.patient_id, med.name, med.dosage, med.frequency, med.active, med.prescribed_date, med.data]
    );
    return res.rows[0];
  }

  async create(med: any): Promise<MedicationRecord> {
    return this.saveMedication({
      patient_id: med.patient_id,
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      active: med.status === 'active',
      prescribed_date: med.start_date || new Date(),
      data: {}
    });
  }

  async deactivate(id: string): Promise<void> {
    await pool.query('UPDATE medications SET active = false, updated_at = NOW() WHERE id = $1', [id]);
  }
}
