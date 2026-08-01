import { decodeJWT } from './jwt';
import crypto from 'crypto';

export function authMiddleware(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Missing or invalid authorization header' }, metadata: { correlationId: crypto.randomUUID(), timestamp: new Date().toISOString() } });
  }

  const token = authHeader.substring(7); // Remove 'Bearer '
  const payload = decodeJWT(token);
  
  if (!payload) {
    return res.status(401).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Token is invalid or expired' }, metadata: { correlationId: crypto.randomUUID(), timestamp: new Date().toISOString() } });
  }

  req.user = { id: payload.id, role: payload.role, email: payload.email };
  next();
}

export function requireRole(...roles: string[]) {
  return (req: any, res: any, next: any) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' }, metadata: { correlationId: crypto.randomUUID(), timestamp: new Date().toISOString() } });
    }
    next();
  };
}
