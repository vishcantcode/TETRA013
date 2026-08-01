import { PipelineStage } from './base';
import { 
  ReasoningContext, 
  ReasoningRequest, 
  EvidenceBundle, 
  ValidatedEvidence, 
  PrioritizedEvidence, 
  ClinicalHypothesis, 
  ReasoningResult, 
  SafetyAssessment, 
  DecisionDraft, 
  FinalClinicalDecision 
} from '../contracts';
import { ValidationError, SafetyViolation } from '../errors';

// Stage 1: Evidence Collection
export class EvidenceCollectionStage implements PipelineStage<ReasoningRequest, EvidenceBundle[]> {
  readonly name = 'EvidenceCollection';
  async execute(context: ReasoningContext, input: ReasoningRequest): Promise<EvidenceBundle[]> {
    // Simply aggregates raw evidence into standard bundles. No business logic.
    return input.rawEvidence.map(e => ({
      source: e.source || 'unknown',
      payload: e.payload || e,
      timestamp: new Date(e.timestamp || Date.now()),
      confidence: e.confidence ?? 1.0
    }));
  }
}

// Stage 2: Evidence Normalization
export class EvidenceNormalizationStage implements PipelineStage<EvidenceBundle[], EvidenceBundle[]> {
  readonly name = 'EvidenceNormalization';
  async execute(context: ReasoningContext, input: EvidenceBundle[]): Promise<EvidenceBundle[]> {
    return input.map(bundle => ({
      ...bundle,
      timestamp: new Date(bundle.timestamp), // Ensure valid date objects
      confidence: Math.max(0, Math.min(1, bundle.confidence)) // Bound 0-1
    }));
  }
}

// Stage 3: Evidence Validation
export class EvidenceValidationStage implements PipelineStage<EvidenceBundle[], ValidatedEvidence[]> {
  readonly name = 'EvidenceValidation';
  async execute(context: ReasoningContext, input: EvidenceBundle[]): Promise<ValidatedEvidence[]> {
    const valid: ValidatedEvidence[] = [];
    for (const bundle of input) {
      if (!bundle.source || !bundle.payload) {
        if (context.config.enableStrictValidation) {
          throw new ValidationError(`Missing required fields in evidence from ${bundle.source}`);
        }
        continue; // Skip invalid
      }
      valid.push({
        id: `ev-${Date.now()}-${Math.random()}`,
        bundle,
        normalizedData: typeof bundle.payload === 'object' ? bundle.payload : { value: bundle.payload }
      });
    }
    return valid;
  }
}

// Stage 4: Evidence Prioritization
export class EvidencePrioritizationStage implements PipelineStage<ValidatedEvidence[], PrioritizedEvidence[]> {
  readonly name = 'EvidencePrioritization';
  async execute(context: ReasoningContext, input: ValidatedEvidence[]): Promise<PrioritizedEvidence[]> {
    return input.map(ev => {
      // Basic deterministic scoring based on config threshold
      const score = ev.bundle.confidence > context.config.priorityThreshold ? 100 : 50;
      return {
        evidence: ev,
        priorityScore: score,
        reasoning: `Score ${score} based on confidence threshold ${context.config.priorityThreshold}`
      };
    }).sort((a, b) => b.priorityScore - a.priorityScore);
  }
}

// Stage 5: Hypothesis Generation
export class HypothesisGenerationStage implements PipelineStage<PrioritizedEvidence[], ClinicalHypothesis[]> {
  readonly name = 'HypothesisGeneration';
  async execute(context: ReasoningContext, input: PrioritizedEvidence[]): Promise<ClinicalHypothesis[]> {
    const hypotheses: ClinicalHypothesis[] = [];
    // Generate simple deterministic hypothesis based on high priority evidence
    const highPriority = input.filter(i => i.priorityScore >= 80);
    if (highPriority.length > 0) {
      hypotheses.push({
        id: `hyp-${Date.now()}`,
        description: `Possible critical event derived from ${highPriority.map(h => h.evidence.bundle.source).join(', ')}`,
        supportingEvidenceIds: highPriority.map(h => h.evidence.id),
        confidence: Math.min(...highPriority.map(h => h.evidence.bundle.confidence))
      });
    }
    return hypotheses.slice(0, context.config.maxHypotheses || 5);
  }
}

