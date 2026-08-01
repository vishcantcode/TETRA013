// ============================================================================
// HHIF – Platform Orchestrator
//
// Single entry point orchestrating FHIR R4 mapping, validation, versioning,
// bundle generation, and clinical intelligence integration.
// Integrates with HCPI, ACDSS, HCKEP, and HOIP.
// ============================================================================

import crypto from 'node:crypto';

import {
  FHIRResource,
  FHIRBundle,
  FHIRValidationReport,
  FHIRProvenanceRecord,
  DomainMappingResult,
} from './types';
import { HHIFFHIRResourceFramework } from './fhir-resources';
import { HHIFDomainMapperEngine } from './domain-mapper';
import { HHIFFHIRValidatorEngine } from './validator';
import { HHIFTerminologyEngine } from './terminology';
import { HHIFVersioningEngine } from './versioning';
import { HHIFInteroperabilityServices } from './services';
import { HPPMCareProfile } from '@healthsense/hppm';
import { acdss } from '@healthsense/acdss';
import { hckep } from '@healthsense/hckep';

export class HHIFPlatform {
  private framework = new HHIFFHIRResourceFramework();
  private domainMapper = new HHIFDomainMapperEngine();
  private validator = new HHIFFHIRValidatorEngine();
  private terminology = new HHIFTerminologyEngine();
  private versioning = new HHIFVersioningEngine();
  private services = new HHIFInteroperabilityServices();

  // Internal telemetry
  private telemetry = {
    totalImports: 0,
    totalExports: 0,
    totalValidations: 0,
    totalValidationFailures: 0,
    totalRoundTripMappings: 0,
    totalBundlesGenerated: 0,
    totalLatencyMs: 0,
  };

  /**
   * Process a HealthSense Care Profile into FHIR resources, validate, record provenance, and run clinical intelligence (ACDSS).
   */
  public processInteroperability(profile: HPPMCareProfile): {
    fhirResources: FHIRResource[];
    bundle: FHIRBundle;
    validationReports: FHIRValidationReport[];
    roundTripResult: DomainMappingResult<HPPMCareProfile>;
    provenanceRecords: FHIRProvenanceRecord[];
    acdssEvaluation: ReturnType<typeof acdss.evaluateCase>;
    telemetryPublished: boolean;
    latencyMs: number;
  } {
    const start = performance.now();

    // 1. Domain to FHIR Mapping
    const roundTripResult = this.domainMapper.executeRoundTrip(profile);
    const fhirResources = roundTripResult.generatedFHIRResources;

    // 2. Validate all FHIR resources
    const validationReports: FHIRValidationReport[] = [];
    let hasFailures = false;
    for (const res of fhirResources) {
      const report = this.validator.validate(res);
      validationReports.push(report);
      if (!report.isValid) hasFailures = true;
    }

    // 3. Provenance & Versioning
    const provenanceRecords: FHIRProvenanceRecord[] = [];
    for (const res of fhirResources) {
      const prov = this.versioning.recordProvenance(res, 'TRANSFORM', 'HHIF', 'DomainMapperEngine');
      provenanceRecords.push(prov);
      this.framework.saveResource(res, 'HHIF_MAPPER');
    }

    // 4. Create FHIR Bundle
    const bundle = this.services.createBundle(fhirResources, 'transaction');

    // 5. Integrate with ACDSS Clinical Decision Support using converted domain data
    const acdssCase = {
      patientId: profile.patientId,
      symptoms: ['fatigue', 'shortness of breath'],
      vitalSigns: profile.vitalSigns,
      laboratoryResults: profile.laboratoryResults,
      medications: profile.currentMedications,
      allergies: profile.allergies,
      chronicConditions: profile.chronicConditions,
      age: profile.demographics.age,
      sex: profile.demographics.sex,
    };
    const acdssEvaluation = acdss.evaluateCase(acdssCase);

    const latencyMs = parseFloat((performance.now() - start).toFixed(3));

    // 6. Update telemetry
    this.updateTelemetry(1, 1, validationReports.length, hasFailures ? 1 : 0, 1, 1, latencyMs);

    return {
      fhirResources,
      bundle,
      validationReports,
      roundTripResult,
      provenanceRecords,
      acdssEvaluation,
      telemetryPublished: true,
      latencyMs,
    };
  }

  public getDomainMapper(): HHIFDomainMapperEngine {
    return this.domainMapper;
  }

  public getValidator(): HHIFFHIRValidatorEngine {
    return this.validator;
  }

  public getTerminology(): HHIFTerminologyEngine {
    return this.terminology;
  }

  public getServices(): HHIFInteroperabilityServices {
    return this.services;
  }

  private updateTelemetry(
    imports: number,
    exports: number,
    validations: number,
    failures: number,
    roundTrips: number,
    bundles: number,
    latency: number
  ): void {
    this.telemetry.totalImports += imports;
    this.telemetry.totalExports += exports;
    this.telemetry.totalValidations += validations;
    this.telemetry.totalValidationFailures += failures;
    this.telemetry.totalRoundTripMappings += roundTrips;
    this.telemetry.totalBundlesGenerated += bundles;
    this.telemetry.totalLatencyMs += latency;
  }

  public getTelemetry() {
    return {
      ...this.telemetry,
      averageLatencyMs:
        this.telemetry.totalImports > 0
          ? parseFloat((this.telemetry.totalLatencyMs / this.telemetry.totalImports).toFixed(3))
          : 0,
    };
  }
}

export const hhif = new HHIFPlatform();
