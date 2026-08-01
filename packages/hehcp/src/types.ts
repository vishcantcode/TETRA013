// ============================================================================
// HEHCP – Enterprise Hospital Connectivity Platform
// Shared Enterprise Connectivity Types & Interfaces
// ============================================================================

export type EnterpriseSystemType =
  | 'EHR'
  | 'HIS'
  | 'LIS'
  | 'RIS'
  | 'PACS'
  | 'PHARMACY'
  | 'SCHEDULING'
  | 'BILLING'
  | 'NOTIFICATION';

export type ConnectorState = 'CONNECTED' | 'DISCONNECTED' | 'PAUSED' | 'ERROR' | 'DEGRADED';

export interface EnterpriseConnectorConfig {
  connectorId: string;
  name: string;
  systemType: EnterpriseSystemType;
  endpointUrl: string;
  authStrategy: 'OAUTH2' | 'MTLS' | 'API_KEY' | 'BASIC';
  retryAttempts: number;
  timeoutMs: number;
  circuitBreakerThreshold: number;
  active: boolean;
}

export interface ConnectorHealthCheck {
  connectorId: string;
  state: ConnectorState;
  latencyMs: number;
  lastPing: Date;
  uptimePercent: number;
}

export type EnterpriseEventType =
  | 'ADMISSION'
  | 'DISCHARGE'
  | 'LAB_RESULT'
  | 'IMAGING_AVAILABLE'
  | 'MEDICATION_UPDATE'
  | 'APPOINTMENT_CHANGE'
  | 'CARE_PLAN_UPDATE'
  | 'CLINICIAN_ACTION';

export interface EnterpriseEventPayload {
  eventId: string;
  eventType: EnterpriseEventType;
  sourceSystem: EnterpriseSystemType;
  patientId: string;
  encounterId?: string;
  data: Record<string, any>;
  timestamp: Date;
  idempotencyKey: string;
}

export interface SynchronizationRecord {
  syncId: string;
  entityType: 'PATIENT' | 'ENCOUNTER' | 'LAB_RESULT' | 'IMAGING' | 'MEDICATION' | 'APPOINTMENT' | 'CARE_PLAN';
  patientId: string;
  sourceVersion: string;
  healthsenseVersion: string;
  syncedAt: Date;
  status: 'IN_SYNC' | 'PENDING' | 'RECONCILED' | 'CONFLICT';
}

export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerStatus {
  connectorId: string;
  state: CircuitBreakerState;
  failureCount: number;
  lastFailureAt?: Date;
  nextAttemptAllowedAt?: Date;
}

export interface ReconciliationReport {
  reconciliationId: string;
  patientId: string;
  totalRecordsChecked: number;
  inconsistenciesFound: number;
  conflicts: {
    field: string;
    externalValue: any;
    healthsenseValue: any;
    resolution: 'EXTERNAL_PREVAILS' | 'HEALTHSENSE_PREVAILS' | 'MANUAL_REVIEW';
  }[];
  integrityStatus: 'VERIFIED' | 'NEEDS_RECONCILIATION';
  timestamp: Date;
}

export interface OperationalDashboardMetrics {
  activeConnectorsCount: number;
  systemStates: { system: EnterpriseSystemType; state: ConnectorState }[];
  queueDepth: number;
  averageProcessingLatencyMs: number;
  eventThroughputPerMinute: number;
  retrySuccessRatePercent: number;
  deadLetterCount: number;
  reconciliationIntegrityPercent: number;
}
