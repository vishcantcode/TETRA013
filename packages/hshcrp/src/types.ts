// ============================================================================
// HSHCRP – Security Hardening & Compliance Readiness Platform
// Shared Types & Interfaces
// ============================================================================

export type SecurityPostureCategory =
  | 'AUTHENTICATION'
  | 'AUTHORIZATION'
  | 'DATA_ENCRYPTION'
  | 'API_SECURITY'
  | 'AUDIT_TRAIL'
  | 'VULNERABILITY_MANAGEMENT';

export interface SecurityHealthReport {
  overallPostureStatus: 'HEALTHY' | 'NEEDS_ATTENTION' | 'COMPROMISED';
  activeThreatsCount: number;
  blockedAbuseAttemptsCount: number;
  lastKeyRotationAt: Date;
  categories: { name: SecurityPostureCategory; status: 'PASS' | 'WARN' | 'FAIL'; score: number }[];
}

export interface EncryptedPayload {
  cipherText: string;
  algorithm: 'AES-256-GCM';
  iv: string;
  authTag: string;
  encryptedAt: Date;
}

export interface KeyRotationStatus {
  keyId: string;
  algorithm: string;
  active: boolean;
  rotatedAt: Date;
  nextRotationDue: Date;
}

export interface SanitizationResult {
  rawInput: string;
  sanitizedInput: string;
  threatsDetected: ('XSS' | 'SQLI' | 'NOSQLI' | 'PATH_TRAVERSAL')[];
  clean: boolean;
}

export interface SecurityHeadersConfig {
  hstsEnabled: boolean; // Strict-Transport-Security
  contentSecurityPolicy: string;
  xFrameOptions: 'DENY' | 'SAMEORIGIN';
  xContentTypeOptions: 'nosniff';
  referrerPolicy: string;
}

export type ScanSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface VulnerabilityScanItem {
  vulnerabilityId: string;
  component: string;
  severity: ScanSeverity;
  title: string;
  remediationGuidance: string;
  cveId?: string;
}

export interface HIPAAAuditLogEntry {
  logId: string;
  timestamp: Date;
  actorId: string;
  actorRole: string;
  action: 'READ' | 'WRITE' | 'EXPORT' | 'DELETE' | 'AUTHENTICATE' | 'OVERRIDE';
  targetResource: string;
  phiAccessed: boolean;
  ipAddress: string;
  checksum: string;
}

export interface SecurityDashboardView {
  platformSecurityScore: number; // 0 - 100
  hipaaComplianceReadinessPercent: number;
  soc2ReadinessPercent: number;
  activeVulnerabilitiesCount: number;
  recentSecurityEventsCount: number;
  encryptedDataPercent: number;
  securityHealthReport: SecurityHealthReport;
  securityHeaders: SecurityHeadersConfig;
  generatedAt: Date;
}
