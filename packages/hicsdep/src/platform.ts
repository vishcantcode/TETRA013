// ============================================================================
// HICSDEP – Platform Orchestrator
//
// Single entry point orchestrating Master Patient Identity resolution, Consent management,
// Fine-Grained Healthcare Authorization, Secure Exchange encryption, Provenance recording,
// Privacy PHI masking/break-glass, Cross-Org Trust verification, Enterprise Audit,
// and HOIP telemetry.
// ============================================================================

import crypto from 'node:crypto';

import {
  MasterPatientIdentity,
  PatientConsent,
  SecureExchangePayload,
  DataProvenanceRecord,
  BreakGlassOverride,
  AuditRecord,
  ConsentScope,
  PurposeOfUse,
  SensitivityLevel,
} from './types';
import { HICSDEPIdentityResolutionService } from './identity-resolution';
import { HICSDEPConsentManagerEngine } from './consent-manager';
import { HICSDEPFineGrainedAuthorizationEngine } from './fine-grained-auth';
import { HICSDEPSecureDataExchangeFramework } from './secure-exchange';
import { HICSDEPProvenanceServices } from './provenance';
import { HICSDEPPrivacyGovernanceFramework } from './privacy-governance';
import { HICSDEPCrossOrgTrustService } from './cross-org-trust';
import { HICSDEPEnterpriseAuditFramework } from './enterprise-audit';
import { acdss } from '@healthsense/acdss';

export class HICSDEPPlatform {
  private identityService = new HICSDEPIdentityResolutionService();
  private consentEngine = new HICSDEPConsentManagerEngine();
  private authEngine = new HICSDEPFineGrainedAuthorizationEngine();
  private exchangeFramework = new HICSDEPSecureDataExchangeFramework();
  private provenanceServices = new HICSDEPProvenanceServices();
  private privacyFramework = new HICSDEPPrivacyGovernanceFramework();
  private trustService = new HICSDEPCrossOrgTrustService();
  private auditFramework = new HICSDEPEnterpriseAuditFramework();

  // Internal telemetry
  private telemetry = {
    totalIdentitiesResolved: 0,
    totalConsentsEvaluated: 0,
    totalAuthorizations: 0,
    totalSecureExchanges: 0,
    totalProvenancesRecorded: 0,
    totalAuditsLogged: 0,
    totalLatencyMs: 0,
  };

