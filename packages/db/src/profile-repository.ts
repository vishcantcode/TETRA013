import { BaseRepository } from './base-repository.js';
import { pool } from './pool.js';

export interface ProfileRecord {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: Date;
  gender: string;
  created_at: Date;
  updated_at: Date;
}

export class ProfileRepository extends BaseRepository<ProfileRecord> {
  constructor() { super('patient_profiles'); }

  async findByUserId(userId: string): Promise<ProfileRecord | null> {
    const res = await pool.query('SELECT * FROM patient_profiles WHERE user_id = $1', [userId]);
    return res.rows[0] || null;
  }

  async saveProfile(profile: Omit<ProfileRecord, 'id' | 'created_at' | 'updated_at'>): Promise<ProfileRecord> {
    const res = await pool.query(
      `INSERT INTO patient_profiles (user_id, first_name, last_name, date_of_birth, gender) 
       VALUES ($1, $2, $3, $4, $5) 
       ON CONFLICT (user_id) DO UPDATE SET first_name = $2, last_name = $3, date_of_birth = $4, gender = $5, updated_at = NOW() 
       RETURNING *`,
      [profile.user_id, profile.first_name, profile.last_name, profile.date_of_birth, profile.gender]
    );
    return res.rows[0];
  }

  async updateFields(userId: string, fields: Partial<ProfileRecord>): Promise<ProfileRecord | null> {
    const keys = Object.keys(fields).filter(k => k !== 'id' && k !== 'user_id' && k !== 'created_at' && k !== 'updated_at');
    if (keys.length === 0) return this.findByUserId(userId);
    
    const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
    const values = keys.map(k => (fields as any)[k]);
    
    const res = await pool.query(
      `UPDATE patient_profiles SET ${setClause}, updated_at = NOW() WHERE user_id = $1 RETURNING *`,
      [userId, ...values]
    );
    return res.rows[0] || null;
  }
}
