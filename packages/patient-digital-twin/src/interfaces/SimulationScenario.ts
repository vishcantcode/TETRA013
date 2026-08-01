export interface SimulationInputs {
  hba1cDelta?: number;         // e.g. -1.0%
  systolicBPDelta?: number;    // e.g. -10 mmHg
  bmiDelta?: number;           // e.g. -2.0 kg/m2
  quitSmoking?: boolean;
  increasePhysicalActivity?: boolean;
}

export interface SimulationResult {
  isSimulation: true;
  inputs: SimulationInputs;
  baselineRiskScore: number;
  simulatedRiskScore: number;
  riskReductionPercentage: number;
  baselineTier: 'low' | 'moderate' | 'high' | 'severe';
  simulatedTier: 'low' | 'moderate' | 'high' | 'severe';
  clinicalImpactSummary: string;
}
