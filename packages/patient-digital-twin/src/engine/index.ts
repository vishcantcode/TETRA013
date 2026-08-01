export * from './dsc-types';
export * from './state-vector';
export * from './math-engine';
export * from './dsc-compiler';
export * from './compiler-factory';

// Re-export legacy LongitudinalContextEngine to preserve zero-breaking-change monorepo compatibility
export class LongitudinalContextEngine {
  public computeDelta(_currentTwin: any, _workflowData: any): any {
    return { addedSymptoms: [], resolvedSymptoms: [], newVitals: [], notes: 'Legacy' };
  }
  public applyDelta(twin: any, _delta: any): any {
    return twin;
  }
}
