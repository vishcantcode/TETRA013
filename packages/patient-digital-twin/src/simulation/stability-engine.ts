import { TwinState } from '../domain';
import { ClinicalStabilityState } from './hpms-types';

export class StabilityEngine {
  /**
   * Evaluates and classifies current twin state into 7 HPMS clinical stability states.
   */
  public static classifyStability(state: TwinState, previousScore?: number): ClinicalStabilityState {
    const hr = state.vitals.heartRate?.value;
    const sbp = state.vitals.bpSystolic?.value;
    const spo2 = state.vitals.spo2?.value ?? state.vitals.oxygenSaturation?.value;

    let score = 1.0;

    if (hr !== undefined && (hr < 50 || hr > 120)) score -= 0.25;
    if (sbp !== undefined && (sbp < 90 || sbp > 160)) score -= 0.25;
    if (spo2 !== undefined && spo2 < 92) score -= 0.35;

    score = Math.max(0.0, score);

    if (previousScore !== undefined) {
      const delta = score - previousScore;
      if (delta > 0.05) return 'improving';
      if (delta < -0.05) return 'declining';
    }

    if (score >= 0.85) return 'stable';
    if (score >= 0.70) return 'recovering';
    if (score >= 0.50) return 'compensating';
    if (score >= 0.30) return 'decompensating';
    return 'critical';
  }
}
