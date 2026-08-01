import { HealthOpportunity, PreventiveRecommendation } from './domain';

export class PreventiveRecommendationEngine {
  public generateRecommendations(opportunities: HealthOpportunity[]): PreventiveRecommendation[] {
    return opportunities.map(opp => ({
      id: crypto.randomUUID(),
      action: opp.title,
      confidence: opp.priority === 'high' ? 0.98 : 0.85,
      evidence: ['Preventive Task Force Guidelines'],
      explanation: {
        patient: `We recommend ${opp.title} because ${opp.potentialBenefit.toLowerCase()}`,
        clinician: `Recommendation driven by priority ${opp.priority} opportunity: ${opp.description}`
      }
    }));
  }
}
