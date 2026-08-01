import { pool } from '@healthsense/db';
import { createSuccessResponse } from '../response';
import crypto from 'crypto';
import { hoip } from '@healthsense/hoip';

export const getUsers = async (req: any, res: any) => {
  try {
    const query = `
      SELECT u.id, u.email, u.role, u.created_at, p.first_name, p.last_name, p.gender, p.date_of_birth
      FROM users u
      LEFT JOIN patient_profiles p ON u.id = p.user_id
      ORDER BY u.created_at DESC
    `;
    const usersRes = await pool.query(query);
    res.json(createSuccessResponse({ users: usersRes.rows }, crypto.randomUUID()));
  } catch (err) {
    console.error('Admin getUsers error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const createUser = async (req: any, res: any) => {
  const { email, password, role, firstName, lastName, dateOfBirth, gender } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Missing required fields: email, password, role' });
  }

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    await pool.query('BEGIN');
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    const userRes = await pool.query(
      `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role, created_at`,
      [email, passwordHash, role]
    );
    const userId = userRes.rows[0].id;

    if (firstName && lastName) {
      await pool.query(
        `INSERT INTO patient_profiles (user_id, first_name, last_name, date_of_birth, gender) VALUES ($1, $2, $3, $4, $5)`,
        [userId, firstName, lastName, dateOfBirth || '1990-01-01', gender || 'unspecified']
      );
    }

    if (role === 'patient') {
      await pool.query(
        `INSERT INTO patient_twins (patient_id, version, state, clinical_history, snapshots) VALUES ($1, 1, '{}', '[]', '[]')`,
        [userId]
      );
    }

    await pool.query('COMMIT');
    res.json(createSuccessResponse({ user: userRes.rows[0] }, crypto.randomUUID()));
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Admin createUser error:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

export const getAuditLogs = async (req: any, res: any) => {
  try {
    const logsRes = await pool.query(
      `SELECT a.*, u.email as user_email FROM audit_log a LEFT JOIN users u ON a.user_id = u.id ORDER BY a.created_at DESC LIMIT 100`
    );
    res.json(createSuccessResponse({ logs: logsRes.rows }, crypto.randomUUID()));
  } catch (err) {
    console.error('Admin getAuditLogs error:', err);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
};

export const getSystemMetrics = async (req: any, res: any) => {
  try {
    const userCount = await pool.query('SELECT COUNT(*) as count FROM users');
    const twinCount = await pool.query('SELECT COUNT(*) as count FROM patient_twins');
    const assessmentCount = await pool.query('SELECT COUNT(*) as count FROM health_assessments');
    const medCount = await pool.query('SELECT COUNT(*) as count FROM medications');
    const carePlanCount = await pool.query('SELECT COUNT(*) as count FROM care_plans');

    const metrics = {
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      db: {
        users: Number(userCount.rows[0]?.count || 0),
        twins: Number(twinCount.rows[0]?.count || 0),
        assessments: Number(assessmentCount.rows[0]?.count || 0),
        medications: Number(medCount.rows[0]?.count || 0),
        carePlans: Number(carePlanCount.rows[0]?.count || 0)
      }
    };

    res.json(createSuccessResponse(metrics, crypto.randomUUID()));
  } catch (err) {
    console.error('Admin getSystemMetrics error:', err);
    res.status(500).json({ error: 'Failed to fetch system metrics' });
  }
};

export const getHOIPDashboard = async (req: any, res: any) => {
  try {
    const dashboard = await hoip.getOperationalDashboard();
    res.json(createSuccessResponse(dashboard, crypto.randomUUID()));
  } catch (err) {
    console.error('Admin getHOIPDashboard error:', err);
    res.status(500).json({ error: 'Failed to fetch HOIP operational dashboard' });
  }
};
