import { WorkflowContext } from './ClinicalWorkflow';
import { DependencyRegistry } from './DependencyRegistry';
import { orchestratorEventBus } from './EventBus';
import { TelemetryTracer } from './Telemetry';
import { Logger } from './Logger';

export class Pipeline {
  private registry = DependencyRegistry.getInstance();

  public async executePipeline(ctx: WorkflowContext, tracer: TelemetryTracer): Promise<WorkflowContext> {
    const patientId = ctx.patientId;

    // 1. Event: PatientRegistered
    await orchestratorEventBus.publish({
      eventId: `ev-${Date.now()}-1`,
      eventType: 'PatientRegistered',
      patientId,
      timestamp: new Date().toISOString(),
      data: { patientId }
    });

    // 2. OCR Step (with Try/Catch Fallback Recovery)
    if (ctx.request.uploadedDocument) {
      const stopTimer = tracer.startStepTimer();
      try {
        await orchestratorEventBus.publish({
          eventId: `ev-${Date.now()}-2`,
          eventType: 'DocumentUploaded',
          patientId,
          timestamp: new Date().toISOString(),
          data: { documentId: ctx.request.uploadedDocument.documentId }
        });

        const ocrRes = await this.registry.documentEngine.processDocumentAndEvaluate(
          ctx.request.uploadedDocument,
          ctx.request.patient,
          ctx.request.vitals || [],
          ctx.request.conditions || []
        );

        ctx.ocrDiagnosticReport = ocrRes.diagnosticReport;
        ctx.ocrObservations = ocrRes.extractedObservations;

        await orchestratorEventBus.publish({
          eventId: `ev-${Date.now()}-3`,
          eventType: 'OCRCompleted',
          patientId,
          timestamp: new Date().toISOString(),
          data: { obsCount: ctx.ocrObservations.length }
        });

        tracer.recordStep({ stepName: 'OCR & Document Intelligence', durationMs: stopTimer(), status: 'SUCCESS' });
      } catch (ocrErr: any) {
        Logger.warn('OCR processing failed. Graceful degradation falling back to manual observations.', ocrErr);
        ctx.warnings.push({ step: 'OCR', warning: 'OCR failed; fallback to manual inputs.' });
        tracer.recordStep({ stepName: 'OCR & Document Intelligence', durationMs: stopTimer(), status: 'WARNING', errorDetails: ocrErr?.message });
      }
    }

    // 3. Clinical Intelligence & Disease Risk Engine
    const riskTimer = tracer.startStepTimer();
    const mergedVitals = ctx.request.vitals || [];
    const mergedLabs = [...(ctx.request.labs || []), ...ctx.ocrObservations];
    const mergedConditions = ctx.request.conditions || [];
    const mergedMedications = ctx.request.medications || [];

    ctx.riskAssessment = this.registry.clinicalEngine.evaluatePatient(
      ctx.request.patient,
      mergedVitals,
      mergedLabs,
      mergedConditions,
      mergedMedications,
      ctx.ocrDiagnosticReport ? [ctx.ocrDiagnosticReport] : []
    );

    await orchestratorEventBus.publish({
      eventId: `ev-${Date.now()}-4`,
      eventType: 'RiskCalculated',
      patientId,
      timestamp: new Date().toISOString(),
      data: { overallRiskScore: ctx.riskAssessment.overallRiskScore }
    });
    tracer.recordStep({ stepName: 'Clinical Risk Engine', durationMs: riskTimer(), status: 'SUCCESS', confidence: ctx.riskAssessment.overallConfidenceScore });

    // 4. Parallelized Downstream Engines (Explainability + Referrals + Education)
    const parallelTimer = tracer.startStepTimer();
    const [explainabilityRes, referralRes, educationRes] = await Promise.allSettled([
      Promise.resolve(this.registry.explainabilityEngine.generateReport(ctx.riskAssessment)),
      Promise.resolve(this.registry.referralEngine.evaluateReferral(ctx.riskAssessment)),
      Promise.resolve(this.registry.educationEngine.generateEducationPlan(
        ctx.riskAssessment,
        undefined,
        undefined,
        ctx.request.preferredLanguage || 'en'
      ))
    ]);

    if (explainabilityRes.status === 'fulfilled') {
      ctx.explainabilityReport = explainabilityRes.value;
      await orchestratorEventBus.publish({ eventId: `ev-${Date.now()}-5`, eventType: 'GuidelineMatched', patientId, timestamp: new Date().toISOString(), data: { citationsCount: ctx.explainabilityReport.guidelineCitations.length } });
    } else {
      ctx.warnings.push({ step: 'Explainability', warning: 'Explainability failed.' });
    }

    if (referralRes.status === 'fulfilled') {
      ctx.referralDecision = referralRes.value;
      await orchestratorEventBus.publish({ eventId: `ev-${Date.now()}-6`, eventType: 'ReferralGenerated', patientId, timestamp: new Date().toISOString(), data: { isRequired: ctx.referralDecision.isReferralRequired } });
    } else {
      ctx.warnings.push({ step: 'Referral', warning: 'Referral engine failed.' });
    }

    if (educationRes.status === 'fulfilled') {
      ctx.educationPlan = educationRes.value;
      await orchestratorEventBus.publish({ eventId: `ev-${Date.now()}-7`, eventType: 'EducationGenerated', patientId, timestamp: new Date().toISOString(), data: { language: ctx.educationPlan.selectedLanguage } });
    } else {
      ctx.warnings.push({ step: 'Education', warning: 'Education engine failed.' });
    }

    tracer.recordStep({ stepName: 'Parallel Downstream Engines (Explainability/Referral/Education)', durationMs: parallelTimer(), status: 'SUCCESS' });

    // 5. Digital Twin Update Step
    const twinTimer = tracer.startStepTimer();
    ctx.digitalTwin = this.registry.digitalTwinEngine.createDigitalTwin(
      ctx.request.patient,
      mergedVitals,
      mergedLabs,
      mergedConditions,
      mergedMedications,
      ctx.ocrDiagnosticReport ? [ctx.ocrDiagnosticReport] : []
    );
    await orchestratorEventBus.publish({ eventId: `ev-${Date.now()}-8`, eventType: 'DigitalTwinUpdated', patientId, timestamp: new Date().toISOString(), data: { version: ctx.digitalTwin.activeVersion.version } });
    tracer.recordStep({ stepName: 'Digital Twin Update', durationMs: twinTimer(), status: 'SUCCESS' });

    // 6. Population Analytics Update Step (Graceful Fallback Isolation)
    const popTimer = tracer.startStepTimer();
    try {
      ctx.populationSnapshot = this.registry.populationEngine.generatePopulationSnapshot([ctx.digitalTwin]);
      await orchestratorEventBus.publish({ eventId: `ev-${Date.now()}-9`, eventType: 'AnalyticsUpdated', patientId, timestamp: new Date().toISOString(), data: { totalScreened: ctx.populationSnapshot.totalPopulationEvaluated } });
      tracer.recordStep({ stepName: 'Population Analytics Update', durationMs: popTimer(), status: 'SUCCESS' });
    } catch (popErr: any) {
      Logger.warn('Population analytics update failed; clinical decision workflow preserved.', popErr);
      ctx.warnings.push({ step: 'PopulationAnalytics', warning: 'Population analytics failed.' });
      tracer.recordStep({ stepName: 'Population Analytics Update', durationMs: popTimer(), status: 'WARNING', errorDetails: popErr?.message });
    }

    // 7. Workflow Completed Event
    await orchestratorEventBus.publish({
      eventId: `ev-${Date.now()}-10`,
      eventType: 'WorkflowCompleted',
      patientId,
      timestamp: new Date().toISOString(),
      data: { executionId: ctx.executionId }
    });

    return ctx;
  }
}
