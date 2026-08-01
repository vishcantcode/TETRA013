import { z } from 'zod';

/**
 * Derived clinical features schema calculated from TwinState.
 */
export const DerivedFeaturesSchema = z.object({
  meanArterialPressure: z.number().optional(), // MAP = DBP + 1/3 (SBP - DBP)
  pulsePressure: z.number().optional(),        // PP = SBP - DBP
  shockIndex: z.number().optional(),           // SI = HR / SBP
  temperatureGradient: z.number().optional(),
  glucoseVariability: z.number().optional(),   // StdDev or MAD of glucose
  bpVariability: z.number().optional(),        // StdDev or MAD of SBP
  compositeVitalStability: z.number().min(0.0).max(1.0).default(1.0),
  confidenceWeight: z.number().min(0.0).max(1.0).default(1.0)
});
export type DerivedFeatures = z.infer<typeof DerivedFeaturesSchema>;

/**
 * Biomarker intelligence analysis results.
 */
export const BiomarkerInsightSchema = z.object({
  loincCode: z.string(),
  name: z.string(),
  currentValue: z.number(),
  baselineValue: z.number(),
  deltaFromBaseline: z.number(),
  percentChange: z.number(),
  velocity: z.number(),     // dy/dt
  acceleration: z.number(), // d2y/dt2
  isPeak: z.boolean().default(false),
  isPlateau: z.boolean().default(false),
  isRecovery: z.boolean().default(false),
  isReversal: z.boolean().default(false)
});
export type BiomarkerInsight = z.infer<typeof BiomarkerInsightSchema>;

/**
 * Risk score intelligence analysis results.
 */
export const RiskInsightSchema = z.object({
  compositeRiskScore: z.number().min(0.0).max(1.0),
  compositeMedicationRisk: z.number().min(0.0).max(1.0),
  compositeBiomarkerRisk: z.number().min(0.0).max(1.0),
  compositePhysiologicalRisk: z.number().min(0.0).max(1.0),
  patientStabilityScore: z.number().min(0.0).max(1.0),
  riskDelta: z.number(),
  riskAcceleration: z.number()
});
export type RiskInsight = z.infer<typeof RiskInsightSchema>;

/**
 * Clinical threshold violation status.
 */
export const ThresholdViolationSchema = z.object({
  metric: z.string(),
  value: z.number(),
  level: z.enum(['normal', 'warning', 'critical']),
  thresholdBound: z.number(),
  timestamp: z.string()
});
export type ThresholdViolation = z.infer<typeof ThresholdViolationSchema>;

/**
 * Structured clinical summary payload (100% structured data).
 */
export const ClinicalSummarySchema = z.object({
  patientId: z.string().uuid(),
  timestamp: z.string(),
  version: z.number().int(),
  physiologicalStability: z.number().min(0.0).max(1.0),
  overallConfidence: z.number().min(0.0).max(1.0),
  derivedFeatures: DerivedFeaturesSchema,
  riskInsight: RiskInsightSchema,
  violations: z.array(ThresholdViolationSchema),
  mostUnstableSystems: z.array(z.string()),
  significantTrends: z.array(z.string())
});
export type ClinicalSummary = z.infer<typeof ClinicalSummarySchema>;
