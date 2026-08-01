import { z } from 'zod';
import { ConfidenceScoreSchema } from './vital';

/**
 * Directional trend of evaluated clinical risk score.
 */
export const RiskTrendSchema = z.enum(['rising', 'stable', 'falling']);
export type RiskTrend = z.infer<typeof RiskTrendSchema>;

/**
 * Evaluated clinical outcome risk score model.
 */
export const RiskScoreSchema = z.object({
  id: z.string().uuid('RiskScore ID must be a valid UUIDv4'),
  patientId: z.string().uuid('Patient ID must be a valid UUIDv4'),
  riskType: z.string().min(1, 'Risk type is required'),
  score: z.number().min(0.0).max(1.0, 'Risk score must be between 0.0 and 1.0'),
  trend: RiskTrendSchema.default('stable'),
  confidence: ConfidenceScoreSchema,
  evidenceIds: z.array(z.string()).default([]),
  timestamp: z.string().datetime('Timestamp must be an ISO 8601 string')
});
export type RiskScore = z.infer<typeof RiskScoreSchema>;

/**
 * Input DTO for creating a new RiskScore.
 */
export const CreateRiskScoreInputSchema = z.object({
  id: z.string().uuid().optional(),
  patientId: z.string().uuid('Patient ID must be a valid UUIDv4'),
  riskType: z.string().min(1, 'Risk type is required'),
  score: z.number().min(0.0).max(1.0),
  trend: RiskTrendSchema.optional().default('stable'),
  confidence: ConfidenceScoreSchema.optional().default(1.0),
  evidenceIds: z.array(z.string()).optional().default([]),
  timestamp: z.string().datetime('Timestamp must be an ISO 8601 string').optional()
});
export type CreateRiskScoreInput = z.infer<typeof CreateRiskScoreInputSchema>;

/**
 * Validates raw data against RiskScoreSchema. Throws ZodError on failure.
 */
export function validateRiskScore(data: unknown): RiskScore {
  return RiskScoreSchema.parse(data);
}

/**
 * Safely parses raw data against RiskScoreSchema. Returns null on failure.
 */
export function parseRiskScore(data: unknown): RiskScore | null {
  const result = RiskScoreSchema.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * Factory function to construct a verified RiskScore entity.
 */
export function createRiskScore(input: CreateRiskScoreInput): RiskScore {
  const validated = CreateRiskScoreInputSchema.parse(input);
  return RiskScoreSchema.parse({
    ...validated,
    id: validated.id || crypto.randomUUID(),
    timestamp: validated.timestamp || new Date().toISOString()
  });
}