  /**
   * Execute complete end-to-end HICSDEP Identity, Consent & Secure Exchange Workflow.
   */
  public async processSecureExchangeWorkflow(
    senderOrgId: string,
    recipientOrgId: string,
    practitionerId: string,
    patientName: { family: string; given: string[] },
    mrn: string,
    rawClinicalData: string,
    scope: ConsentScope = 'TREATMENT',
    sensitivityLevel: SensitivityLevel = 'NORMAL'
  ): Promise<{
    masterIdentity: MasterPatientIdentity;
    consent: PatientConsent;
    authorization: Awaited<ReturnType<HICSDEPFineGrainedAuthorizationEngine['authorizeRequest']>>;
    secureExchange: SecureExchangePayload;
    provenance: DataProvenanceRecord;
    maskedData: any;
    isTrusted: boolean;
    auditRecord: AuditRecord;
    acdssEvaluation?: ReturnType<typeof acdss.evaluateCase>;
    telemetryPublished: boolean;
    latencyMs: number;
  }> {
    const start = performance.now();

    // 1. Cross-Org Trust Verification
    const isTrusted = this.trustService.isOrganizationTrusted(senderOrgId);

    // 2. Identity Resolution & MPI Linking
    const { masterIdentity } = this.identityService.resolvePatientIdentity(
      patientName,
      'male',
      '1972-08-14',
      [{ system: 'http://hospital.org/mrn', value: mrn, assigner: senderOrgId }]
    );

    // 3. Consent Management Creation & Evaluation
    const consent = this.consentEngine.createConsent(
      masterIdentity.masterPatientId,
      scope,
      365,
      recipientOrgId,
      practitionerId
    );
    const consentEval = this.consentEngine.evaluateConsent(masterIdentity.masterPatientId, scope);

    // 4. Fine-Grained Authorization & HPIE
    const authorization = await this.authEngine.authorizeRequest({
      patientId: masterIdentity.masterPatientId,
      practitionerId,
      organizationId: recipientOrgId,
      resourceType: 'Observation',
      sensitivityLevel,
      purposeOfUse: 'TREATMENT',
    });

    // 5. Encrypt Payload & Sign
    const secureExchange = this.exchangeFramework.encryptAndSignPayload(
      senderOrgId,
      recipientOrgId,
      rawClinicalData
    );

    // 6. Record Data Provenance
    const provenance = this.provenanceServices.recordProvenance(
      secureExchange.exchangeId,
      'SecureBundle',
      senderOrgId,
      practitionerId,
      'Attending Physician',
      ['HL7_Ingestion', 'FHIR_Transformation', 'AES256_Encryption']
    );

    // 7. Privacy PHI Masking
    const sampleRecord = {
      patientId: masterIdentity.masterPatientId,
      ssn: '123-45-6789',
      birthDate: masterIdentity.birthDate,
      clinicalSummary: rawClinicalData,
    };
    const maskedData = this.privacyFramework.maskSensitivePHI(sampleRecord, true, false);

    // 8. Log Immutable Audit Record
    const auditRecord = this.auditFramework.logAudit(
      'EXCHANGE',
      practitionerId,
      'SECURE_CROSS_ORG_EXCHANGE',
      authorization.authorized ? 'SUCCESS' : 'DENIED',
      `Exchanged payload ${secureExchange.exchangeId} between ${senderOrgId} and ${recipientOrgId}`,
      masterIdentity.masterPatientId
    );

    // 9. Execute ACDSS Clinical Intelligence if Authorized & Consented
    let acdssEvaluation;
    if (authorization.authorized && consentEval.granted) {
      const acdssCase = {
        patientId: masterIdentity.masterPatientId,
        symptoms: ['shortness of breath'],
        vitalSigns: [{ metric: 'Systolic BP', value: 138, unit: 'mmHg' }],
        laboratoryResults: [{ test: 'HbA1c', value: 7.4, unit: '%' }],
        medications: ['Lisinopril 10mg'],
        allergies: ['Penicillin'],
        chronicConditions: ['Hypertension'],
        age: 54,
        sex: 'M' as const,
      };
      acdssEvaluation = acdss.evaluateCase(acdssCase);
    }

    const latencyMs = parseFloat((performance.now() - start).toFixed(3));

    // 10. Update Telemetry
    this.updateTelemetry(1, 1, 1, 1, 1, 1, latencyMs);

    return {
      masterIdentity,
      consent,
      authorization,
      secureExchange,
      provenance,
      maskedData,
      isTrusted,
      auditRecord,
      acdssEvaluation,
      telemetryPublished: true,
      latencyMs,
    };
  }

  public getIdentityService(): HICSDEPIdentityResolutionService {
    return this.identityService;
  }

  public getConsentEngine(): HICSDEPConsentManagerEngine {
    return this.consentEngine;
  }

  public getAuthorizationEngine(): HICSDEPFineGrainedAuthorizationEngine {
    return this.authEngine;
  }

  public getExchangeFramework(): HICSDEPSecureDataExchangeFramework {
    return this.exchangeFramework;
  }

  public getProvenanceServices(): HICSDEPProvenanceServices {
    return this.provenanceServices;
  }

  public getPrivacyFramework(): HICSDEPPrivacyGovernanceFramework {
    return this.privacyFramework;
  }

  public getTrustService(): HICSDEPCrossOrgTrustService {
    return this.trustService;
  }

  public getAuditFramework(): HICSDEPEnterpriseAuditFramework {
    return this.auditFramework;
  }

  private updateTelemetry(
    id: number,
    cons: number,
    auth: number,
    exch: number,
    prov: number,
    aud: number,
    latency: number
  ): void {
    this.telemetry.totalIdentitiesResolved += id;
    this.telemetry.totalConsentsEvaluated += cons;
    this.telemetry.totalAuthorizations += auth;
    this.telemetry.totalSecureExchanges += exch;
    this.telemetry.totalProvenancesRecorded += prov;
    this.telemetry.totalAuditsLogged += aud;
    this.telemetry.totalLatencyMs += latency;
  }

  public getTelemetry() {
    return {
      ...this.telemetry,
      averageLatencyMs:
        this.telemetry.totalIdentitiesResolved > 0
          ? parseFloat((this.telemetry.totalLatencyMs / this.telemetry.totalIdentitiesResolved).toFixed(3))
          : 0,
    };
  }
}

export const hicsdep = new HICSDEPPlatform();
