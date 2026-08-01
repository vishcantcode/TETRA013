import { TwinState, TwinStateVector } from '../domain';

interface MetricBounds {
  min: number;
  max: number;
}

const METRIC_BOUNDS: Record<string, MetricBounds> = {
  heartRate: { min: 30.0, max: 220.0 },
  bpSystolic: { min: 60.0, max: 240.0 },
  bpDiastolic: { min: 40.0, max: 140.0 },
  spo2: { min: 50.0, max: 100.0 },
  oxygenSaturation: { min: 50.0, max: 100.0 },
  respiratoryRate: { min: 6.0, max: 60.0 },
  temperature: { min: 30.0, max: 45.0 },
  bodyTemperature: { min: 30.0, max: 45.0 },
  glucose: { min: 20.0, max: 600.0 },
  bloodGlucose: { min: 20.0, max: 600.0 }
};

const STATIC_VECTOR_BUFFER = new Float64Array(8);

export class StateVectorEngine {
  public static normalize(value: number, min: number, max: number): number {
    if (max <= min) return 0.0;
    const norm = (value - min) / (max - min);
    return Math.max(0.0, Math.min(1.0, norm));
  }

  /**
   * Fast 0-allocation numerical Float64Array extraction.
   */
  public static extractRawFloat64Vector(state: TwinState, targetBuffer?: Float64Array): Float64Array {
    const vec = targetBuffer || (targetBuffer === undefined ? new Float64Array(8) : STATIC_VECTOR_BUFFER);

    // Index 0: Heart Rate [30.0, 220.0]
    const hr = state.vitals.heartRate?.value;
    vec[0] = hr !== undefined ? this.normalize(hr, METRIC_BOUNDS.heartRate.min, METRIC_BOUNDS.heartRate.max) : 0.0;

    // Index 1: Systolic BP [60.0, 240.0]
    const sys = state.vitals.bpSystolic?.value;
    vec[1] = sys !== undefined ? this.normalize(sys, METRIC_BOUNDS.bpSystolic.min, METRIC_BOUNDS.bpSystolic.max) : 0.0;

    // Index 2: Diastolic BP [40.0, 140.0]
    const dia = state.vitals.bpDiastolic?.value;
    vec[2] = dia !== undefined ? this.normalize(dia, METRIC_BOUNDS.bpDiastolic.min, METRIC_BOUNDS.bpDiastolic.max) : 0.0;

    // Index 3: Oxygen Saturation / SpO2 [50.0, 100.0]
    const spo2 = state.vitals.spo2?.value ?? state.vitals.oxygenSaturation?.value;
    vec[3] = spo2 !== undefined ? this.normalize(spo2, METRIC_BOUNDS.spo2.min, METRIC_BOUNDS.spo2.max) : 0.0;

    // Index 4: Respiratory Rate [6.0, 60.0]
    const rr = state.vitals.respiratoryRate?.value;
    vec[4] = rr !== undefined ? this.normalize(rr, METRIC_BOUNDS.respiratoryRate.min, METRIC_BOUNDS.respiratoryRate.max) : 0.0;

    // Index 5: Temperature [30.0, 45.0]
    const temp = state.vitals.temperature?.value ?? state.vitals.bodyTemperature?.value;
    vec[5] = temp !== undefined ? this.normalize(temp, METRIC_BOUNDS.temperature.min, METRIC_BOUNDS.temperature.max) : 0.0;

    // Index 6: Glucose [20.0, 600.0]
    const bg = state.vitals.glucose?.value ?? state.vitals.bloodGlucose?.value;
    vec[6] = bg !== undefined ? this.normalize(bg, METRIC_BOUNDS.glucose.min, METRIC_BOUNDS.glucose.max) : 0.0;

    // Index 7: Composite Risk [0.0, 1.0]
    const risk = state.riskScores.compositeRisk?.score ?? state.riskScores.cardiovascular?.score ?? 0.0;
    vec[7] = Math.max(0.0, Math.min(1.0, risk));

    return vec;
  }

  /**
   * Constructs the structured TwinStateVector object matching TwinStateVectorSchema.
   */
  public static extractVector(state: TwinState): TwinStateVector {
    const raw = this.extractRawFloat64Vector(state);
    return {
      patientId: state.patientId,
      version: state.version,
      timestamp: new Date(state.lastTimestamp).getTime(),
      vectorValues: Array.from(raw)
    };
  }
}
