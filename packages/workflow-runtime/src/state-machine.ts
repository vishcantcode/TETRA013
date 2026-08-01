import { WorkflowState, WorkflowContext } from './types';
import { EventBus } from './events';

export class WorkflowStateMachine {
  private readonly validTransitions: Record<WorkflowState, WorkflowState[]> = {
    'CREATED': ['INITIALIZED', 'FAILED', 'CANCELLED'],
    'INITIALIZED': ['COLLECTING_INPUTS', 'FAILED', 'CANCELLED'],
    'COLLECTING_INPUTS': ['VALIDATING', 'FAILED', 'CANCELLED'],
    'VALIDATING': ['READY_FOR_KERNEL', 'COLLECTING_INPUTS', 'FAILED', 'CANCELLED'],
    'READY_FOR_KERNEL': ['KERNEL_EXECUTION', 'FAILED', 'CANCELLED'],
    'KERNEL_EXECUTION': ['POST_PROCESSING', 'FAILED', 'CANCELLED'],
    'POST_PROCESSING': ['PERSISTING', 'FAILED', 'CANCELLED'],
    'PERSISTING': ['COMPLETED', 'FAILED', 'CANCELLED'],
    'COMPLETED': [],
    'FAILED': ['INITIALIZED', 'COLLECTING_INPUTS'], // Recovery
    'CANCELLED': []
  };

  constructor(private eventBus: EventBus) {}

  transition(context: WorkflowContext, to: WorkflowState): void {
    const from = context.currentState;
    if (!this.validTransitions[from].includes(to)) {
      throw new Error(`Illegal transition from ${from} to ${to}`);
    }
    context.currentState = to;
    this.eventBus.publish({
      type: 'WorkflowTransitioned',
      timestamp: new Date(),
      correlationId: context.correlationId,
      payload: { from, to, sessionId: context.sessionId }
    });
  }
}
