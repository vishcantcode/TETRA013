export type AIRStrategyType = 
  | 'DIRECT'
  | 'CACHED'
  | 'AI_ASSISTED'
  | 'ASYNC_BACKGROUND'
  | 'BATCHED'
  | 'REPLAY';

export interface AIRRoutingDecision {
  strategy: AIRStrategyType;
  rationale: string;
  cacheKey?: string;
  cacheHit?: boolean;
  aiInferenceRequested?: boolean;
  estimatedLatencySavingMs?: number;
}
