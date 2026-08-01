export type HIEKLifecycleState = 
  | 'STARTED'
  | 'VALIDATED'
  | 'EXECUTING'
  | 'WAITING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface HIEKLifecycleRecord {
  executionId: string;
  workflowName: string;
  state: HIEKLifecycleState;
  timestamp: Date;
  metadata?: Record<string, any>;
  error?: string;
}

export class HIEKLifecycleTracker {
  private history: HIEKLifecycleRecord[] = [];
  private currentState: HIEKLifecycleState = 'STARTED';

  constructor(
    public readonly executionId: string,
    public readonly workflowName: string
  ) {
    this.transition('STARTED');
  }

  public transition(nextState: HIEKLifecycleState, metadata?: Record<string, any>, error?: string): HIEKLifecycleRecord {
    this.currentState = nextState;
    const record: HIEKLifecycleRecord = {
      executionId: this.executionId,
      workflowName: this.workflowName,
      state: nextState,
      timestamp: new Date(),
      metadata,
      error
    };
    this.history.push(record);
    return record;
  }

  public getCurrentState(): HIEKLifecycleState {
    return this.currentState;
  }

  public getHistory(): HIEKLifecycleRecord[] {
    return [...this.history];
  }
}
