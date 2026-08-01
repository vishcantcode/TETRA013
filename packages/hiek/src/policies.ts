export interface HIEKExecutionPolicy {
  maxRetries?: number;
  initialBackoffMs?: number;
  maxBackoffMs?: number;
  timeoutMs?: number;
  circuitBreakerThreshold?: number;
}

export const DEFAULT_HIEK_POLICY: Required<HIEKExecutionPolicy> = {
  maxRetries: 3,
  initialBackoffMs: 100,
  maxBackoffMs: 2000,
  timeoutMs: 10000,
  circuitBreakerThreshold: 5
};

export class HIEKPolicyRunner {
  public static async executeWithPolicy<T>(
    fn: () => Promise<T>,
    policyConfig: HIEKExecutionPolicy = {}
  ): Promise<{ result: T; attempts: number }> {
    const policy = { ...DEFAULT_HIEK_POLICY, ...policyConfig };
    let attempt = 0;
    let lastError: any = null;

    while (attempt <= policy.maxRetries) {
      attempt++;
      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error(`Execution timed out after ${policy.timeoutMs}ms`)), policy.timeoutMs);
        });

        const result = await Promise.race([fn(), timeoutPromise]);
        return { result, attempts: attempt };
      } catch (err: any) {
        lastError = err;
        if (attempt > policy.maxRetries) {
          break;
        }
        const backoffMs = Math.min(policy.initialBackoffMs * Math.pow(2, attempt - 1), policy.maxBackoffMs);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      }
    }

    throw lastError || new Error('Execution failed policy constraints');
  }
}
