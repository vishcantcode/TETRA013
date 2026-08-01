import { createSuccessResponse } from '../response';
import { pool } from '@healthsense/db';
import crypto from 'crypto';

export const getProfile = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const profileRes = await pool.query('SELECT * FROM patient_profiles WHERE user_id = $1', [userId]);
    const twinRes = await pool.query('SELECT * FROM patient_twins WHERE patient_id = $1', [userId]);
    
    res.json(createSuccessResponse({ 
      profile: profileRes.rows[0] || null,
      twinSummary: twinRes.rows[0] ? twinRes.rows[0].state : null
    }, crypto.randomUUID()));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error fetching profile' });
  }
};

export const updateProfile = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { first_name, last_name, date_of_birth, gender } = req.body;
    
    const updatedRes = await pool.query(
      `UPDATE patient_profiles 
       SET first_name = COALESCE($2, first_name), 
           last_name = COALESCE($3, last_name), 
           date_of_birth = COALESCE($4, date_of_birth), 
           gender = COALESCE($5, gender), 
           updated_at = NOW() 
       WHERE user_id = $1 RETURNING *`,
      [userId, first_name, last_name, date_of_birth, gender]
    );
    
    res.json(createSuccessResponse({ profile: updatedRes.rows[0] }, crypto.randomUUID()));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error updating profile' });
  }
};
