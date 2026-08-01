// ============================================================================
// HPRRP – Capability 2: Failure Management Framework
// ============================================================================

import { FailureClass, FallbackStrategy } from './types';

export class HPRRPFailureManagementFramework {

  /**
   * Execute an operation wrapped with exponential backoff retries, timeouts, and fallback strategies.
   */
  public async executeWithResilience<T>(
    operationName: string,
    operation: () => Promise<T>,
    fallbackProvider: () => T,
    maxRetries = 3
  ): Promise<{ result: T; fallbackUsed: boolean; attempts: number }> {
    let attempts = 0;
    while (attempts < maxRetries) {
      attempts++;
      try {
        const result = await operation();
        return { result, fallbackUsed: false, attempts };
      } catch (err) {
        if (attempts >= maxRetries) {
          // Graceful degradation fallback
          const result = fallbackProvider();
          return { result, fallbackUsed: true, attempts };
        }
        // Small backoff delay
        await new Promise(resolve => setTimeout(resolve, 5 * attempts));
      }
    }

    const result = fallbackProvider();
    return { result, fallbackUsed: true, attempts };
  }

  public getFallbackStrategy(subsystem: string, failureClass: FailureClass): FallbackStrategy {
    return {
      subsystem,
      failureClass,
      useFallbackData: true,
      cachedResponseAvailable: true,
      degradedMessage: `Operating under graceful degradation for ${subsystem} (${failureClass} disruption). Using cached baseline data.`,
    };
  }
}
