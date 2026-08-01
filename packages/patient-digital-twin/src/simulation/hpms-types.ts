import { z } from 'zod';
import { TwinState } from '../domain';

/**
 * 7 Clinical Stability States specified in HPMS v1.0.
 */
export const ClinicalStabilityStateSchema = z.enum([
  'stable',
  'improving',
  'recovering',
  'compensating',
  'declining',
  'decompensating',
  'critical'
]);
export type ClinicalStabilityState = z.infer<typeof ClinicalStabilityStateSchema>;

/**
 * Zod schema for Physiological Model Configuration.
 */
export const PhysiologicalModelConfigurationSchema = z.object({
  defaultTimeStepMs: z.number().int().positive().default(3600000), // 1 hour timestep
  homeostaticRateConstant: z.number().positive().default(0.1),
  enableWriteThroughCache: z.boolean().default(true),
  enableAuditLogging: z.boolean().default(true),
  enableKafkaEventPublishing: z.boolean().default(true)
});
export type PhysiologicalModelConfiguration = z.infer<typeof PhysiologicalModelConfigurationSchema>;

/**
 * Authoritative Interface for the Physiological Model & Trajectory Engine (HPMS v1.0).
 */
export interface IPhysiologicalModel {
  /**
   * Evolves a TwinState forward by deltaTimeMs using Euler integration.
   */
  evolveState(currentState: TwinState, deltaTimeMs: number): Promise<TwinState>;

  /**
   * Projects a forward trajectory over K steps with stepIntervalMs intervals.
   */
  projectTrajectory(currentState: TwinState, steps: number, stepIntervalMs: number): Promise<TwinState[]>;

  /**
   * Evaluates the deterministic clinical stability classification of a TwinState.
   */
  evaluateStability(state: TwinState): ClinicalStabilityState;
}
