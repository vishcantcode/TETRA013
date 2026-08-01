import { InputNormalizationEngine, ClinicalContextEngine, ClinicalRuleEngine, TimelineEngine } from '@healthsense/clinical-models';
import { ConfidenceEngine } from '@healthsense/confidence';
import { ExplainabilityEngine } from '@healthsense/explainability';
import { AIOrchestrationEngine } from '../orchestrator';
import { SafetyEngine } from '../safety';
import { DecisionSynthesisEngine, DecisionRecord } from '../synthesis';

export class IntelligencePipeline {
  constructor(
    private normalizer: InputNormalizationEngine,
    private contextEngine: ClinicalContextEngine,
    private ruleEngine: ClinicalRuleEngine,
    private ai: AIOrchestrationEngine,
    private safety: SafetyEngine,
    private confidence: ConfidenceEngine,
    private explainability: ExplainabilityEngine,
    private synthesis: DecisionSynthesisEngine,
    private timeline: TimelineEngine
  ) {}

  async execute(rawInputs: any[], patientProfile: any): Promise<{ decision: DecisionRecord, explanation: any }> {
    // 1. Normalize
    const obs = this.normalizer.normalize(rawInputs);
    // 2. Context
    const context = this.contextEngine.buildContext(patientProfile, obs, []);
    // 3. Rules
    const rules = this.ruleEngine.execute(context);
    // 4. AI
    const aiOutput = await this.ai.evaluate({ context, promptTemplate: 'Analyze the patient' });
    // 5. Safety
    const isSafe = this.safety.validateOutput(aiOutput) && this.safety.checkMissingInformation(context);
    // 6. Confidence
    const conf = this.confidence.evaluate(rules, context.completenessScore, isSafe ? 1.0 : 0.0);
    // 7. Synthesis
    const decision = this.synthesis.synthesize(aiOutput, rules, isSafe, conf);
    // 8. Explainability
    const explanation = this.explainability.generate(decision, rules, conf);
    // 9. Timeline update
    this.timeline.addEvent('decision', decision);

    return { decision, explanation };
  }
}
