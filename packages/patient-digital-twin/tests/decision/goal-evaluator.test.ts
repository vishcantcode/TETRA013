import { describe, it, expect } from 'vitest';
import { GoalEvaluator, createInitialTwinState, createVital } from '../../src';

describe('EWP-011: GoalEvaluator Goal Satisfaction Tests', () => {
  const patientId = '123e4567-e89b-12d3-a456-426614174000';

  it('evaluates 5 CDIS clinical goal satisfaction scores accurately', () => {
    const state = createInitialTwinState(patientId);
    state.vitals.heartRate = createVital({ patientId, metric: 'heartRate', value: 72, unit: 'bpm' });
    state.vitals.bpSystolic = createVital({ patientId, metric: 'bpSystolic', value: 120, unit: 'mmHg' });
    state.vitals.bpDiastolic = createVital({ patientId, metric: 'bpDiastolic', value: 80, unit: 'mmHg' });
    state.vitals.spo2 = createVital({ patientId, metric: 'spo2', value: 98, unit: '%' });

    const goals = GoalEvaluator.evaluateGoals(state);

    expect(goals.length).toBe(5);
    // All vitals within optimal range -> satisfaction scores === 1.0
    expect(goals.every((g) => g.satisfactionScore === 1.0)).toBe(true);
  });
});
