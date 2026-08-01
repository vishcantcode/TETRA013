import { TwinState } from '../domain';
import { FeatureExtractor } from '../intelligence/feature-extractor';
import { ClinicalGoalScore, ClinicalGoalScoreSchema } from './cdis-types';

export class GoalEvaluator {
  /**
   * Deterministically evaluates state satisfaction across 5 CDIS clinical goals.
   */
  public static evaluateGoals(state: TwinState): ClinicalGoalScore[] {
    const derived = FeatureExtractor.extractFeatures(state);
    const hr = state.vitals.heartRate?.value;
    const spo2 = state.vitals.spo2?.value ?? state.vitals.oxygenSaturation?.value;
    const rr = state.vitals.respiratoryRate?.value;

    const goalScores: ClinicalGoalScore[] = [];

    // 1. Maintain Perfusion: MAP >= 65.0 (Weight 0.25)
    const mapVal = derived.meanArterialPressure ?? 70.0;
    const perfusionScore = mapVal >= 65.0 ? 1.0 : Math.max(0.0, mapVal / 65.0);
    goalScores.push(
      ClinicalGoalScoreSchema.parse({
        goalName: 'Maintain Perfusion',
        weight: 0.25,
        satisfactionScore: Number(perfusionScore.toFixed(4)),
        priority: 'critical'
      })
    );

    // 2. Ensure Oxygenation: SpO2 >= 95.0 % (Weight 0.25)
    const oxygenationScore = spo2 !== undefined ? (spo2 >= 95.0 ? 1.0 : Math.max(0.0, spo2 / 95.0)) : 1.0;
    goalScores.push(
      ClinicalGoalScoreSchema.parse({
        goalName: 'Ensure Oxygenation',
        weight: 0.25,
        satisfactionScore: Number(oxygenationScore.toFixed(4)),
        priority: 'critical'
      })
    );

    // 3. Prevent Tachycardia: HR <= 100 bpm (Weight 0.15)
    const hrScore = hr !== undefined ? (hr <= 100 ? 1.0 : Math.max(0.0, 1.0 - (hr - 100) / 100)) : 1.0;
    goalScores.push(
      ClinicalGoalScoreSchema.parse({
        goalName: 'Prevent Tachycardia',
        weight: 0.15,
        satisfactionScore: Number(hrScore.toFixed(4)),
        priority: 'high'
      })
    );

    // 4. Stabilize Respiration: RR between 12 and 20 (Weight 0.15)
    const respScore = rr !== undefined ? (rr >= 12 && rr <= 20 ? 1.0 : 0.6) : 1.0;
    goalScores.push(
      ClinicalGoalScoreSchema.parse({
        goalName: 'Stabilize Respiration',
        weight: 0.15,
        satisfactionScore: Number(respScore.toFixed(4)),
        priority: 'high'
      })
    );

    // 5. Minimize Risk Score (Weight 0.20)
    const riskScore = derived.compositeVitalStability;
    goalScores.push(
      ClinicalGoalScoreSchema.parse({
        goalName: 'Minimize Risk Score',
        weight: 0.20,
        satisfactionScore: Number(riskScore.toFixed(4)),
        priority: 'medium'
      })
    );

    return goalScores;
  }
}
