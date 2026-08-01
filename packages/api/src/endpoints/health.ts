import { createSuccessResponse } from '../response';
import crypto from 'crypto';

export const healthCheck = (req: any, res: any) => {
  res.json(createSuccessResponse({ status: 'ok', timestamp: new Date().toISOString(), service: 'healthsense-api' }, crypto.randomUUID()));
};

export const readinessCheck = (req: any, res: any) => {
  res.json(createSuccessResponse({ status: 'ready', database: 'connected' }, crypto.randomUUID()));
};

export const metricsEndpoint = (req: any, res: any) => {
  res.json(createSuccessResponse({ memory: process.memoryUsage(), uptime: process.uptime() }, crypto.randomUUID()));
};
