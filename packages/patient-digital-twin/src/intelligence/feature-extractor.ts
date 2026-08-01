import { TwinState } from '../domain';
import { MathEngine } from '../engine/math-engine';
import { DerivedFeatures, DerivedFeaturesSchema } from './types';

export class FeatureExtractor {
  /**
   * Deterministically calculates hemodynamic and physiological derived features.
   */
  public static extractFeatures(state: TwinState): DerivedFeatures {
    const sbp = state.vitals.bpSystolic?.value;
    const dbp = state.vitals.bpDiastolic?.value;
    const hr = state.vitals.heartRate?.value;

    let mapVal: number | undefined = undefined;
    let ppVal: number | undefined = undefined;
    let shockIdx: number | undefined = undefined;

    // MAP = DBP + 1/3 (SBP - DBP)
    if (sbp !== undefined && dbp !== undefined) {
      mapVal = Number((dbp + (sbp - dbp) / 3).toFixed(2));
      ppVal = Number((sbp - dbp).toFixed(2));
    }

    // Shock Index = HR / SBP
    if (hr !== undefined && sbp !== undefined && sbp > 0) {
      shockIdx = Number((hr / sbp).toFixed(3));
    }

    // Physiological stability score calculation
    let totalMetrics = 0;
    let normalCount = 0;

    if (hr !== undefined) {
      totalMetrics++;
      if (hr >= 60 && hr <= 100) normalCount++;
    }
    if (sbp !== undefined) {
      totalMetrics++;
      if (sbp >= 90 && sbp <= 140) normalCount++;
    }
    const spo2 = state.vitals.spo2?.value ?? state.vitals.oxygenSaturation?.value;
    if (spo2 !== undefined) {
      totalMetrics++;
      if (spo2 >= 95) normalCount++;
    }

    const compositeVitalStability = totalMetrics > 0 ? Number((normalCount / totalMetrics).toFixed(4)) : 1.0;
    const confidenceWeight = MathEngine.calculateOverallConfidence(state);

    return DerivedFeaturesSchema.parse({
      meanArterialPressure: mapVal,
      pulsePressure: ppVal,
      shockIndex: shockIdx,
      compositeVitalStability,
      confidenceWeight
    });
  }
}
