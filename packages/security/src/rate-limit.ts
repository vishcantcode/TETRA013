export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export function createRateLimiter(config: RateLimitConfig) {
  return (req: any, res: any, next: any) => {
    // Basic rate limit structure
    next();
  };
}
