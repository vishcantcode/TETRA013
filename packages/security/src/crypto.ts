import crypto from 'crypto';

export function hashString(input: string): string {
  // Use a secure hashing algorithm with a salt if needed, but for general string hashing:
  return crypto.createHash('sha256').update(input).digest('hex');
}

export function generateSalt(length = 16): string {
  return crypto.randomBytes(length).toString('hex');
}

