import type { TwinState } from '../domain/twin-state';
import type { IFeatureEngineeringPipeline, PredictiveFeatureVector } from './pais-types';
import { NORMALIZATION_BOUNDS } from './pais-types';
import { LongitudinalFeatureEngine } from './longitudinal-feature-engine';

export class FeatureExtractionEngine implements IFeatureEngineeringPipeline {
  
  /**
   * Clamp-normalizes a value to [0.0, 1.0].
   * @param value - The numerical value to normalize
   * @param min - The minimum bound
   * @param max - The maximum bound
   * @returns The normalized value in the range [0.0, 1.0]
   */
  public static normalize(value: number, min: number, max: number): number {
    if (max === min) return 0.0;
    const normalized = (value - min) / (max - min);
    return Math.max(0.0, Math.min(1.0, normalized));
  }

  /**
   * Extracts an 8-element normalized dense vector from TwinState.
   * Vector layout: [HR, SBP, DBP, SpO2, RR, Temp, Glucose, CompositeRisk].
   * @param state - The TwinState object
   * @param buffer - Optional Float64Array to use for zero allocation
   * @returns The extracted Float64Array feature vector
   */
  public static extractRawVector(state: TwinState, buffer?: Float64Array): Float64Array {
    const vec = buffer ?? new Float64Array(8);
    
    const hr = state.vitals['heartRate']?.value ?? 0.0;
    const sbp = state.vitals['bpSystolic']?.value ?? 0.0;
    const dbp = state.vitals['bpDiastolic']?.value ?? 0.0;
    const spo2 = state.vitals['spo2']?.value ?? 0.0;
    const rr = state.vitals['respiratoryRate']?.value ?? 0.0;
    const temp = state.vitals['temperature']?.value ?? 0.0;
    const glucose = state.vitals['glucose']?.value ?? 0.0;
    const compositeRisk = state.riskScores['compositeRisk']?.score ?? state.riskScores['sepsisNEWS2']?.score ?? 0.0;

    vec[0] = this.normalize(hr, NORMALIZATION_BOUNDS[0]![0], NORMALIZATION_BOUNDS[0]![1]);
    vec[1] = this.normalize(sbp, NORMALIZATION_BOUNDS[1]![0], NORMALIZATION_BOUNDS[1]![1]);
    vec[2] = this.normalize(dbp, NORMALIZATION_BOUNDS[2]![0], NORMALIZATION_BOUNDS[2]![1]);
    vec[3] = this.normalize(spo2, NORMALIZATION_BOUNDS[3]![0], NORMALIZATION_BOUNDS[3]![1]);
    vec[4] = this.normalize(rr, NORMALIZATION_BOUNDS[4]![0], NORMALIZATION_BOUNDS[4]![1]);
    vec[5] = this.normalize(temp, NORMALIZATION_BOUNDS[5]![0], NORMALIZATION_BOUNDS[5]![1]);
    vec[6] = this.normalize(glucose, NORMALIZATION_BOUNDS[6]![0], NORMALIZATION_BOUNDS[6]![1]);
    vec[7] = this.normalize(compositeRisk, NORMALIZATION_BOUNDS[7]![0], NORMALIZATION_BOUNDS[7]![1]);

    return vec;
  }

  /**
   * Computes derived hemodynamic features from a TwinState.
   * @param state - The TwinState object
   * @returns Computed hemodynamic features (MAP, Pulse Pressure, Shock Index)
   */
  public static computeHemodynamicFeatures(state: TwinState): { map: number; pulsePressure: number; shockIndex: number } {
    const hr = state.vitals['heartRate']?.value ?? 0.0;
    const sbp = state.vitals['bpSystolic']?.value ?? 0.0;
    const dbp = state.vitals['bpDiastolic']?.value ?? 0.0;

    const map = dbp + (1.0 / 3.0) * (sbp - dbp);
    const pulsePressure = sbp - dbp;
    const shockIndex = sbp !== 0.0 ? hr / sbp : 0.0;

    return { map, pulsePressure, shockIndex };
  }

  /**
   * Orchestrates the full feature extraction pipeline.
   * @param state - The current TwinState object
   * @param history - Optional history of previous TwinState objects
   * @returns The complete PredictiveFeatureVector
   */
  public static extractFeatures(state: TwinState, history?: ReadonlyArray<TwinState>): PredictiveFeatureVector {
    const rawVectorBuf = this.extractRawVector(state);
    const rawVector = Array.from(rawVectorBuf);
    
    const hemo = this.computeHemodynamicFeatures(state);
    
    let olsSlope = 0.0;
    let velocity = 0.0;
    let acceleration = 0.0;

    if (history !== undefined && history.length > 0) {
      // Using heartRate as the representative metric for longitudinal stats
      const stats = LongitudinalFeatureEngine.computeWindowStats(history, 'heartRate');
      olsSlope = stats.slope;
      velocity = stats.velocity;
      acceleration = stats.acceleration;
    }

    return {
      patientId: state.patientId,
      timestamp: new Date(state.lastTimestamp).getTime(),
      rawVector,
      meanArterialPressure: hemo.map,
      pulsePressure: hemo.pulsePressure,
      shockIndex: hemo.shockIndex,
      olsSlope,
      velocity,
      acceleration,
      compositeVitalStability: 1.0,
      overallConfidence: 1.0,
      featureVersion: '1.0.0'
    };
  }

  /**
   * Instance method implementation of IFeatureEngineeringPipeline.extractRawVector
   * @param state - The TwinState object
   * @param buffer - Optional Float64Array to use for zero allocation
   * @returns The extracted Float64Array feature vector
   */
  public extractRawVector(state: TwinState, buffer?: Float64Array): Float64Array {
    return FeatureExtractionEngine.extractRawVector(state, buffer);
  }

  /**
   * Instance method implementation of IFeatureEngineeringPipeline.extractFeatures
   * @param state - The current TwinState object
   * @param history - Optional history of previous TwinState objects
   * @returns The complete PredictiveFeatureVector
   */
  public extractFeatures(state: TwinState, history?: ReadonlyArray<TwinState>): PredictiveFeatureVector {
    return FeatureExtractionEngine.extractFeatures(state, history);
  }
}
