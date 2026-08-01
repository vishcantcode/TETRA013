import { createSuccessResponse } from '../response';
import { generateJWT } from '@healthsense/auth';
import { pool } from '@healthsense/db';
import crypto from 'crypto';

export const register = async (req: any, res: any) => {
  const { email, password, firstName, lastName, dateOfBirth, gender } = req.body;
  if (!email || !password || !firstName || !lastName || !dateOfBirth || !gender) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    await pool.query('BEGIN');
    
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    
    const userRes = await pool.query(
      `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'patient') RETURNING id`,
      [email, passwordHash]
    );
    const userId = userRes.rows[0].id;

    await pool.query(
      `INSERT INTO patient_profiles (user_id, first_name, last_name, date_of_birth, gender) VALUES ($1, $2, $3, $4, $5)`,
      [userId, firstName, lastName, dateOfBirth, gender]
    );

    await pool.query(
      `INSERT INTO patient_twins (patient_id, version, state, clinical_history, snapshots) VALUES ($1, 1, '{}', '[]', '[]')`,
      [userId]
    );

    await pool.query('COMMIT');

    const token = generateJWT({ id: userId, role: 'patient', email });
    res.json(createSuccessResponse({ token, user: { id: userId, email, role: 'patient' } }, crypto.randomUUID()));
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
};

export const login = async (req: any, res: any) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing credentials' });
  }

  try {
    const userRes = await pool.query('SELECT id, role, password_hash FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = userRes.rows[0];
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    
    if (user.password_hash !== passwordHash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = generateJWT({ id: user.id, role: user.role, email });
    res.json(createSuccessResponse({ token, user: { id: user.id, email, role: user.role } }, crypto.randomUUID()));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error during login' });
  }
};

export const getCurrentUser = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const userRes = await pool.query('SELECT id, email, role FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const profileRes = await pool.query('SELECT * FROM patient_profiles WHERE user_id = $1', [userId]);
    
    res.json(createSuccessResponse({ 
      user: userRes.rows[0], 
      profile: profileRes.rows[0] || null 
    }, crypto.randomUUID()));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error fetching user' });
  }
};
