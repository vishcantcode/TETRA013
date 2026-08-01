import { TwinState } from '../domain';
import { DecisionCandidate } from './cdis-types';

export class SafetyValidator {
  /**
   * Evaluates if a decision candidate is clinically contraindicated against current twin state.
   */
  public static isContraindicated(candidate: DecisionCandidate, state: TwinState): boolean {
    const sbp = state.vitals.bpSystolic?.value;

    // Example contraindication rule: Fluid bolus contraindicated in severe fluid overload / pulmonary edema (SBP > 180)
    if (candidate.interventionType === 'fluid_therapy' && sbp !== undefined && sbp > 180) {
      return true;
    }

    return false;
  }
}
