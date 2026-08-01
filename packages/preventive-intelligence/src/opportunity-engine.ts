import { HealthOpportunity, RiskAssessment } from './domain';

function extractProfile(twin: any): any {
  if (twin?.profile) return twin.profile;
  if (twin?.state?.profile) return twin.state.profile;
  if (twin?.state) return twin.state;
  return {};
}

export class HealthOpportunityEngine {
  public identifyOpportunities(twin: any, risk: RiskAssessment): HealthOpportunity[] {
    const opportunities: HealthOpportunity[] = [];
    const profile = extractProfile(twin);
    const lifestyle = profile.lifestyle || {};

    if (risk.score.overallRisk > 50) {
      opportunities.push({
        id: crypto.randomUUID(),
        type: 'reassessment',
        priority: 'high',
        title: 'Immediate Clinical Review',
        description: 'Risk score exceeds safe baseline. Schedule clinician review.',
        potentialBenefit: 'Prevent acute clinical event.'
      });
    }

    if (lifestyle.smoking) {
      opportunities.push({
        id: crypto.randomUUID(),
        type: 'lifestyle',
        priority: 'medium',
        title: 'Smoking Cessation Program',
        description: 'Enroll in behavioral cessation coaching.',
        potentialBenefit: 'Reduce cardiovascular and respiratory risk by 40%.'
      });
    }

    return opportunities;
  }
}
