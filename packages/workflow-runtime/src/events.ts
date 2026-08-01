export interface BaseEvent {
  type: string;
  timestamp: Date;
  correlationId: string;
  payload: any;
}

export type EventCallback = (event: BaseEvent) => void;

export class EventBus {
  private subscribers = new Map<string, EventCallback[]>();

  subscribe(eventType: string, callback: EventCallback) {
    if (!this.subscribers.has(eventType)) this.subscribers.set(eventType, []);
    this.subscribers.get(eventType)!.push(callback);
  }

  publish(event: BaseEvent) {
    const callbacks = this.subscribers.get(event.type) || [];
    callbacks.forEach(cb => {
      try { cb(event); } catch(e) { console.error('Event error', e); }
    });
  }
}
