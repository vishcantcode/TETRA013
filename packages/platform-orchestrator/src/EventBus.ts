import { WorkflowEventType, WorkflowEventPayload } from './WorkflowEvents';

export type EventListener = (event: WorkflowEventPayload) => Promise<void> | void;

export class EventBus {
  private listeners = new Map<WorkflowEventType, EventListener[]>();

  public subscribe(eventType: WorkflowEventType, listener: EventListener): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(listener);
  }

  public async publish(event: WorkflowEventPayload): Promise<void> {
    const eventListeners = this.listeners.get(event.eventType) || [];
    for (const listener of eventListeners) {
      try {
        await listener(event);
      } catch (err) {
        console.error(`[EventBus Error on ${event.eventType}]:`, err);
      }
    }
  }
}

export const orchestratorEventBus = new EventBus();
