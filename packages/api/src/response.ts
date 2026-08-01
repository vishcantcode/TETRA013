export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata: {
    correlationId: string;
    timestamp: string;
    durationMs?: number;
  };
}

export function createSuccessResponse<T>(data: T, correlationId: string, durationMs?: number): ApiResponse<T> {
  return {
    success: true,
    data,
    metadata: {
      correlationId,
      timestamp: new Date().toISOString(),
      durationMs
    }
  };
}

export function createErrorResponse(code: string, message: string, correlationId: string, details?: any): ApiResponse<null> {
  return {
    success: false,
    error: { code, message, details },
    metadata: {
      correlationId,
      timestamp: new Date().toISOString()
    }
  };
}
