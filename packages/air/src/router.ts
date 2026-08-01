import { hiek, HIEKContext, HIEKExecutionResponse, createHIEKContext } from '@healthsense/hiek';
import { AIRClassifier, AIRClassification } from './classifier';
import { AIRRoutingDecision, AIRStrategyType } from './strategies';
import { AIRClinicalCache } from './cache';

export interface AIRRequest<TInput = any, TOutput = any> {
  workflowName: string;
  context?: HIEKContext;
  input?: TInput;
  handler: (input: TInput, ctx: HIEKContext) => Promise<TOutput>;
  ttlSeconds?: number;
}

export interface AIRResponse<TOutput = any> {
  executionId: string;
  correlationId: string;
  workflowName: string;
  status: 'COMPLETED' | 'FAILED' | 'CANCELLED';
  data?: TOutput;
  error?: string;
  durationMs: number;
  routingDecision: AIRRoutingDecision;
  classification: AIRClassification;
}

export class AdaptiveIntelligenceRouter {
  private static instance: AdaptiveIntelligenceRouter;
  private cache = AIRClinicalCache.getInstance();

  public static getInstance(): AdaptiveIntelligenceRouter {
    if (!AdaptiveIntelligenceRouter.instance) {
      AdaptiveIntelligenceRouter.instance = new AdaptiveIntelligenceRouter();
    }
    return AdaptiveIntelligenceRouter.instance;
  }

  public async routeAndExecute<TInput = any, TOutput = any>(
    req: AIRRequest<TInput, TOutput>
  ): Promise<AIRResponse<TOutput>> {
    const startTime = Date.now();
    const ctx = req.context || createHIEKContext();
    const classification = AIRClassifier.classify(req.workflowName, req.input);

    let strategy: AIRStrategyType = 'DIRECT';
    let rationale = 'Default direct execution path selected.';
    let cacheKey: string | undefined;

    if (classification.isCacheable) {
      cacheKey = this.cache.generateKey(req.workflowName, ctx.patientId, req.input);
      const cachedData = this.cache.get<TOutput>(cacheKey);

      if (cachedData !== null) {
        strategy = 'CACHED';
        rationale = 'Cache hit: Serving previously computed deterministic result.';

        return {
          executionId: ctx.executionId,
          correlationId: ctx.correlationId,
          workflowName: req.workflowName,
          status: 'COMPLETED',
          data: cachedData,
          durationMs: Date.now() - startTime,
          classification,
          routingDecision: {
            strategy,
            rationale,
            cacheKey,
            cacheHit: true,
            aiInferenceRequested: false,
            estimatedLatencySavingMs: 45
          }
        };
      }
    }

    if (classification.requiresAI) {
      strategy = 'AI_ASSISTED';
      rationale = 'Complex clinical reasoning or decision synthesis required AI-assisted execution strategy.';
    } else {
      strategy = 'DIRECT';
      rationale = 'Low/Medium complexity operational request routed directly through HIEK kernel.';
    }

    const hiekResponse: HIEKExecutionResponse<TOutput> = await hiek.execute({
      workflowName: req.workflowName,
      context: ctx,
      input: req.input,
      handler: req.handler
    });

    if (hiekResponse.status === 'COMPLETED' && classification.isCacheable && cacheKey && hiekResponse.data) {
      this.cache.set(cacheKey, ctx.patientId, hiekResponse.data, req.ttlSeconds || 60);
    }

    return {
      executionId: hiekResponse.executionId,
      correlationId: hiekResponse.correlationId,
      workflowName: hiekResponse.workflowName,
      status: hiekResponse.status,
      data: hiekResponse.data,
      error: hiekResponse.error,
      durationMs: Date.now() - startTime,
      classification,
      routingDecision: {
        strategy,
        rationale,
        cacheKey,
        cacheHit: false,
        aiInferenceRequested: classification.requiresAI,
        estimatedLatencySavingMs: 0
      }
    };
  }

  public getCache(): AIRClinicalCache {
    return this.cache;
  }
}

export const air = AdaptiveIntelligenceRouter.getInstance();
