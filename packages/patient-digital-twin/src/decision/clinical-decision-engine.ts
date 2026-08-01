import { TwinState } from '../domain';
import { IKafkaProducer } from '../events';
import { RedisStateCache } from '../cache/redis-state-cache';
import { TwinRepository } from '../repository/twin.repository';
import {
  IClinicalDecisionEngine,
  ClinicalDecisionConfiguration,
  ClinicalDecisionConfigurationSchema,
  DecisionCandidate,
  ClinicalDecisionResult,
  ClinicalDecisionResultSchema,
  StructuredExplanation
} from './cdis-types';
import { GoalEvaluator } from './goal-evaluator';
import { BenefitRiskAnalyzer } from './benefit-risk-analyzer';
import { SafetyValidator } from './safety-validator';
import { RecommendationRanker } from './recommendation-ranker';
import { ExplainabilityEngine } from './explainability-engine';
import { TraceabilityEngine } from './traceability-engine';
import { DecisionPublisher } from './decision-publisher';

export class ClinicalDecisionEngine implements IClinicalDecisionEngine {
  private config: ClinicalDecisionConfiguration;
  private publisher: DecisionPublisher;

  constructor(
    config?: Partial<ClinicalDecisionConfiguration>,
    _twinRepo?: TwinRepository,
    _stateCache?: RedisStateCache,
    kafkaProducer?: IKafkaProducer
  ) {
    this.config = ClinicalDecisionConfigurationSchema.parse(config || {});
    this.publisher = new DecisionPublisher(kafkaProducer);
  }

  public async evaluateDecisions(
    currentState: TwinState,
    customCandidates?: DecisionCandidate[]
  ): Promise<ClinicalDecisionResult> {
    const traceId = TraceabilityEngine.generateTraceId();

    // 1. Candidate Generation / Defaulter
    const candidatesToEvaluate: DecisionCandidate[] = customCandidates || [
      {
        candidateId: 'cand_standard_care',
        name: 'Standard Monitoring & Protocol Maintenance',
        interventionType: 'monitoring',
        goalScores: [],
        benefitRisk: { benefitScore: 0, riskScore: 0, contraindicationPenalty: 0, netClinicalValue: 0 },
        isContraindicated: false
      },
      {
        candidateId: 'cand_fluid_bolus_500ml',
        name: 'IV Crystalloid Fluid Bolus (500mL)',
        interventionType: 'fluid_therapy',
        goalScores: [],
        benefitRisk: { benefitScore: 0, riskScore: 0, contraindicationPenalty: 0, netClinicalValue: 0 },
        isContraindicated: false
      }
    ];

    // 2. Goal Evaluation, Safety & MCDA Scoring
    const goalScores = GoalEvaluator.evaluateGoals(currentState);

    const evaluatedCandidates: DecisionCandidate[] = candidatesToEvaluate.map((cand) => {
      const isContra = SafetyValidator.isContraindicated(cand, currentState);
      const benefitRisk = BenefitRiskAnalyzer.calculateNetClinicalValue(
        goalScores,
        0.05,
        isContra,
        this.config.alphaRiskPenalty,
        this.config.betaContraindicationPenalty
      );
      return {
        ...cand,
        goalScores,
        benefitRisk,
        isContraindicated: isContra
      };
    });

    // 3. Deterministic Ranking
    const rankedCandidates = this.rankCandidates(evaluatedCandidates);
    const topRecommendation = rankedCandidates[0];

    // 4. Generate Explainability Proof Chain
    const explanation = this.generateExplanation(topRecommendation, currentState, traceId);

    // 5. Construct Result Payload
    const result = ClinicalDecisionResultSchema.parse({
      patientId: currentState.patientId,
      timestamp: currentState.lastTimestamp || new Date().toISOString(),
      version: currentState.version,
      decisionTraceId: traceId,
      topRecommendation,
      rankedCandidates,
      explanation
    });

    // 6. Event Publishing
    if (this.config.enableKafkaEventPublishing) {
      await this.publisher.publishDecision(result);
    }

    return result;
  }

  public rankCandidates(candidates: DecisionCandidate[]): DecisionCandidate[] {
    return RecommendationRanker.rankCandidates(candidates);
  }

  public generateExplanation(
    candidate: DecisionCandidate,
    state: TwinState,
    traceId: string
  ): StructuredExplanation {
    return ExplainabilityEngine.generateExplanation(candidate, state, traceId);
  }
}
