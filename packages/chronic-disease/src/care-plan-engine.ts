import { CarePlan, HealthTarget, GoalProgress, Intervention, ConditionRecommendation } from './domain';

export class CarePlanEngine {
  public evaluateProgress(plan: CarePlan, progress: GoalProgress[]): void {
    progress.forEach(p => {
      const target = plan.targets.find(t => t.id === p.targetId);
      if (target) {
        // Evaluate logic
        const achieved = target.operator.includes('<') ? p.currentValue <= target.targetValue : p.currentValue >= target.targetValue;
        p.status = achieved ? 'achieved' : 'lagging';
      }
    });
  }

  public generateUpdates(plan: CarePlan, recommendations: ConditionRecommendation[]): CarePlan {
    const updatedPlan = JSON.parse(JSON.stringify(plan));
    updatedPlan.version += 1;
    updatedPlan.lastUpdated = new Date();
    
    recommendations.forEach(rec => {
      updatedPlan.interventions.push({
        id: crypto.randomUUID(),
        type: 'lifestyle',
        description: rec.recommendation,
        status: 'pending'
      });
    });

    return updatedPlan;
  }
}
