import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

export interface JWTPayload {
  id: string;
  role: string;
  email?: string;
  iat?: number;
  exp?: number;
}

export function generateJWT(payload: { id: string; role: string; email?: string }): string {
  return jwt.sign(payload, SECRET, { expiresIn: '24h' });
}

export function validateJWT(token: string): boolean {
  try {
    jwt.verify(token, SECRET);
    return true;
  } catch {
    return false;
  }
}

export function decodeJWT(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, SECRET) as JWTPayload;
  } catch {
    return null;
  }
}
