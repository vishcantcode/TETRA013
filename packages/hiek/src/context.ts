import crypto from 'node:crypto';

export interface HIEKUserContext {
  id: string;
  email: string;
  role: 'patient' | 'clinician' | 'admin';
}

export interface HIEKContext {
  executionId: string;
  correlationId: string;
  user: HIEKUserContext | null;
  patientId: string | null;
  tenantId: string;
  featureFlags: Record<string, boolean>;
  permissions: string[];
  locale: string;
  timezone: string;
  traceParent?: string;
  requestMetadata: Record<string, any>;
  createdAt: Date;
}

export function createHIEKContext(options: {
  user?: HIEKUserContext | null;
  patientId?: string | null;
  correlationId?: string;
  tenantId?: string;
  featureFlags?: Record<string, boolean>;
  permissions?: string[];
  locale?: string;
  timezone?: string;
  requestMetadata?: Record<string, any>;
} = {}): HIEKContext {
  return {
    executionId: crypto.randomUUID(),
    correlationId: options.correlationId || crypto.randomUUID(),
    user: options.user || null,
    patientId: options.patientId || options.user?.id || null,
    tenantId: options.tenantId || 'default-pilot-tenant',
    featureFlags: options.featureFlags || { hiekKernelEnabled: true, deterministicReplayEnabled: true },
    permissions: options.permissions || (options.user ? [options.user.role] : []),
    locale: options.locale || 'en-US',
    timezone: options.timezone || 'UTC',
    requestMetadata: options.requestMetadata || {},
    createdAt: new Date()
  };
}
