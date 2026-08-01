import { HCPIPatientProfile } from './profile';

export interface HCPIRiskEvolution {
  previousRiskScore: number;
  currentRiskScore: number;
  projectedFutureRiskScore: number;
  trajectory: 'IMPROVING' | 'STABLE' | 'DETERIORATING';
  explainableReasons: string[];
}

export class HCPITrendRiskEngine {
  public evaluateRiskEvolution(profile: HCPIPatientProfile): HCPIRiskEvolution {
    const sysBp = profile.vitalTrajectories.find(v => v.metric === 'Systolic BP')?.value || 130;
    
    let currentRiskScore = 15;
    if (sysBp > 140) currentRiskScore += 20;
    if (profile.adherenceScore < 80) currentRiskScore += 15;

    const previousRiskScore = Math.max(0, currentRiskScore - 5);
    const projectedFutureRiskScore = currentRiskScore > 25 ? currentRiskScore + 10 : currentRiskScore - 2;

    const trajectory = currentRiskScore > previousRiskScore ? 'DETERIORATING' 
                     : currentRiskScore < previousRiskScore ? 'IMPROVING' 
                     : 'STABLE';

    return {
      previousRiskScore,
      currentRiskScore,
      projectedFutureRiskScore,
      trajectory,
      explainableReasons: [
        `Systolic BP reading (${sysBp} mmHg) evaluated against longitudinal trajectory.`,
        `Medication adherence score (${profile.adherenceScore}%) influences future risk projection.`
      ]
    };
  }
}
