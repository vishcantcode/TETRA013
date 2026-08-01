import { ReasoningContext, ReasoningRequest, FinalClinicalDecision } from '../contracts';
import { Tracer } from '../tracing';
import { MetricsCollector } from '../metrics';
import { PipelineFailure } from '../errors';
import {
  EvidenceCollectionStage,
  EvidenceNormalizationStage,
  EvidenceValidationStage,
  EvidencePrioritizationStage,
  HypothesisGenerationStage,
  ClinicalReasoningStage,
  SafetyValidationStage,
  DecisionSynthesisStage,
  ExplainabilityAssemblyStage
} from '../stages';

export class ClinicalReasoningPipeline {
  private stages = {
    collection: new EvidenceCollectionStage(),
    normalization: new EvidenceNormalizationStage(),
    validation: new EvidenceValidationStage(),
    prioritization: new EvidencePrioritizationStage(),
    hypothesis: new HypothesisGenerationStage(),
    reasoning: new ClinicalReasoningStage(),
    safety: new SafetyValidationStage(),
    synthesis: new DecisionSynthesisStage(),
    explainability: new ExplainabilityAssemblyStage()
  };

  public async execute(context: ReasoningContext, request: ReasoningRequest): Promise<FinalClinicalDecision> {
    const tracer = new Tracer(context.metadata);
    const metrics = new MetricsCollector();
    const startTime = Date.now();

    try {
      // Stage 1: Collection
      const s1Start = Date.now();
      const collected = await this.stages.collection.execute(context, request);
      tracer.recordStage(this.stages.collection.name, request, collected, Date.now() - s1Start);
      metrics.recordStageLatency(this.stages.collection.name, Date.now() - s1Start);
      metrics.incrementEvidenceCount(collected.length);

      // Stage 2: Normalization
      const s2Start = Date.now();
      const normalized = await this.stages.normalization.execute(context, collected);
      tracer.recordStage(this.stages.normalization.name, collected, normalized, Date.now() - s2Start);
      metrics.recordStageLatency(this.stages.normalization.name, Date.now() - s2Start);

      // Stage 3: Validation
      const s3Start = Date.now();
      const validated = await this.stages.validation.execute(context, normalized);
      tracer.recordStage(this.stages.validation.name, normalized, validated, Date.now() - s3Start);
      metrics.recordStageLatency(this.stages.validation.name, Date.now() - s3Start);
      metrics.incrementValidationFailures(); // Assuming all dropped were failures if counted, here just naive

      // Stage 4: Prioritization
      const s4Start = Date.now();
      const prioritized = await this.stages.prioritization.execute(context, validated);
      tracer.recordStage(this.stages.prioritization.name, validated, prioritized, Date.now() - s4Start);
      metrics.recordStageLatency(this.stages.prioritization.name, Date.now() - s4Start);

      // Stage 5: Hypothesis
      const s5Start = Date.now();
      const hypotheses = await this.stages.hypothesis.execute(context, prioritized);
      tracer.recordStage(this.stages.hypothesis.name, prioritized, hypotheses, Date.now() - s5Start);
      metrics.recordStageLatency(this.stages.hypothesis.name, Date.now() - s5Start);
      metrics.incrementHypotheses(hypotheses.length);

      // Stage 6: Reasoning
      const s6Start = Date.now();
      const reasoningResult = await this.stages.reasoning.execute(context, { hypotheses, evidence: prioritized });
      tracer.recordStage(this.stages.reasoning.name, { hypotheses, evidence: prioritized }, reasoningResult, Date.now() - s6Start);
      metrics.recordStageLatency(this.stages.reasoning.name, Date.now() - s6Start);

      // Stage 7: Safety
      const s7Start = Date.now();
      const safetyResult = await this.stages.safety.execute(context, reasoningResult);
      tracer.recordStage(this.stages.safety.name, reasoningResult, safetyResult, Date.now() - s7Start, [], safetyResult.warnings);
      metrics.recordStageLatency(this.stages.safety.name, Date.now() - s7Start);

      // Stage 8: Synthesis
      const s8Start = Date.now();
      const draft = await this.stages.synthesis.execute(context, { result: reasoningResult, safety: safetyResult });
      tracer.recordStage(this.stages.synthesis.name, { result: reasoningResult, safety: safetyResult }, draft, Date.now() - s8Start);
      metrics.recordStageLatency(this.stages.synthesis.name, Date.now() - s8Start);

      // Stage 9: Explainability
      const s9Start = Date.now();
      const explanation = await this.stages.explainability.execute(context, { draft, traceId: tracer.getTrace().id });
      tracer.recordStage(this.stages.explainability.name, { draft, traceId: tracer.getTrace().id }, explanation, Date.now() - s9Start);
      metrics.recordStageLatency(this.stages.explainability.name, Date.now() - s9Start);

      // Final Assembly
      const finalDecision: FinalClinicalDecision = {
        id: `decision-${Date.now()}`,
        draft,
        safety: safetyResult,
        explanation
      };

      tracer.complete(finalDecision);
      
      // Stage 10: Metrics Export
      metrics.setTotalLatency(Date.now() - startTime);
      // In production, publish metrics to Datadog/Prometheus here.

      return finalDecision;

    } catch (err: any) {
      throw new PipelineFailure(err.message, 'UnknownStage');
    }
  }
}
