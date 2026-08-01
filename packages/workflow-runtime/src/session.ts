import { WorkflowContext } from './types';

export class WorkflowSessionManager {
  private sessions = new Map<string, WorkflowContext>();

  create(context: WorkflowContext): string {
    if (this.sessions.has(context.sessionId)) throw new Error('Session exists');
    this.sessions.set(context.sessionId, context);
    return context.sessionId;
  }

  get(sessionId: string): WorkflowContext {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');
    return session;
  }

  cancel(sessionId: string): void {
    const session = this.get(sessionId);
    session.currentState = 'CANCELLED';
  }
}
