import { HCOPCapabilityContract } from './contracts';
import { HCOPCapabilityRegistry } from './registry';

export interface HCOPExecutionPlan {
  planId: string;
  workflowName: string;
  executionSteps: HCOPCapabilityContract[];
  dependencyGraph: Record<string, string[]>;
  estimatedCost: number;
}

export class HCOPExecutionPlanner {
  private static instance: HCOPExecutionPlanner;
  private registry = HCOPCapabilityRegistry.getInstance();

  public static getInstance(): HCOPExecutionPlanner {
    if (!HCOPExecutionPlanner.instance) {
      HCOPExecutionPlanner.instance = new HCOPExecutionPlanner();
    }
    return HCOPExecutionPlanner.instance;
  }

  private resolveDependencies(
    capId: string,
    steps: HCOPCapabilityContract[],
    dependencyGraph: Record<string, string[]>,
    visited: Set<string> = new Set()
  ): void {
    if (visited.has(capId)) return;
    visited.add(capId);

    const cap = this.registry.get(capId);
    if (!cap) {
      throw new Error(`HCOP Composition Error: Capability '${capId}' not found in registry.`);
    }

    if (cap.dependencies) {
      dependencyGraph[cap.id] = cap.dependencies;
      for (const depId of cap.dependencies) {
        this.resolveDependencies(depId, steps, dependencyGraph, visited);
      }
    } else {
      dependencyGraph[cap.id] = [];
    }

    if (!steps.some(s => s.id === cap.id)) {
      steps.push(cap);
    }
  }

  public constructPlan(workflowName: string, requestedCapabilityIds: string[]): HCOPExecutionPlan {
    const steps: HCOPCapabilityContract[] = [];
    const dependencyGraph: Record<string, string[]> = {};
    const visited = new Set<string>();

    for (const capId of requestedCapabilityIds) {
      this.resolveDependencies(capId, steps, dependencyGraph, visited);
    }

    return {
      planId: `plan-${Date.now()}`,
      workflowName,
      executionSteps: steps,
      dependencyGraph,
      estimatedCost: steps.length * 1.5
    };
  }
}
