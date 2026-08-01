export const securityMiddleware = (req: any, res: any, next: Function) => {
  // Basic security headers (Helmet-lite)
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Extremely basic request size validation
  const contentLength = parseInt(req.headers['content-length'] || '0', 10);
  if (contentLength > 1024 * 1024) { // 1MB limit
    return res.status(413).json({ error: 'Payload Too Large' });
  }

  // Basic SQL Injection prevention (sanitization placeholder)
  // In a real app, use parameterized queries (which we do with `pg`), but this is Defense in Depth
  if (req.body && typeof req.body === 'object') {
    const stringified = JSON.stringify(req.body);
    if (stringified.includes('DROP TABLE') || stringified.includes('OR 1=1')) {
      return res.status(403).json({ error: 'Potential malicious payload detected.' });
    }
  }

  next();
};

const rateLimitStore = new Map<string, { count: number, resetTime: number }>();

export const rateLimiter = (req: any, res: any, next: Function) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 100;

  let record = rateLimitStore.get(ip);
  
  if (!record || now > record.resetTime) {
    record = { count: 0, resetTime: now + windowMs };
  }

  record.count++;
  rateLimitStore.set(ip, record);

  if (record.count > maxRequests) {
    return res.status(429).json({ error: 'Too Many Requests', retryAfter: record.resetTime - now });
  }

  next();
};
