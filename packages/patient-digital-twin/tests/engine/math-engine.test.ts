import { describe, it, expect } from 'vitest';
import { MathEngine, createInitialTwinState, createVital } from '../../src';

describe('EWP-007: MathEngine Temporal Decay & Smoothing Tests', () => {
  const patientId = '123e4567-e89b-12d3-a456-426614174000';

  it('calculates exponential temporal confidence decay according to half-life', () => {
    // Initial = 1.0, elapsed = 5 mins (300,000ms), half-life = 5 mins -> 0.5
    const decayed = MathEngine.calculateConfidenceDecay(1.0, 300000, 300000);
    expect(decayed).toBeCloseTo(0.5, 4);

    // Initial = 1.0, elapsed = 10 mins -> 0.25
    const decayed10m = MathEngine.calculateConfidenceDecay(1.0, 600000, 300000);
    expect(decayed10m).toBeCloseTo(0.25, 4);
  });

  it('computes Exponential Moving Average (EMA) state smoothing', () => {
    // Previous = 70, New = 80, elapsed = 300,000ms, tau = 300,000ms
    const ema = MathEngine.calculateEMA(70, 80, 300000, 300000);
    expect(ema).toBeGreaterThan(70);
    expect(ema).toBeLessThan(80);
  });

  it('computes overall confidence across active vitals dictionary', () => {
    const state = createInitialTwinState(patientId);
    state.vitals.heartRate = createVital({
      patientId,
      metric: 'heartRate',
      value: 75,
      unit: 'bpm',
      confidence: 1.0,
      timestamp: new Date().toISOString()
    });

    const conf = MathEngine.calculateOverallConfidence(state);
    expect(conf).toBeCloseTo(1.0, 2);
  });
});
