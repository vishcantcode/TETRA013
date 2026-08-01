// ============================================================================
// HEHCP – Capability 4: Connectivity Resilience Services
// ============================================================================

import { CircuitBreakerStatus, CircuitBreakerState } from './types';

export class HEHCPConnectivityResilienceServices {
  private circuitBreakers: Map<string, CircuitBreakerStatus> = new Map();
  private offlineBuffer: Map<string, any[]> = new Map();

  public getCircuitBreaker(connectorId: string): CircuitBreakerStatus {
    const existing = this.circuitBreakers.get(connectorId);
    if (existing) return existing;

    const initial: CircuitBreakerStatus = {
      connectorId,
      state: 'CLOSED',
      failureCount: 0,
    };
    this.circuitBreakers.set(connectorId, initial);
    return initial;
  }

  public recordSuccess(connectorId: string): void {
    const cb = this.getCircuitBreaker(connectorId);
    cb.failureCount = 0;
    cb.state = 'CLOSED';
    this.circuitBreakers.set(connectorId, cb);
  }

  public recordFailure(connectorId: string, threshold = 3): CircuitBreakerStatus {
    const cb = this.getCircuitBreaker(connectorId);
    cb.failureCount++;
    cb.lastFailureAt = new Date();

    if (cb.failureCount >= threshold) {
      cb.state = 'OPEN';
      cb.nextAttemptAllowedAt = new Date(Date.now() + 30000); // 30 second cooldown
    }

    this.circuitBreakers.set(connectorId, cb);
    return cb;
  }

  public bufferOfflinePayload(connectorId: string, payload: any): void {
    const buffer = this.offlineBuffer.get(connectorId) || [];
    buffer.push(payload);
    this.offlineBuffer.set(connectorId, buffer);
  }

  public getOfflineBufferDepth(connectorId: string): number {
    return (this.offlineBuffer.get(connectorId) || []).length;
  }
}
