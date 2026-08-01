export interface PerformanceLogEntry {
  eventName: string;
  durationMs: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

export class ClientLogger {
  private static logs: PerformanceLogEntry[] = [];

  public static logPerformance(eventName: string, durationMs: number, metadata?: Record<string, any>): void {
    const entry: PerformanceLogEntry = {
      eventName,
      durationMs,
      timestamp: new Date().toISOString(),
      metadata
    };
    ClientLogger.logs.push(entry);
    console.log(`[HealthSense Client Logger] ${eventName}: ${durationMs}ms`, metadata || '');
  }

  public static logError(context: string, error: any): void {
    console.error(`[HealthSense Client Error] ${context}:`, error);
  }

  public static getMemoryUsage(): string {
    if ('memory' in performance) {
      const mem = (performance as any).memory;
      return `${Math.round(mem.usedJSHeapSize / 1048576)} MB / ${Math.round(mem.jsHeapSizeLimit / 1048576)} MB`;
    }
    return 'Memory API unavailable';
  }

  public static getLogs(): PerformanceLogEntry[] {
    return [...ClientLogger.logs];
  }
}
