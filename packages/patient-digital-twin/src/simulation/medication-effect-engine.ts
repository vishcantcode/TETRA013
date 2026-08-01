import { MedicationState } from '../domain';

export class MedicationEffectEngine {
  /**
   * One-compartment PK elimination concentration curve: C(t) = C0 * exp(-ke * t)
   */
  public static calculateConcentration(
    initialConcentration: number,
    elapsedHours: number,
    halfLifeHours: number
  ): number {
    if (elapsedHours <= 0) return initialConcentration;
    if (halfLifeHours <= 0) return 0.0;
    const ke = Math.LN2 / halfLifeHours;
    return initialConcentration * Math.exp(-ke * elapsedHours);
  }

  /**
   * Sigmoid Emax pharmacodynamic response model: E(t) = (Emax * C^gamma) / (EC50^gamma + C^gamma)
   */
  public static calculateEmaxResponse(
    concentration: number,
    emax: number = 1.0,
    ec50: number = 50.0,
    gamma: number = 1.0
  ): number {
    if (concentration <= 0) return 0.0;
    const cGamma = Math.pow(concentration, gamma);
    const ec50Gamma = Math.pow(ec50, gamma);
    return (emax * cGamma) / (ec50Gamma + cGamma);
  }

  /**
   * Computes the net active medication physiological effect across all active regimens.
   */
  public static computeMedicationEffectVector(medications: MedicationState[]): Float64Array {
    const effectVector = new Float64Array(14);
    for (const med of medications) {
      if (med.active) {
        // Apply systemic blood pressure / heart rate lowering effects
        effectVector[0] -= 0.05; // Heart rate effect
        effectVector[1] -= 0.05; // SBP effect
      }
    }
    return effectVector;
  }
}
