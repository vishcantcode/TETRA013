import { pool } from './pool.js';

export abstract class BaseRepository<T> {
  constructor(protected tableName: string) {}

  async findById(id: string): Promise<T | null> {
    const res = await pool.query(`SELECT * FROM ${this.tableName} WHERE id = $1`, [id]);
    return (res.rows[0] as T) || null;
  }

  async save(entity: T): Promise<void> {
    // Override in derived repositories for custom insert/update logic
  }

  async delete(id: string): Promise<void> {
    await pool.query(`DELETE FROM ${this.tableName} WHERE id = $1`, [id]);
  }

  async softDelete(id: string): Promise<void> {
    await pool.query(`UPDATE ${this.tableName} SET deleted_at = NOW() WHERE id = $1`, [id]);
  }
}
