import { describe, it, expect } from 'vitest';
import { ForecastEngine } from '../../src/predictive/forecast-engine';
import { TwinState } from '../../src/domain/twin-state';

describe('ForecastEngine', () => {
  const createState = (hr: number): TwinState => ({
    patientId: '1',
    version: 1,
    status: 'steady',
    vitals: {
      heartRate: { metric: 'heartRate', value: hr, unit: 'bpm', confidence: 1.0, halfLifeMs: 300000, timestamp: new Date().toISOString() }
    },
    biomarkers: {},
    medications: [],
    riskScores: {},
    conditions: [],
    lastTimestamp: new Date().toISOString()
  });

  it('forecastVital() returns ForecastResult', () => {
    const engine = new ForecastEngine();
    const result = engine.forecastVital([createState(70), createState(75)], 'heartRate', 4);
    expect(result).toBeDefined();
    expect(result.metric).toBe('heartRate');
    expect(result.horizonHours).toBe(4);
  });

  it('forecastVital() points length equals horizonHours', () => {
    const engine = new ForecastEngine();
    const result = engine.forecastVital([createState(70), createState(75)], 'heartRate', 4);
    expect(result.points.length).toBe(4);
  });

  it('forecastVital() confidence decays over time', () => {
    const engine = new ForecastEngine();
    const result = engine.forecastVital([createState(70), createState(75)], 'heartRate', 4);
    const boundsHour1 = result.points[0].upperBound - result.points[0].lowerBound;
    const boundsHour4 = result.points[3].upperBound - result.points[3].lowerBound;
    expect(boundsHour4).toBeGreaterThan(boundsHour1);
  });

  it('forecastVital() rising trend detected when slope > 0', () => {
    const engine = new ForecastEngine();
    const result = engine.forecastVital([createState(60), createState(70), createState(80)], 'heartRate', 2);
    expect(result.trend).toBe('rising');
  });

  it('forecastVital() stable when flat data', () => {
    const engine = new ForecastEngine();
    const result = engine.forecastVital([createState(75), createState(75), createState(75)], 'heartRate', 2);
    expect(result.trend).toBe('stable');
  });

  it('forecastRisk() delegates to forecastVital with compositeRisk metric', () => {
    const engine = new ForecastEngine();
    // Mock risk by inserting a compositeRisk vital manually for testing
    const state1 = createState(70);
    const state2 = createState(80);
    state1.riskScores['compositeRisk'] = { riskType: 'compositeRisk', score: 0.2, trend: 'stable', confidence: 1, evidenceIds: [], timestamp: '' };
    state2.riskScores['compositeRisk'] = { riskType: 'compositeRisk', score: 0.4, trend: 'rising', confidence: 1, evidenceIds: [], timestamp: '' };
    
    const result = engine.forecastRisk([state1, state2], 'compositeRisk', 4);
    expect(result.metric).toBe('compositeRisk');
    expect(result.trend).toBe('rising');
  });
});
