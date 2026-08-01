import { HIEKContext } from './context';
import { HIEKDomainEvent, HIEKEventBus } from './events';
import { pool } from '@healthsense/db';

export interface HIEKReplayResult {
  executionId: string;
  replayedEventsCount: number;
  dryRun: boolean;
  history: any[];
  success: boolean;
}

export class HIEKReplayEngine {
  public static async replayExecution(executionId: string, options: { dryRun?: boolean } = { dryRun: true }): Promise<HIEKReplayResult> {
    const dryRun = options.dryRun !== false;

    // Load audit logs and analytics events for the given executionId
    const auditRes = await pool.query(
      `SELECT * FROM audit_log WHERE metadata LIKE $1 ORDER BY created_at ASC`,
      [`%${executionId}%`]
    );

    const eventRes = await pool.query(
      `SELECT * FROM analytics_events WHERE payload LIKE $1 ORDER BY created_at ASC`,
      [`%${executionId}%`]
    );

    const history = [...auditRes.rows, ...eventRes.rows];

    if (dryRun) {
      console.log(`[HIEK Replay Engine] Dry-run replayed ${history.length} records for execution ${executionId} without state mutation.`);
    }

    return {
      executionId,
      replayedEventsCount: history.length,
      dryRun,
      history,
      success: true
    };
  }
}
