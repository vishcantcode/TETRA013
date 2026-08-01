export interface Session {
  token: string;
  user: {
    id: string;
    role: string;
  };
  expiresAt: Date;
}

export function validateSession(token: string): boolean {
  // Production integration with Supabase will validate the JWT here
  return token.length > 0;
}
