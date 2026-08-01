import { HUSEEntityType } from './lifecycles';
import { HUSETransitionEngine, HUSETransitionRecord } from './transitions';
import { air, AIRResponse } from '@healthsense/air';
import { hpie, HPIEEvaluationResult } from '@healthsense/hpie';
import { createHIEKContext, HIEKContext } from '@healthsense/hiek';

export interface HUSEWorkflowRequest<TInput = any, TOutput = any> {
  entityType: HUSEEntityType;
  entityId: string;
  workflowName: string;
  initialState?: string;
  completedState?: string;
  failedState?: string;
  requiredRole?: 'patient' | 'clinician' | 'admin';
  confidenceScore?: number;
  context?: HIEKContext;
  input?: TInput;
  handler: (input: TInput, ctx: HIEKContext) => Promise<TOutput>;
  ttlSeconds?: number;
}

export interface HUSEResponse<TOutput = any> extends AIRResponse<TOutput> {
  entityType: HUSEEntityType;
  entityId: string;
  fromState: string;
  currentState: string;
  transitionRecord?: HUSETransitionRecord;
  policyEvaluation?: HPIEEvaluationResult;
  requiresHumanApproval?: boolean;
}

export class HealthSenseUnifiedStateEngine {
  private static instance: HealthSenseUnifiedStateEngine;
  private transitionEngine = HUSETransitionEngine.getInstance();

  public static getInstance(): HealthSenseUnifiedStateEngine {
    if (!HealthSenseUnifiedStateEngine.instance) {
      HealthSenseUnifiedStateEngine.instance = new HealthSenseUnifiedStateEngine();
    }
    return HealthSenseUnifiedStateEngine.instance;
  }

  public async executeStatefulWorkflow<TInput = any, TOutput = any>(
    req: HUSEWorkflowRequest<TInput, TOutput>
  ): Promise<HUSEResponse<TOutput>> {
    const startTime = Date.now();
    const ctx = req.context || createHIEKContext();

    const defaultInitialState = req.initialState || 'INITIALIZED';
    const defaultCompletedState = req.completedState || 'COMPLETED';
    const defaultFailedState = req.failedState || 'FAILED';

    const fromState = this.transitionEngine.getCurrentState(req.entityType, req.entityId, defaultInitialState);

    // 1. HPIE Policy Governance Evaluation
    const policyEvaluation = await hpie.evaluate(ctx, {
      requiredRole: req.requiredRole,
      confidenceScore: req.confidenceScore
    });

    if (policyEvaluation.decisionOutcome === 'DENY') {
      return {
        executionId: ctx.executionId,
        correlationId: ctx.correlationId,
        workflowName: req.workflowName,
        status: 'FAILED',
        error: `Policy Denied: ${policyEvaluation.rationale}`,
        durationMs: Date.now() - startTime,
        entityType: req.entityType,
        entityId: req.entityId,
        fromState,
        currentState: fromState,
        policyEvaluation,
        classification: { category: 'ADMINISTRATION', complexity: 'LOW', requiresAI: false, isCacheable: false, priority: 'HIGH' },
        routingDecision: { strategy: 'DIRECT', rationale: 'Halted by HPIE Policy Governance Deny decision.' }
      };
    }

    // 2. Transition State to Active State
    let activeState = 'IN_PROGRESS';
    if (req.entityType === 'CLINICAL_WORKFLOW') activeState = 'RUNNING';
    if (req.entityType === 'MEDICAL_REPORT') activeState = 'STORED';

    let transitionRecord: HUSETransitionRecord | undefined;
    try {
      transitionRecord = await this.transitionEngine.transition({
        entityType: req.entityType,
        entityId: req.entityId,
        toState: activeState,
        initialState: fromState,
        context: ctx,
        reason: `Executing stateful workflow: ${req.workflowName}`
      });
    } catch (err) {
      // Fallback
    }

    // 3. Execute via AIR + HIEK
    const airResponse: AIRResponse<TOutput> = await air.routeAndExecute({
      workflowName: req.workflowName,
      context: ctx,
      input: req.input,
      handler: req.handler,
      ttlSeconds: req.ttlSeconds
    });

    let currentState = activeState;

    if (airResponse.status === 'COMPLETED') {
      try {
        transitionRecord = await this.transitionEngine.transition({
          entityType: req.entityType,
          entityId: req.entityId,
          toState: defaultCompletedState,
          initialState: activeState,
          context: ctx,
          reason: `Workflow completed successfully: ${req.workflowName}`
        });
        currentState = defaultCompletedState;
      } catch (err) {
        currentState = defaultCompletedState;
      }
    } else {
      try {
        transitionRecord = await this.transitionEngine.transition({
          entityType: req.entityType,
          entityId: req.entityId,
          toState: defaultFailedState,
          initialState: activeState,
          context: ctx,
          reason: `Workflow execution failed: ${airResponse.error}`
        });
        currentState = defaultFailedState;
      } catch (err) {
        currentState = defaultFailedState;
      }
    }

    return {
      ...airResponse,
      entityType: req.entityType,
      entityId: req.entityId,
      fromState,
      currentState,
      transitionRecord,
      policyEvaluation,
      requiresHumanApproval: policyEvaluation.decisionOutcome === 'REQUIRES_APPROVAL'
    };
  }

  public getTransitionEngine(): HUSETransitionEngine {
    return this.transitionEngine;
  }
}

export const huse = HealthSenseUnifiedStateEngine.getInstance();
