import { TwinState } from '../domain';

interface Range { min: number; max: number; }

const SAFETY_BOUNDS: Record<string, Range> = {
  heartRate: { min: 20.0, max: 260.0 },
  bpSystolic: { min: 40.0, max: 280.0 },
  bpDiastolic: { min: 20.0, max: 180.0 },
  spo2: { min: 40.0, max: 100.0 },
  respiratoryRate: { min: 4.0, max: 70.0 },
  temperature: { min: 28.0, max: 44.0 }
};

export class ConstraintEngine {
  /**
   * Clamps vital metric values strictly within physiological safety bounds.
   */
  public static enforceSafetyBounds(state: TwinState): TwinState {
    const nextState: TwinState = JSON.parse(JSON.stringify(state));

    for (const [metricKey, vital] of Object.entries(nextState.vitals)) {
      const bounds = SAFETY_BOUNDS[metricKey];
      if (bounds && vital) {
        vital.value = Math.max(bounds.min, Math.min(bounds.max, vital.value));
      }
    }

    return nextState;
  }
}
