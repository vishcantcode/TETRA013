import { Patient, VitalsRecord, SimulationVariables, Horizon } from '../types';

/**
 * SimulationEngine provides deterministic placeholder simulations of disease progression
 * based on adjustable lifestyle and medication variables over a given time horizon.
 *
 * All outputs are *estimated* and expressed using language such as "Estimated" or "Projected".
 */
export class SimulationEngine {
  /** Run simulation for the given patient */
  runSimulation(
    patient: Patient,
    variables: SimulationVariables,
    horizon: Horizon,
  ): SimulationResult {
    // Deep copy patient vitals to avoid mutating original
    const baseVitals = { ...patient.vitals };
    const baseHistory = patient.vitalsHistory ?? [];

    // Scenario A: No Intervention (use current vitals as baseline)
    const scenarioA = this.computeScenario(baseVitals, variables, horizon, false, false);

    // Scenario B: Lifestyle Only (apply lifestyle changes, no medication adjustments)
    const scenarioB = this.computeScenario(baseVitals, variables, horizon, true, false);

    // Scenario C: Medication + Lifestyle (apply both lifestyle and medication changes)
    const scenarioC = this.computeScenario(baseVitals, variables, horizon, true, true);

    return {
      scenarioA,
      scenarioB,
      scenarioC,
    };
  }

  /** Compute a single scenario */
  private computeScenario(
    vitals: any,
    vars: SimulationVariables,
    horizon: Horizon,
    applyLifestyle: boolean,
    applyMedication: boolean,
  ): ScenarioResult {
    // Clone vitals
    const pred = { ...vitals } as any;

    // Simple deterministic adjustments per month
    const months = horizon;
    const factor = months / 12; // scale adjustments proportionally

    // Weight & BMI
    if (applyLifestyle && vars.weight !== undefined) {
      const weightChange = vars.weight - (vitals.weightKg ?? 0);
      pred.weightKg = (vitals.weightKg ?? 0) + weightChange * factor;
      // Approximate BMI change assuming fixed height (height factor cancels out)
      pred.bmi = (vitals.bmi ?? 0) + (weightChange * 0.1) * factor;
    }

    // Exercise (minutes per week) reduces BP modestly
    if (applyLifestyle && vars.exercise !== undefined) {
      const bpReduction = (vars.exercise / 60) * 0.5; // 0.5 mmHg per hour of exercise per month
      pred.bpSystolic = (vitals.bpSystolic ?? 0) - bpReduction * factor;
      pred.bpDiastolic = (vitals.bpDiastolic ?? 0) - (bpReduction * 0.6) * factor;
    }

    // Diet quality (0-100) influences LDL and HbA1c
    if (applyLifestyle && vars.dietScore !== undefined) {
      const ldlReduction = (vars.dietScore / 100) * 10; // up to 10 mg/dL reduction
      pred.ldl = (vitals.ldl ?? 0) - ldlReduction * factor;
      const hba1cReduction = (vars.dietScore / 100) * 0.3; // up to 0.3% reduction
      pred.hba1c = (vitals.hba1c ?? 0) - hba1cReduction * factor;
    }

    // Medication changes (placeholder: assume metformin lowers HbA1c by 1% per year)
    if (applyMedication && vars.medicationChanges?.length) {
      const hasMetformin = vars.medicationChanges.some((m) => m.toLowerCase().includes('metformin'));
      if (hasMetformin) {
        const hba1cMedReduction = 1.0 * factor; // 1% per year scaled
        pred.hba1c = (pred.hba1c ?? vitals.hba1c ?? 0) - hba1cMedReduction;
      }
    }

    // Smoking, Alcohol, Sleep, Stress – affect risk scores indirectly
    const riskModifiers = this.computeRiskModifiers(vars, applyLifestyle, applyMedication);

    // Assemble predictions map
    const predictions = {
      hba1c: this.round(pred.hba1c),
      bpSystolic: this.round(pred.bpSystolic),
      bpDiastolic: this.round(pred.bpDiastolic),
      bmi: this.round(pred.bmi),
      ldl: this.round(pred.ldl),
      ckdRisk: this.estimateCkdRisk(pred, riskModifiers),
      cvdRisk: this.estimateCvdRisk(pred, riskModifiers),
      strokeRisk: this.estimateStrokeRisk(pred, riskModifiers),
      diabetesRisk: this.estimateDiabetesRisk(pred, riskModifiers),
    };

    // Compute risk reduction compared to baseline (patient's current riskScore approximated as avg of individual risks)
    const baseline = this.computeBaselineRisk(vitals);
    const newRisk = (predictions.ckdRisk + predictions.cvdRisk + predictions.strokeRisk + predictions.diabetesRisk) / 4;
    const riskReduction = this.round(((baseline - newRisk) / baseline) * 100);

    // Complication prevention placeholder – same as risk reduction
    const complicationPrevention = riskReduction;

    // Timeline info – just echo selected horizon
    const timeline = { horizonMonths: horizon };

    const label = applyMedication ? 'Medication + Lifestyle' : applyLifestyle ? 'Lifestyle Only' : 'No Intervention';

    return {
      label,
      predictions,
      riskReduction,
      complicationPrevention,
      timeline,
    } as ScenarioResult;
  }

