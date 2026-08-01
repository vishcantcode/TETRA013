import { WorkflowRequestInput, WorkflowContext } from './ClinicalWorkflow';
import { Pipeline } from './Pipeline';
import { TelemetryTracer } from './Telemetry';
import { MetricsAggregator } from './Metrics';
import { Logger } from './Logger';

export interface ClinicalAnalysisAPIResponse {
  statusCode: number;
  success: boolean;
  executionId: string;
  patientId: string;
  timestamp: string;
  telemetryTrace: ReturnType<TelemetryTracer['getTraceSummary']>;
  data: {
    riskAssessment: WorkflowContext['riskAssessment'];
    explainabilityReport: WorkflowContext['explainabilityReport'];
    referralDecision: WorkflowContext['referralDecision'];
    educationPlan: WorkflowContext['educationPlan'];
    digitalTwin: WorkflowContext['digitalTwin'];
    populationSnapshot: WorkflowContext['populationSnapshot'];
    ocrDiagnosticReport?: WorkflowContext['ocrDiagnosticReport'];
  };
  warnings: WorkflowContext['warnings'];
  errors: WorkflowContext['errors'];
}

export class WorkflowManager {
  private pipeline = new Pipeline();

  public async handleClinicalAnalysis(input: WorkflowRequestInput): Promise<ClinicalAnalysisAPIResponse> {
    const executionId = `exec-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const patientId = input.patient.id;
    const tracer = new TelemetryTracer();

    Logger.info(`Handling POST /clinical-analysis for patient ${patientId}`, { executionId });

    const ctx: WorkflowContext = {
      executionId,
      patientId,
      request: input,
      ocrObservations: [],
      errors: [],
      warnings: []
    };

    try {
      const completedCtx = await this.pipeline.executePipeline(ctx, tracer);
      MetricsAggregator.recordEvaluationSuccess();

      return {
        statusCode: 200,
        success: true,
        executionId,
        patientId,
        timestamp: new Date().toISOString(),
        telemetryTrace: tracer.getTraceSummary(),
        data: {
          riskAssessment: completedCtx.riskAssessment,
          explainabilityReport: completedCtx.explainabilityReport,
          referralDecision: completedCtx.referralDecision,
          educationPlan: completedCtx.educationPlan,
          digitalTwin: completedCtx.digitalTwin,
          populationSnapshot: completedCtx.populationSnapshot,
          ocrDiagnosticReport: completedCtx.ocrDiagnosticReport
        },
        warnings: completedCtx.warnings,
        errors: completedCtx.errors
      };
    } catch (err: any) {
      MetricsAggregator.recordEvaluationError();
      Logger.error(`Workflow failure for patient ${patientId}`, err);

      return {
        statusCode: 500,
        success: false,
        executionId,
        patientId,
        timestamp: new Date().toISOString(),
        telemetryTrace: tracer.getTraceSummary(),
        data: {
          riskAssessment: ctx.riskAssessment,
          explainabilityReport: ctx.explainabilityReport,
          referralDecision: ctx.referralDecision,
          educationPlan: ctx.educationPlan,
          digitalTwin: ctx.digitalTwin,
          populationSnapshot: ctx.populationSnapshot
        },
        warnings: ctx.warnings,
        errors: [{ step: 'Orchestrator', error: err?.message || 'Unknown pipeline failure' }]
      };
    }
  }
}

export const workflowManager = new WorkflowManager();
