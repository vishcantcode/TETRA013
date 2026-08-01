// ============================================================================
// HLEMP – Legacy & Enterprise Messaging Platform
// Shared HL7 v2 & Messaging Types
// ============================================================================

import { FHIRResource } from '@healthsense/hhif';

export type HL7MessageType = 'ADT' | 'ORM' | 'ORU' | 'SIU' | 'MDM' | 'DFT' | 'ACK';

export interface HL7Segment {
  name: string; // e.g. "MSH", "PID", "PV1", "OBR", "OBX", "MSA"
  fields: string[];
}

export interface HL7ParsedMessage {
  rawMessage: string;
  messageType: HL7MessageType;
  triggerEvent: string; // e.g. "A01", "O01", "R01"
  controlId: string;
  version: string; // e.g. "2.3", "2.5"
  sendingApplication: string;
  sendingFacility: string;
  receivingApplication: string;
  receivingFacility: string;
  timestamp: string;
  segments: HL7Segment[];
}

export type HL7AckCode = 'AA' | 'AE' | 'AR'; // Application Accept, Application Error, Application Reject

export interface HL7AckMessage {
  ackCode: HL7AckCode;
  textMessage: string;
  controlId: string;
  rawAck: string;
}

export type HL7ProcessingState =
  | 'RECEIVED'
  | 'PARSED'
  | 'VALIDATED'
  | 'TRANSFORMED'
  | 'ROUTED'
  | 'ACKNOWLEDGED'
  | 'FAILED'
  | 'RETRYING'
  | 'DEAD_LETTER';

export interface HL7MessageLifecycleRecord {
  messageId: string;
  controlId: string;
  messageType: HL7MessageType;
  triggerEvent: string;
  currentState: HL7ProcessingState;
  stateHistory: { state: HL7ProcessingState; timestamp: Date; notes?: string }[];
  retriesAttempted: number;
  maxRetriesAllowed: number;
  originatingSystem: string;
  targetSystem: string;
  receivedAt: Date;
  updatedAt: Date;
}

export interface HL7ValidationError {
  segmentName: string;
  fieldIndex: number;
  message: string;
  severity: 'ERROR' | 'WARNING';
}

export interface HL7ValidationReport {
  isValid: boolean;
  messageType: string;
  controlId: string;
  errors: HL7ValidationError[];
  warnings: HL7ValidationError[];
}

export interface HL7TransformationResult {
  sourceHL7ControlId: string;
  fhirResources: FHIRResource[];
  conversionSuccess: boolean;
  semanticLossNotes: string[];
}

export type ConnectorSystemType = 'HIS' | 'LIS' | 'RIS' | 'PHARMACY' | 'BILLING';

export interface HL7ConnectorConfig {
  connectorId: string;
  connectorName: string;
  systemType: ConnectorSystemType;
  endpointUrl: string;
  protocol: 'MLLP' | 'HTTP_REST' | 'SFTP';
  supportedMessageTypes: HL7MessageType[];
  active: boolean;
}

export interface HL7DeadLetterEntry {
  deadLetterId: string;
  messageId: string;
  rawMessage: string;
  failureReason: string;
  failedAt: Date;
  operatorNotes?: string;
  status: 'PENDING_REVIEW' | 'REPROCESSED' | 'DISCARDED';
}