  /** Compute risk modifiers based on lifestyle variables */
  private computeRiskModifiers(
    vars: SimulationVariables,
    applyLifestyle: boolean,
    applyMedication: boolean,
  ) {
    let modifier = 0;
    if (applyLifestyle) {
      if (vars.smoking === 'Continued') modifier += 10;
      if (vars.alcohol === 'Heavy') modifier += 5;
      if (vars.sleepHours !== undefined) {
        if (vars.sleepHours < 6) modifier += 5;
        else if (vars.sleepHours > 9) modifier -= 2;
      }
      if (vars.stressLevel === 'High') modifier += 8;
    }
    if (applyMedication) {
      // placeholder negative modifier for effective meds
      modifier -= 5;
    }
    return modifier;
  }

  private round(value: number | undefined): number {
    return value !== undefined ? Math.round(value * 10) / 10 : 0;
  }

  private computeBaselineRisk(vitals: any): number {
    // Simple average of existing risk related vitals (placeholder)
    const scores = [];
    if (vitals.hba1c) scores.push(vitals.hba1c * 2); // weight HbA1c
    if (vitals.ldl) scores.push(vitals.ldl * 0.3);
    if (vitals.bpSystolic) scores.push(vitals.bpSystolic * 0.2);
    if (vitals.bmi) scores.push(vitals.bmi * 0.5);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length || 0;
    // Normalize to 0-100 scale
    return Math.min(100, Math.max(0, avg));
  }

  private estimateCkdRisk(pred: any, mod: number): number {
    const base = (pred.creatinine ?? 0) * 5 + (pred.egfr ?? 0) * -0.2;
    return this.clampRisk(base + mod);
  }

  private estimateCvdRisk(pred: any, mod: number): number {
    const base = (pred.ldl ?? 0) * 0.4 + (pred.bpSystolic ?? 0) * 0.1;
    return this.clampRisk(base + mod);
  }

  private estimateStrokeRisk(pred: any, mod: number): number {
    const base = (pred.bpSystolic ?? 0) * 0.07 + (pred.hba1c ?? 0) * 0.5;
    return this.clampRisk(base + mod);
  }

  private estimateDiabetesRisk(pred: any, mod: number): number {
    const base = (pred.hba1c ?? 0) * 8 + (pred.bmi ?? 0) * 1.2;
    return this.clampRisk(base + mod);
  }

  private clampRisk(val: number): number {
    return Math.min(100, Math.max(0, Math.round(val)));
  }
}

/** Types exported for public use */
export interface SimulationResult {
  scenarioA: ScenarioResult;
  scenarioB: ScenarioResult;
  scenarioC: ScenarioResult;
}

export interface ScenarioResult {
  label: string;
  predictions: {
    hba1c?: number;
    bpSystolic?: number;
    bpDiastolic?: number;
    bmi?: number;
    ldl?: number;
    ckdRisk?: number;
    cvdRisk?: number;
    strokeRisk?: number;
    diabetesRisk?: number;
  };
  riskReduction: number; // percentage improvement over baseline
  complicationPrevention: number;
  timeline: { horizonMonths: Horizon };
}
