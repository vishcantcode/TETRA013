import { BaseRepository } from './base-repository.js';
import { pool } from './pool.js';

export interface AuditRecord {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  metadata: any;
  ip_address: string;
  created_at: Date;
}

export class AuditRepository extends BaseRepository<AuditRecord> {
  constructor() { super('audit_log'); }

  async log(userId: string, action: string, resourceType: string, resourceId: string, metadata: any = {}, ipAddress: string | null = null): Promise<void> {
    await pool.query(
      `INSERT INTO audit_log (user_id, action, resource_type, resource_id, metadata, ip_address) VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, action, resourceType, resourceId, metadata, ipAddress]
    );
  }

  async findByUser(userId: string): Promise<AuditRecord[]> {
    const res = await pool.query('SELECT * FROM audit_log WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return res.rows;
  }

  async findByResource(resourceType: string, resourceId: string): Promise<AuditRecord[]> {
    const res = await pool.query('SELECT * FROM audit_log WHERE resource_type = $1 AND resource_id = $2 ORDER BY created_at DESC', [resourceType, resourceId]);
    return res.rows;
  }
}
