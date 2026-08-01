import { BaseRepository } from './base-repository.js';
import { TriageSession } from '@healthsense/clinical-models';
import { pool } from './pool.js';
import crypto from 'crypto';

export class TriageRepository extends BaseRepository<TriageSession> {
  constructor() { super('triage_sessions'); }

  async findById(id: string): Promise<TriageSession | null> {
    const res = await pool.query('SELECT data FROM triage_sessions WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    return res.rows[0].data as TriageSession;
  }

  async save(entity: TriageSession): Promise<void> {
    const query = `
      INSERT INTO triage_sessions (id, data, created_at, updated_at)
      VALUES ($1, $2, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();
    `;
    await pool.query(query, [entity.id, entity]);
  }

  async create(item: any): Promise<TriageSession> {
    const session: any = {
      id: item.id || crypto.randomUUID(),
      patientId: item.patient_id || item.patientId || 'anonymous',
      status: item.status || 'in_progress',
      symptoms: item.symptoms || [],
      startedAt: new Date(),
      updatedAt: new Date()
    };
    await this.save(session);
    return session;
  }

  async delete(id: string): Promise<void> {
    await pool.query('DELETE FROM triage_sessions WHERE id = $1', [id]);
  }

  async softDelete(id: string): Promise<void> {
    const s = await this.findById(id);
    if(s) {
      s.status = 'cancelled';
      await this.save(s);
    }
  }
}
