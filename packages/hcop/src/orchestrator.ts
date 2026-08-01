import { HCOPCapabilityRegistry } from './registry';
import { HCOPExecutionPlanner, HCOPExecutionPlan } from './planner';
import { huse, HUSEEntityType } from '@healthsense/huse';
import { createHIEKContext, HIEKContext } from '@healthsense/hiek';

export interface HCOPCompositionRequest {
  workflowName: string;
  entityType: HUSEEntityType;
  entityId: string;
  requestedCapabilities: string[];
  context?: HIEKContext;
  input?: any;
}

export interface HCOPCompositionResponse {
  plan: HCOPExecutionPlan;
  status: 'COMPLETED' | 'FAILED';
  stepResults: Record<string, any>;
  durationMs: number;
}

export class HealthSenseCapabilityOrchestrationPlatform {
  private static instance: HealthSenseCapabilityOrchestrationPlatform;
  private registry = HCOPCapabilityRegistry.getInstance();
  private planner = HCOPExecutionPlanner.getInstance();

  public static getInstance(): HealthSenseCapabilityOrchestrationPlatform {
    if (!HealthSenseCapabilityOrchestrationPlatform.instance) {
      HealthSenseCapabilityOrchestrationPlatform.instance = new HealthSenseCapabilityOrchestrationPlatform();
    }
    return HealthSenseCapabilityOrchestrationPlatform.instance;
  }

  public async executeComposition(req: HCOPCompositionRequest): Promise<HCOPCompositionResponse> {
    const startTime = Date.now();
    const ctx = req.context || createHIEKContext();

    const plan = this.planner.constructPlan(req.workflowName, req.requestedCapabilities);
    const stepResults: Record<string, any> = {};

    let currentInput = req.input || {};

    for (const step of plan.executionSteps) {
      const huseRes = await huse.executeStatefulWorkflow({
        entityType: req.entityType,
        entityId: req.entityId,
        workflowName: `${req.workflowName}:${step.id}`,
        context: ctx,
        input: currentInput,
        handler: (inp, c) => step.handler(inp, c)
      });

      if (huseRes.status === 'FAILED') {
        return {
          plan,
          status: 'FAILED',
          stepResults,
          durationMs: Date.now() - startTime
        };
      }

      stepResults[step.id] = huseRes.data;
      currentInput = { ...currentInput, ...huseRes.data };
    }

    return {
      plan,
      status: 'COMPLETED',
      stepResults,
      durationMs: Date.now() - startTime
    };
  }

  public getRegistry(): HCOPCapabilityRegistry {
    return this.registry;
  }

  public getPlanner(): HCOPExecutionPlanner {
    return this.planner;
  }
}

export const hcop = HealthSenseCapabilityOrchestrationPlatform.getInstance();