// Stage 6: Clinical Reasoning
export class ClinicalReasoningStage implements PipelineStage<{hypotheses: ClinicalHypothesis[], evidence: PrioritizedEvidence[]}, ReasoningResult> {
  readonly name = 'ClinicalReasoning';
  async execute(context: ReasoningContext, input: {hypotheses: ClinicalHypothesis[], evidence: PrioritizedEvidence[]}): Promise<ReasoningResult> {
    const overallConfidence = input.hypotheses.length > 0 
      ? input.hypotheses.reduce((acc, h) => acc + h.confidence, 0) / input.hypotheses.length
      : 0.5;

    return {
      hypotheses: input.hypotheses,
      inferredActions: input.hypotheses.map(h => ({ type: 'investigate', target: h.id })),
      overallConfidence
    };
  }
}

// Stage 7: Safety Validation
export class SafetyValidationStage implements PipelineStage<ReasoningResult, SafetyAssessment> {
  readonly name = 'SafetyValidation';
  
  // In a real DI setup, this would be injected.
  private ckfTraversalService: any; 

  async execute(context: ReasoningContext, input: ReasoningResult): Promise<SafetyAssessment> {
    if (context.config.safetyMode === 'strict' && input.overallConfidence < 0.3) {
      throw new SafetyViolation('Overall confidence is below strict safety thresholds.');
    }

    let isSafe = true;
    const violations: string[] = [];

    // CKF INTEGRATION (IPEB Section 6)
    // The pipeline checks if proposed actions contraindicate with patient's active conditions.
    try {
      if (this.ckfTraversalService && input.inferredActions.length > 0) {
        // Assume context.metadata contains the patient's active conditions.
        const patientConditions: string[] = context.metadata.activeConditions || [];
        
        for (const action of input.inferredActions) {
          for (const condition of patientConditions) {
             // We use checkPathExists which traverses relationships. 
             // Note: ActiveContext handles the temporal snapshot implicitly.
             const hasContraindication = await this.ckfTraversalService.checkPathExists(
               action.target, 
               condition, 
               'CONTRAINDICATES'
             );

             if (hasContraindication) {
               isSafe = false;
               violations.push(`Action ${action.target} contraindicates with active condition ${condition}`);
             }
          }
        }
      }
    } catch (err) {
      // IPEB Section 6: Recovery Strategy -> Fail closed on CKF error
      throw new SafetyViolation('KnowledgeFabricError: Failed to verify clinical safety. Aborting reasoning path.');
    }

    if (!isSafe) {
       throw new SafetyViolation(`CKF Safety Check Failed: ${violations.join(', ')}`);
    }

    return {
      isSafe: true,
      violations: [],
      warnings: input.overallConfidence < 0.6 ? ['Low confidence reasoning'] : []
    };
  }
}

// Stage 8: Decision Synthesis
export class DecisionSynthesisStage implements PipelineStage<{result: ReasoningResult, safety: SafetyAssessment}, DecisionDraft> {
  readonly name = 'DecisionSynthesis';
  async execute(context: ReasoningContext, input: {result: ReasoningResult, safety: SafetyAssessment}): Promise<DecisionDraft> {
    return {
      actions: input.result.inferredActions,
      severity: input.result.overallConfidence > 0.8 ? 'high' : 'routine',
      priority: 'routine',
      confidence: input.result.overallConfidence
    };
  }
}

// Stage 9: Explainability Assembly
export class ExplainabilityAssemblyStage implements PipelineStage<{draft: DecisionDraft, traceId: string}, any> {
  readonly name = 'ExplainabilityAssembly';
  async execute(context: ReasoningContext, input: {draft: DecisionDraft, traceId: string}): Promise<any> {
    return {
      humanReadable: `Generated decision with ${input.draft.actions.length} actions.`,
      traceReference: input.traceId
    };
  }
}

// Stage 10 is implicitly the metric publishing stage, which is usually handled by the orchestrator (pipeline.ts) wrapping these stages.
