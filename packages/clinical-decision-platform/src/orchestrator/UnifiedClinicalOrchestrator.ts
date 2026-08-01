import { ClinicalEvaluationRequest, FinalClinicalDecisionResult } from '../interfaces/OrchestratorPayload';
import { ClinicalContainer } from '../container/ClinicalContainer';
import { globalClinicalEventBus } from '../events/ClinicalEventBus';
import { globalAuditLogger } from '../logging/AuditLogger';
import { TelemetryTracer } from '../logging/TelemetryService';
import { FHIRDiagnosticReport, FHIRObservation } from '@healthsense/clinical-models';

export class UnifiedClinicalOrchestrator {
  private container = ClinicalContainer.getInstance();

  public async evaluatePatient(request: ClinicalEvaluationRequest): Promise<FinalClinicalDecisionResult> {
    const evaluationId = `eval-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const patientId = request.patient.id;
    const tracer = new TelemetryTracer();

    // Step 1: Patient Registration & Ingestion Event
    let stepStart = Date.now();
    globalClinicalEventBus.publish({
      eventId: `ev-reg-${Date.now()}`,
      type: 'PATIENT_REGISTERED',
      patientId,
      timestamp: new Date().toISOString(),
      payload: { patient: request.patient }
    });
    tracer.recordStep('Patient Registration & Ingestion', Date.now() - stepStart);

    // Step 2: Document OCR Extraction (if uploaded)
    let ocrReport: FHIRDiagnosticReport | undefined;
    let ocrObservations: FHIRObservation[] = [];
    let ocrPerformed = false;

    if (request.uploadedDocument) {
      stepStart = Date.now();
      const ocrResult = await this.container.documentEngine.processDocumentAndEvaluate(
        request.uploadedDocument,
        request.patient,
        request.vitals || [],
        request.conditions || []
      );
      ocrReport = ocrResult.diagnosticReport;
      ocrObservations = ocrResult.extractedObservations;
      ocrPerformed = true;

      globalClinicalEventBus.publish({
        eventId: `ev-ocr-${Date.now()}`,
        type: 'DOCUMENT_OCR_PROCESSED',
        patientId,
        timestamp: new Date().toISOString(),
        payload: { documentId: request.uploadedDocument.documentId, obsCount: ocrObservations.length }
      });
      tracer.recordStep('OCR & Document Intelligence', Date.now() - stepStart);
    }

    // Step 3: Clinical Intelligence & Multi-Disease Risk Evaluation
    stepStart = Date.now();
    const mergedVitals = request.vitals || [];
    const mergedLabs = [...(request.labs || []), ...ocrObservations];
    const mergedConditions = request.conditions || [];
    const mergedMedications = request.medications || [];

    const riskAssessment = this.container.clinicalEngine.evaluatePatient(
      request.patient,
      mergedVitals,
      mergedLabs,
      mergedConditions,
      mergedMedications,
      ocrReport ? [ocrReport] : []
    );

    globalClinicalEventBus.publish({
      eventId: `ev-risk-${Date.now()}`,
      type: 'CLINICAL_RISK_EVALUATED',
      patientId,
      timestamp: new Date().toISOString(),
      payload: { overallRiskScore: riskAssessment.overallRiskScore, tier: riskAssessment.overallTier }
    });
    tracer.recordStep('Clinical Risk Engine Evaluation', Date.now() - stepStart);

    // Step 4: Explainability & Guideline Reasoning
    stepStart = Date.now();
    const explainabilityReport = this.container.explainabilityEngine.generateReport(riskAssessment);

    globalClinicalEventBus.publish({
      eventId: `ev-exp-${Date.now()}`,
      type: 'EXPLANATION_GENERATED',
      patientId,
      timestamp: new Date().toISOString(),
      payload: { confidenceScore: explainabilityReport.confidenceBreakdown.overallConfidence }
    });
    tracer.recordStep('Explainability Engine Generation', Date.now() - stepStart);

    // Step 5: Specialist Referral & Urgency Decision
    stepStart = Date.now();
    const referralDecision = this.container.referralEngine.evaluateReferral(riskAssessment, explainabilityReport);

    globalClinicalEventBus.publish({
      eventId: `ev-ref-${Date.now()}`,
      type: 'REFERRAL_ISSUED',
      patientId,
      timestamp: new Date().toISOString(),
      payload: { isReferralRequired: referralDecision.isReferralRequired, overallUrgency: referralDecision.overallUrgency }
    });
    tracer.recordStep('Referral Intelligence Engine', Date.now() - stepStart);

    // Step 6: Patient Education & Multilingual Advice
    stepStart = Date.now();
    const preferredLang = request.preferredLanguage || 'en';
    const educationPlan = this.container.educationEngine.generateEducationPlan(
      riskAssessment,
      explainabilityReport,
      referralDecision,
      preferredLang
    );

    globalClinicalEventBus.publish({
      eventId: `ev-edu-${Date.now()}`,
      type: 'PATIENT_EDUCATION_GENERATED',
      patientId,
      timestamp: new Date().toISOString(),
      payload: { language: preferredLang }
    });
    tracer.recordStep('Patient Engagement Engine', Date.now() - stepStart);

    // Step 7: Patient Digital Twin State Update
    stepStart = Date.now();
    const digitalTwin = this.container.digitalTwinEngine.createDigitalTwin(
      request.patient,
      mergedVitals,
      mergedLabs,
      mergedConditions,
      mergedMedications,
      ocrReport ? [ocrReport] : []
    );

    globalClinicalEventBus.publish({
      eventId: `ev-twin-${Date.now()}`,
      type: 'DIGITAL_TWIN_UPDATED',
      patientId,
      timestamp: new Date().toISOString(),
      payload: { activeVersion: digitalTwin.activeVersion.version }
    });
    tracer.recordStep('Digital Twin Update', Date.now() - stepStart);

    // Step 8: Population Analytics Update
    stepStart = Date.now();
    const populationSnapshot = this.container.populationEngine.generatePopulationSnapshot([digitalTwin]);

    globalClinicalEventBus.publish({
      eventId: `ev-pop-${Date.now()}`,
      type: 'POPULATION_ANALYTICS_UPDATED',
      patientId,
      timestamp: new Date().toISOString(),
      payload: { totalEvaluated: populationSnapshot.totalPopulationEvaluated }
    });
    tracer.recordStep('Population Analytics Update', Date.now() - stepStart);

    // Step 9: Immutable Audit Logging
    stepStart = Date.now();
    const auditLogId = globalAuditLogger.logAction(
      patientId,
      'EVALUATE_PATIENT_COMPLETE',
      `Completed unified clinical evaluation ${evaluationId}. Overall risk score: ${riskAssessment.overallRiskScore}% (${riskAssessment.overallTier}).`
    );
    tracer.recordStep('Audit Logging', Date.now() - stepStart);

    const trace = tracer.completeTrace(evaluationId, patientId);

    return {
      evaluationId,
      evaluatedAt: new Date().toISOString(),
      patientId,
      pipelineDurationMs: trace.totalDurationMs,
      riskAssessment,
      explainabilityReport,
      referralDecision,
      educationPlan,
      digitalTwin,
      populationSnapshot,
      ocrExtractionPerformed: ocrPerformed,
      ocrDiagnosticReport: ocrReport,
      auditLogId
    };
  }
}

export const unifiedClinicalOrchestrator = new UnifiedClinicalOrchestrator();
