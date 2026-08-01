import { BaseRepository } from './base-repository.js';
import { pool } from './pool.js';

export interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  role: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export class UserRepository extends BaseRepository<UserRecord> {
  constructor() { super('users'); }

  async findById(id: string): Promise<UserRecord | null> {
    const res = await pool.query('SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL', [id]);
    return res.rows[0] || null;
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const res = await pool.query('SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL', [email]);
    return res.rows[0] || null;
  }

  async save(entity: UserRecord): Promise<void> {
    await pool.query(
      `INSERT INTO users (id, email, password_hash, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET email = $2, password_hash = $3, role = $4, updated_at = NOW()`,
      [entity.id, entity.email, entity.password_hash, entity.role]
    );
  }

  async create(email: string, passwordHash: string, role: string): Promise<UserRecord> {
    const res = await pool.query(
      `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING *`,
      [email, passwordHash, role]
    );
    return res.rows[0];
  }

  async delete(id: string): Promise<void> {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
  }

  async softDelete(id: string): Promise<void> {
    await pool.query('UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);
  }
}

