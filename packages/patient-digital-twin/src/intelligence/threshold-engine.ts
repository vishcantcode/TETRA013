import { TwinState } from '../domain';
import { ThresholdViolation, ThresholdViolationSchema } from './types';

interface ThresholdRange {
  warningMin: number;
  warningMax: number;
  criticalMin: number;
  criticalMax: number;
}

const VITAL_THRESHOLDS: Record<string, ThresholdRange> = {
  heartRate: { warningMin: 50, warningMax: 110, criticalMin: 40, criticalMax: 130 },
  bpSystolic: { warningMin: 90, warningMax: 140, criticalMin: 80, criticalMax: 160 },
  bpDiastolic: { warningMin: 60, warningMax: 90, criticalMin: 50, criticalMax: 100 },
  spo2: { warningMin: 92, warningMax: 100, criticalMin: 88, criticalMax: 100 },
  respiratoryRate: { warningMin: 12, warningMax: 20, criticalMin: 8, criticalMax: 28 },
  temperature: { warningMin: 36.0, warningMax: 38.0, criticalMin: 35.0, criticalMax: 39.5 }
};

export class ThresholdEngine {
  /**
   * Evaluates current twin state vitals against clinical warning & critical range thresholds.
   */
  public static evaluateThresholds(state: TwinState): ThresholdViolation[] {
    const violations: ThresholdViolation[] = [];
    const timestamp = state.lastTimestamp || new Date().toISOString();

    for (const [metricKey, vital] of Object.entries(state.vitals)) {
      const bounds = VITAL_THRESHOLDS[metricKey];
      if (!bounds) continue;

      const val = vital.value;
      if (val < bounds.criticalMin || val > bounds.criticalMax) {
        violations.push(
          ThresholdViolationSchema.parse({
            metric: metricKey,
            value: val,
            level: 'critical',
            thresholdBound: val < bounds.criticalMin ? bounds.criticalMin : bounds.criticalMax,
            timestamp
          })
        );
      } else if (val < bounds.warningMin || val > bounds.warningMax) {
        violations.push(
          ThresholdViolationSchema.parse({
            metric: metricKey,
            value: val,
            level: 'warning',
            thresholdBound: val < bounds.warningMin ? bounds.warningMin : bounds.warningMax,
            timestamp
          })
        );
      }
    }

    return violations;
  }
}
