import { createSuccessResponse, createErrorResponse } from '../response';

export const withObservability = (handler: Function) => {
  return async (req: any, res: any) => {
    const start = performance.now();
    const correlationId = req.headers['x-correlation-id'] || crypto.randomUUID();
    req.correlationId = correlationId;

    try {
      const result = await handler(req, res);
      const durationMs = performance.now() - start;
      
      if (!res.headersSent) {
        res.json(createSuccessResponse(result, correlationId, durationMs));
      }
    } catch (error: any) {
      const durationMs = performance.now() - start;
      console.error(`[API ERROR] ${correlationId} - ${error.message}`);
      
      if (!res.headersSent) {
        res.status(500).json(createErrorResponse('INTERNAL_SERVER_ERROR', error.message, correlationId));
      }
    }
  };
};
