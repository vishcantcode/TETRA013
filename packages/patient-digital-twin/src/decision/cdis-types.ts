import { z } from 'zod';
import { TwinState } from '../domain';

/**
 * Goal satisfaction score schema.
 */
export const ClinicalGoalScoreSchema = z.object({
  goalName: z.string(),
  weight: z.number().min(0.0).max(1.0),
  satisfactionScore: z.number().min(0.0).max(1.0),
  priority: z.enum(['critical', 'high', 'medium', 'low'])
});
export type ClinicalGoalScore = z.infer<typeof ClinicalGoalScoreSchema>;

/**
 * Benefit-Risk score schema.
 */
export const BenefitRiskScoreSchema = z.object({
  benefitScore: z.number().min(0.0).max(1.0),
  riskScore: z.number().min(0.0).max(1.0),
  contraindicationPenalty: z.number().default(0.0),
  netClinicalValue: z.number()
});
export type BenefitRiskScore = z.infer<typeof BenefitRiskScoreSchema>;

/**
 * Decision candidate schema.
 */
export const DecisionCandidateSchema = z.object({
  candidateId: z.string(),
  name: z.string(),
  interventionType: z.string(),
  targetState: z.record(z.any()).optional(),
  goalScores: z.array(ClinicalGoalScoreSchema),
  benefitRisk: BenefitRiskScoreSchema,
  isContraindicated: z.boolean().default(false),
  rank: z.number().int().optional()
});
export type DecisionCandidate = z.infer<typeof DecisionCandidateSchema>;

/**
 * Structured explainability proof chain.
 */
export const StructuredExplanationSchema = z.object({
  recommendationId: z.string(),
  candidateId: z.string(),
  netClinicalValue: z.number(),
  benefitScore: z.number(),
  riskScore: z.number(),
  supportingEvidence: z.array(
    z.object({
      metric: z.string(),
      baseline: z.number(),
      projected: z.number(),
      target: z.number()
    })
  ),
  triggeredRules: z.array(z.string()),
  contraindicationsChecked: z.array(z.string()),
  decisionTraceId: z.string().uuid()
});
export type StructuredExplanation = z.infer<typeof StructuredExplanationSchema>;

/**
 * Master Clinical Decision Result payload.
 */
export const ClinicalDecisionResultSchema = z.object({
  patientId: z.string().uuid(),
  timestamp: z.string(),
  version: z.number().int(),
  decisionTraceId: z.string().uuid(),
  topRecommendation: DecisionCandidateSchema,
  rankedCandidates: z.array(DecisionCandidateSchema),
  explanation: StructuredExplanationSchema
});
export type ClinicalDecisionResult = z.infer<typeof ClinicalDecisionResultSchema>;

/**
 * Zod configuration schema for Clinical Decision Engine.
 */
export const ClinicalDecisionConfigurationSchema = z.object({
  alphaRiskPenalty: z.number().default(1.5),
  betaContraindicationPenalty: z.number().default(100.0),
  enableWriteThroughCache: z.boolean().default(true),
  enableAuditLogging: z.boolean().default(true),
  enableKafkaEventPublishing: z.boolean().default(true)
});
export type ClinicalDecisionConfiguration = z.infer<typeof ClinicalDecisionConfigurationSchema>;

/**
 * Authoritative Interface for the Clinical Decision Intelligence Engine (CDIS v1.0).
 */
export interface IClinicalDecisionEngine {
  evaluateDecisions(currentState: TwinState, customCandidates?: DecisionCandidate[]): Promise<ClinicalDecisionResult>;
  rankCandidates(candidates: DecisionCandidate[]): DecisionCandidate[];
  generateExplanation(candidate: DecisionCandidate, state: TwinState, traceId: string): StructuredExplanation;
}
