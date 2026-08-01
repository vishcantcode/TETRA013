// ============================================================================
// HSHCRP – Platform Orchestrator
//
// Single entry point orchestrating Security Posture Management, Data Protection,
// Application Security, Audit & Compliance Extensions, Vulnerability Assessment,
// Security Testing Simulator, Security Operations Dashboard, and HOIP telemetry.
// ============================================================================

import {
  SecurityDashboardView,
  EncryptedPayload,
  KeyRotationStatus,
  SanitizationResult,
  HIPAAAuditLogEntry,
  VulnerabilityScanItem,
} from './types';
import { HSHCRPSecurityPostureEngine } from './security-posture';
import { HSHCRPDataProtectionEngine } from './data-protection';
import { HSHCRPApplicationSecurityFramework } from './app-security';
import { HSHCRPAuditComplianceExtensions } from './audit-compliance';
import { HSHCRPVulnerabilityAssessmentFramework } from './vulnerability-assessment';
import { HSHCRPSecurityTestingSimulator } from './security-testing';
import { HSHCRPSecurityDashboardEngine } from './security-dashboard';

/** Concrete return shape of HSHCRPVulnerabilityAssessmentFramework.runVulnerabilityScan(). */
export interface VulnerabilityScanResult {
  scanCompletedAt: Date;
  vulnerabilities: VulnerabilityScanItem[];
  criticalCount: number;
  highCount: number;
}

/** Concrete return shape of HSHCRPSecurityTestingSimulator.runSecurityTestSuite(). */
export interface SecurityTestSuiteResult {
  authzBoundaryPass: boolean;
  pluginSandboxIsolationPass: boolean;
  csrfProtectionPass: boolean;
  apiAbuseDetectionPass: boolean;
}

/** Full result of a security hardening & compliance readiness session. */
export interface SecuritySessionResult {
  securityDashboard: SecurityDashboardView;
  encryptedPayload: EncryptedPayload;
  decryptedPHI: string;
  keyRotation: KeyRotationStatus;
  sanitizationResult: SanitizationResult;
  auditLogEntry: HIPAAAuditLogEntry;
  vulnerabilityScan: VulnerabilityScanResult;
  testSuiteResult: SecurityTestSuiteResult;
  telemetryPublished: boolean;
  latencyMs: number;
}

export class HSHCRPPlatform {
  private postureEngine = new HSHCRPSecurityPostureEngine();
  private dataProtectionEngine = new HSHCRPDataProtectionEngine();
  private appSecFramework = new HSHCRPApplicationSecurityFramework();
  private auditComplianceExtensions = new HSHCRPAuditComplianceExtensions();
  private vulnFramework = new HSHCRPVulnerabilityAssessmentFramework();
  private testingSimulator = new HSHCRPSecurityTestingSimulator();
  private dashboardEngine = new HSHCRPSecurityDashboardEngine();

  // Internal telemetry
  private telemetry = {
    totalSecurityEvaluations: 0,
    totalEncryptedPayloads: 0,
    totalAuditLogsRecorded: 0,
    totalVulnerabilityScans: 0,
    totalThreatsSanitized: 0,
    totalLatencyMs: 0,
  };

  /**
   * Execute full Security Hardening & Compliance Readiness Session.
   */
  public executeSecuritySession(
    samplePHI = 'Patient SSN: 000-12-3456, Diagnosis: Decompensated Heart Failure',
    sampleInput = '<script>alert("xss")</script>SELECT * FROM patients WHERE name=\'John\''
  ): SecuritySessionResult {
    const start = performance.now();

    // 1. Build Security Operations Dashboard View
    const securityDashboard = this.dashboardEngine.buildSecurityDashboardView();

    // 2. Test Data Protection & AES-256-GCM Encryption
    const encryptedPayload = this.dataProtectionEngine.encryptPHI(samplePHI);
    const decryptedPHI = this.dataProtectionEngine.decryptPHI(encryptedPayload);

    // 3. KMS Key Rotation Hook
    const keyRotation = this.dataProtectionEngine.rotateMasterKey();

    // 4. Input Sanitization & Threat Neutralization
    const sanitizationResult = this.appSecFramework.sanitizeInput(sampleInput);

    // 5. Immutable HIPAA Audit Log Entry with SHA-256 Checksum
    const auditLogEntry = this.auditComplianceExtensions.logAuditEntry(
      'usr-dr-jenkins',
      'PHYSICIAN',
      'READ',
      'Patient/pt-hshcrp-9001',
      true,
      '10.0.4.12'
    );

    // 6. Vulnerability Assessment Scan
    const vulnerabilityScan = this.vulnFramework.runVulnerabilityScan();

    // 7. Security Testing Simulator
    const testSuiteResult = this.testingSimulator.runSecurityTestSuite();

    const latencyMs = parseFloat((performance.now() - start).toFixed(3));

    // 8. Update Telemetry
    this.updateTelemetry(1, 1, 1, 1, sanitizationResult.threatsDetected.length, latencyMs);

    return {
      securityDashboard,
      encryptedPayload,
      decryptedPHI,
      keyRotation,
      sanitizationResult,
      auditLogEntry,
      vulnerabilityScan,
      testSuiteResult,
      telemetryPublished: true,
      latencyMs,
    };
  }

  public getPostureEngine(): HSHCRPSecurityPostureEngine {
    return this.postureEngine;
  }

  public getDataProtectionEngine(): HSHCRPDataProtectionEngine {
    return this.dataProtectionEngine;
  }

  public getAppSecFramework(): HSHCRPApplicationSecurityFramework {
    return this.appSecFramework;
  }

  public getAuditComplianceExtensions(): HSHCRPAuditComplianceExtensions {
    return this.auditComplianceExtensions;
  }

  public getVulnFramework(): HSHCRPVulnerabilityAssessmentFramework {
    return this.vulnFramework;
  }

  public getTestingSimulator(): HSHCRPSecurityTestingSimulator {
    return this.testingSimulator;
  }

  public getDashboardEngine(): HSHCRPSecurityDashboardEngine {
    return this.dashboardEngine;
  }

  private updateTelemetry(
    evalCount: number,
    encCount: number,
    auditCount: number,
    scanCount: number,
    threatsCount: number,
    latency: number
  ): void {
    this.telemetry.totalSecurityEvaluations += evalCount;
    this.telemetry.totalEncryptedPayloads += encCount;
    this.telemetry.totalAuditLogsRecorded += auditCount;
    this.telemetry.totalVulnerabilityScans += scanCount;
    this.telemetry.totalThreatsSanitized += threatsCount;
    this.telemetry.totalLatencyMs += latency;
  }

  public getTelemetry() {
    return {
      ...this.telemetry,
      averageLatencyMs:
        this.telemetry.totalSecurityEvaluations > 0
          ? parseFloat((this.telemetry.totalLatencyMs / this.telemetry.totalSecurityEvaluations).toFixed(3))
          : 0,
    };
  }
}

export const hshcrp = new HSHCRPPlatform();
