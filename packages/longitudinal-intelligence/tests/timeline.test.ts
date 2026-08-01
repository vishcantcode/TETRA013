import { describe, it, expect } from 'vitest';
import { TimelineEngine } from '../src/timeline';
import { LongitudinalIntelligenceEngine } from '../src/engine';
import { PatientTwin, HealthSnapshot } from '@healthsense/patient-digital-twin';

describe('Longitudinal Intelligence Engine', () => {
  const testSnapshots: HealthSnapshot[] = [
    {
      version: 1,
      timestamp: new Date('2023-01-01T10:00:00Z'),
      profile: {
        symptoms: [{ id: 's1', symptom: 'headache', resolved: false, date: new Date('2023-01-01T09:00:00Z') }],
        medications: [],
        vitals: [{ id: 'v1', type: 'blood_pressure', value: 140, unit: 'mmHg', date: new Date('2023-01-01T09:30:00Z') }],
        risk: { factors: ['hypertension'], lastUpdated: new Date() },
        lifestyle: { diet: 'poor', exercise: 'none', smoking: false, alcohol: false },
        behavior: { adherenceScore: 50 },
        carePlan: { currentPlanId: '', status: 'completed' },
        goals: { goals: [] }
      },
      clinicalHistory: { encounters: [], pastConditions: [] }
    },
    {
      version: 2,
      timestamp: new Date('2023-02-01T10:00:00Z'),
      profile: {
        symptoms: [{ id: 's1', symptom: 'headache', resolved: true, date: new Date('2023-01-15T09:00:00Z') }],
        medications: [{ id: 'm1', name: 'lisinopril', active: true }],
        vitals: [{ id: 'v2', type: 'blood_pressure', value: 120, unit: 'mmHg', date: new Date('2023-02-01T09:30:00Z') }],
        risk: { factors: ['hypertension'], lastUpdated: new Date() },
        lifestyle: { diet: 'improving', exercise: 'light', smoking: false, alcohol: false },
        behavior: { adherenceScore: 85 },
        carePlan: { currentPlanId: '', status: 'completed' },
        goals: { goals: [] }
      },
      clinicalHistory: { encounters: [], pastConditions: [] }
    }
  ];

  const testTwin = new PatientTwin('pat-123', 3, testSnapshots[1].profile, testSnapshots[1].clinicalHistory, testSnapshots);

  it('should deterministically reconstruct a timeline', () => {
    const engine = new TimelineEngine();
    const timeline = engine.reconstruct(testTwin);
    
    expect(timeline.events.length).toBeGreaterThan(0);
    for (let i = 1; i < timeline.events.length; i++) {
      expect(timeline.events[i].timestamp.getTime()).toBeGreaterThanOrEqual(timeline.events[i - 1].timestamp.getTime());
    }
  });

  it('should generate structured longitudinal insights', () => {
    const engine = new LongitudinalIntelligenceEngine();
    const insights = engine.analyze(testTwin);
    
    expect(insights.length).toBeGreaterThan(0);
    
    const bpTrend = insights.find(i => i.type === 'trend' && (i.payload as any).metric === 'blood_pressure');
    expect(bpTrend).toBeDefined();
    expect((bpTrend?.payload as any).direction).toBe('improving');
  });
});
