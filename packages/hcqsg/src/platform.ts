// ============================================================================
// HCQSG – Platform Orchestrator
//
// Single entry point orchestrating all 8 Clinical Quality, Safety & Governance
// capabilities.
// Integrates with HCKEP, HCPI, HCOP, HPIE, HUSE, AIR, HIEK, HOIP, ACDSS, HPPHI, HPPM, HCSOF, and HECIT.
// ============================================================================

import crypto from 'node:crypto';

import { HCQSGEvaluationResult } from './types';
import { HCQSGQualityScoringEngine } from './quality-scoring';
import { HCQSGGuidelineComplianceValidator } from './guideline-compliance';
import { HCQSGSafetyValidationFramework } from './safety-validation';
import { HCQSGContinuousValidationServices } from './continuous-validation';
import { HCQSGGovernanceDashboardEngine } from './governance-dashboard';
import { HCQSGClinicalKPIEngine } from './clinical-kpi';
import { HCQSGVersioningEngine } from './recommendation-versioning';
import { HCQSGEnterpriseAuditEngine } from './enterprise-audit';
import { HPPMCareProfile } from '@healthsense/hppm';
import { hckep } from '@healthsense/hckep';

export class HCQSGPlatform {
  private qualityScoringEngine = new HCQSGQualityScoringEngine();
  private complianceValidator = new HCQSGGuidelineComplianceValidator();
  private safetyValidationFramework = new HCQSGSafetyValidationFramework();
  private continuousValidationServices = new HCQSGContinuousValidationServices();
  private governanceDashboardEngine = new HCQSGGovernanceDashboardEngine();
  private clinicalKPIEngine = new HCQSGClinicalKPIEngine();
  private versioningEngine = new HCQSGVersioningEngine();
  private enterpriseAuditEngine = new HCQSGEnterpriseAuditEngine();

  // Internal telemetry
  private telemetry = {
    totalEvaluations: 0,
    totalQualityScoresGenerated: 0,
    totalSafetyValidations: 0,
    totalComplianceChecks: 0,
    totalEnterpriseReports: 0,
    totalLatencyMs: 0,
  };

  /**
   * Perform comprehensive Quality, Safety & Governance validation for a patient recommendation.
   */
  public evaluateGovernance(
    profile: HPPMCareProfile,
    evidenceStrength: 'HIGH' | 'MODERATE' | 'LOW' = 'HIGH',
    confidenceScore: number = 0.92
  ): HCQSGEvaluationResult {
    const start = performance.now();
    const evaluationId = `hcqsg-${crypto.randomUUID().slice(0, 8)}`;

    // ── 1. Quality Scoring ──
    const qualityScore = this.qualityScoringEngine.computeQualityScore(profile, evidenceStrength, confidenceScore);

    // ── 2. Guideline Compliance Validation ──
    const complianceReport = this.complianceValidator.validateCompliance(profile);

    // ── 3. Safety Validation Framework ──
    const safetyValidation = this.safetyValidationFramework.validateSafety(profile);

    // ── 4. Continuous Validation Services ──
    const continuousValidation = this.continuousValidationServices.validateContinuously(profile);

    // ── 5. Governance Dashboard Data ──
    const governanceDashboard = this.governanceDashboardEngine.generateDashboardData();

    // ── 6. Clinical KPIs ──
    const clinicalKPIs = this.clinicalKPIEngine.computeKPIs(profile);

    // ── 7. Version Metadata ──
    const versionMetadata = this.versioningEngine.generateVersionMetadata();

    // ── 8. Enterprise Audit Report ──
    const enterpriseReport = this.enterpriseAuditEngine.generateEnterpriseReport(
      profile.patientId,
      qualityScore,
      complianceReport,
      safetyValidation,
      versionMetadata,
      clinicalKPIs
    );

    // ── 9. HCKEP Evidence Chain ──
    const observations = [
      ...profile.vitalSigns.map(v => ({ metric: v.metric, value: v.value, timestamp: new Date() })),
      ...profile.laboratoryResults.map(l => ({ metric: l.test, value: l.value, timestamp: new Date() })),
    ];
    const explainabilityChain = hckep.createEvidenceChain(
      evaluationId,
      ['gdl-governance-01', 'gdl-safety-01'],
      observations
    );

    const latencyMs = parseFloat((performance.now() - start).toFixed(3));

    // ── Publish telemetry ──
    this.updateTelemetry(1, 1, 1, 1, 1, latencyMs);

    return {
      evaluationId,
      patientId: profile.patientId,
      qualityScore,
      complianceReport,
      safetyValidation,
      continuousValidation,
      governanceDashboard,
      clinicalKPIs,
      versionMetadata,
      enterpriseReport,
      explainabilityChain,
      telemetryPublished: true,
      evaluatedAt: new Date(),
      latencyMs,
    };
  }

  public getSafetyFramework(): HCQSGSafetyValidationFramework {
    return this.safetyValidationFramework;
  }

  public getComplianceValidator(): HCQSGGuidelineComplianceValidator {
    return this.complianceValidator;
  }

  private updateTelemetry(
    evals: number,
    qualityCount: number,
    safetyCount: number,
    complianceCount: number,
    reportsCount: number,
    latency: number
  ): void {
    this.telemetry.totalEvaluations += evals;
    this.telemetry.totalQualityScoresGenerated += qualityCount;
    this.telemetry.totalSafetyValidations += safetyCount;
    this.telemetry.totalComplianceChecks += complianceCount;
    this.telemetry.totalEnterpriseReports += reportsCount;
    this.telemetry.totalLatencyMs += latency;
  }

  public getTelemetry() {
    return {
      ...this.telemetry,
      averageLatencyMs:
        this.telemetry.totalEvaluations > 0
          ? parseFloat((this.telemetry.totalLatencyMs / this.telemetry.totalEvaluations).toFixed(3))
          : 0,
    };
  }
}

export const hcqsg = new HCQSGPlatform();
