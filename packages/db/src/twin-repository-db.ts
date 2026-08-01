import { BaseRepository } from './base-repository.js';
import { pool } from './pool.js';

export interface TwinRecord {
  id: string;
  patient_id: string;
  version: number;
  state: any;
  clinical_history: any;
  snapshots: any;
  created_at: Date;
  updated_at: Date;
}

export class TwinRepositoryDB extends BaseRepository<TwinRecord> {
  constructor() { super('patient_twins'); }

  async findById(id: string): Promise<TwinRecord | null> {
    const res = await pool.query('SELECT * FROM patient_twins WHERE id = $1', [id]);
    return res.rows[0] || null;
  }

  async findByPatientId(patientId: string): Promise<TwinRecord | null> {
    const res = await pool.query('SELECT * FROM patient_twins WHERE patient_id = $1', [patientId]);
    return res.rows[0] || null;
  }

  async save(entity: TwinRecord): Promise<void> {
    await pool.query(
      `INSERT INTO patient_twins (id, patient_id, version, state, clinical_history, snapshots, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (id) DO UPDATE SET version = $3, state = $4, clinical_history = $5, snapshots = $6, updated_at = NOW()`,
      [entity.id, entity.patient_id, entity.version, entity.state, entity.clinical_history, entity.snapshots]
    );
  }

  async saveRecord(patientId: string, version: any, state?: any, clinicalHistory?: any, snapshots?: any): Promise<void> {
    let v: number;
    let st: any;
    let ch: any;
    let sn: any;

    if (typeof version === 'object' && version !== null) {
      v = version.currentVersion || version.version || 1;
      st = version.profile || version.state || {};
      ch = version.clinicalHistory || version.clinical_history || {};
      sn = version.snapshots || [];
    } else {
      v = version || 1;
      st = state || {};
      ch = clinicalHistory || {};
      sn = snapshots || [];
    }

    const existing = await this.findByPatientId(patientId);
    if (existing) {
      await pool.query(
        `UPDATE patient_twins SET version = $1, state = $2, clinical_history = $3, snapshots = $4, updated_at = NOW() WHERE patient_id = $5`,
        [v, st, ch, sn, patientId]
      );
    } else {
      await pool.query(
        `INSERT INTO patient_twins (patient_id, version, state, clinical_history, snapshots) VALUES ($1, $2, $3, $4, $5)`,
        [patientId, v, st, ch, sn]
      );
    }
  }

  async getHistory(patientId: string): Promise<any[]> {
    const record = await this.findByPatientId(patientId);
    return record?.snapshots || [];
  }

  async delete(id: string): Promise<void> {
    await pool.query('DELETE FROM patient_twins WHERE id = $1', [id]);
  }

  async softDelete(id: string): Promise<void> {
    await this.delete(id);
  }
}
