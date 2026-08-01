import { Request, Response, NextFunction } from 'express';
import { ActiveContext } from '@healthsense/clinical-knowledge-fabric';

export const ckfContextMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Extract explicit historical date for replay testing, or default to now
  const requestedDate = req.headers['x-healthsense-context-date'] as string;
  const contextDate = requestedDate ? new Date(requestedDate) : new Date();

  const context = {
    contextDate,
    patientId: req.body?.patientId || req.query?.patientId as string,
    workflowId: req.headers['x-workflow-id'] as string
  };

  ActiveContext.run(context, () => {
    next();
  });
};
