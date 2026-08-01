import { Response } from 'express';

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

export function createSuccessResponse<T>(data: T, correlationId: string = 'req-1', durationMs?: number): ApiResponse<T> {
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

export function createErrorResponse(code: string, message: string, correlationId: string = 'req-1', details?: any): ApiResponse<null> {
  return {
    success: false,
    error: { code, message, details },
    metadata: {
      correlationId,
      timestamp: new Date().toISOString()
    }
  };
}

export function sendSuccess<T>(res: Response, data: T, status = 200) {
  return res.status(status).json(createSuccessResponse(data));
}

export function sendError(res: Response, status = 400, code: string, message: string, details?: any) {
  return res.status(status).json(createErrorResponse(code, message, 'req-1', details));
}
