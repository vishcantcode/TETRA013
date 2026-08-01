import { WorkflowDefinition, WorkflowContext, WorkflowResult } from './types';
import { WorkflowStateMachine } from './state-machine';
import { ExecutionPolicy } from './policies';
import { EventBus } from './events';

export class WorkflowExecutor {
  constructor(
    private stateMachine: WorkflowStateMachine,
    private policy: ExecutionPolicy,
    private eventBus: EventBus
  ) {}

  async execute(definition: WorkflowDefinition, context: WorkflowContext): Promise<WorkflowResult<any>> {
    const startTime = Date.now();
    try {
      this.stateMachine.transition(context, 'INITIALIZED');
      this.stateMachine.transition(context, 'COLLECTING_INPUTS');
      
      let currentData = context.data;
      
      for(const step of definition.steps) {
        if (step.onBeforeExecute) {
          step.onBeforeExecute(context);
        }
        
        currentData = await this.policy.execute(() => step.execute(context, currentData));

        if (step.onAfterExecute) {
          step.onAfterExecute(context);
        }
      }

      this.stateMachine.transition(context, 'POST_PROCESSING');
      this.stateMachine.transition(context, 'PERSISTING');
      this.stateMachine.transition(context, 'COMPLETED');

      this.eventBus.publish({ type: 'WorkflowCompleted', timestamp: new Date(), correlationId: context.correlationId, payload: { duration: Date.now() - startTime } });

      return { success: true, state: context.currentState, data: currentData };
    } catch (error: any) {
      this.stateMachine.transition(context, 'FAILED');
      this.eventBus.publish({ type: 'WorkflowFailed', timestamp: new Date(), correlationId: context.correlationId, payload: { error: error.message } });
      return { success: false, state: context.currentState, error };
    }
  }
}
