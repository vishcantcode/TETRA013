import { pool } from '@healthsense/db';
import { createSuccessResponse } from '../response';
import crypto from 'crypto';

export const logEvent = async (req: any, res: any) => {
  const { eventName, category, payload } = req.body;
  const userRole = req.user?.role || 'anonymous';
  const anonymizedSessionId = crypto.createHash('sha256').update(req.user?.id || 'anon').digest('hex').substring(0, 16);

  if (!eventName || !category) {
    return res.status(400).json({ error: 'eventName and category are required' });
  }

  try {
    await pool.query(
      `INSERT INTO analytics_events (event_name, category, user_role, anonymized_session_id, payload) VALUES ($1, $2, $3, $4, $5)`,
      [eventName, category, userRole, anonymizedSessionId, payload || {}]
    );

    res.json(createSuccessResponse({ logged: true }, crypto.randomUUID()));
  } catch (err) {
    console.error('Analytics logEvent error:', err);
    res.status(500).json({ error: 'Failed to log analytics event' });
  }
};

export const getAnalyticsSummary = async (req: any, res: any) => {
  try {
    const totalEvents = await pool.query('SELECT COUNT(*) as count FROM analytics_events');
    const eventsByCategory = await pool.query('SELECT category, COUNT(*) as count FROM analytics_events GROUP BY category');
    const recentEvents = await pool.query('SELECT event_name, category, user_role, created_at FROM analytics_events ORDER BY created_at DESC LIMIT 20');

    res.json(createSuccessResponse({
      totalEvents: Number(totalEvents.rows[0]?.count || 0),
      byCategory: eventsByCategory.rows,
      recentEvents: recentEvents.rows
    }, crypto.randomUUID()));
  } catch (err) {
    console.error('Analytics summary error:', err);
    res.status(500).json({ error: 'Failed to fetch analytics summary' });
  }
};
