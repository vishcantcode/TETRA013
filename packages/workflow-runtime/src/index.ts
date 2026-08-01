export * from './types';
export * from './events';
export * from './state-machine';
export * from './session';
export * from './registry';
export * from './policies';
export * from './executor';

import { WorkflowRegistry } from './registry';
import { WorkflowSessionManager } from './session';
import { WorkflowStateMachine } from './state-machine';
import { EventBus } from './events';
import { WorkflowExecutor } from './executor';
import { RetryPolicy } from './policies';
import crypto from 'crypto';

// Core Runtime Facade
export class WorkflowRuntime {
  public registry = new WorkflowRegistry();
  public sessions = new WorkflowSessionManager();
  public eventBus = new EventBus();
  public stateMachine = new WorkflowStateMachine(this.eventBus);
  public defaultPolicy = new RetryPolicy();
  
  public executor = new WorkflowExecutor(this.stateMachine, this.defaultPolicy, this.eventBus);

  async executeWorkflow(name: string, context: any) {
    const definition = this.registry.get(name);
    this.sessions.create(context);
    return await this.executor.execute(definition, context);
  }

  async startSession(name: string, initialData: any) {
    const context: any = {
      workflowId: name,
      sessionId: crypto.randomUUID(),
      patientId: initialData?.patientId || 'anonymous',
      correlationId: crypto.randomUUID(),
      featureFlags: {},
      locale: 'en-US',
      timezone: 'UTC',
      executionMode: 'sync' as const,
      connectivityState: 'online' as const,
      workflowVersion: '1.0.0',
      capabilityMetadata: {},
      permissions: [],
      requestMetadata: {},
      auditMetadata: {},
      currentState: 'CREATED',
      data: initialData
    };
    return this.sessions.create(context);
  }

  async executeStep(sessionId: string, stepName: string, payload: any) {
    const session = this.sessions.get(sessionId);
    if (!session) return { data: null, error: `Session ${sessionId} not found` };
    return { data: { step: stepName, status: 'COMPLETED', payload }, error: null };
  }
}
