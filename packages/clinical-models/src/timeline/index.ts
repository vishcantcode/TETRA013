export interface TimelineEvent {
  id: string;
  type: string;
  timestamp: Date;
  details: any;
}

export class TimelineEngine {
  private events: TimelineEvent[] = [];

  addEvent(type: string, details: any) {
    this.events.push({ id: crypto.randomUUID(), type, timestamp: new Date(), details });
  }

  getChronological(): TimelineEvent[] {
    return this.events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
}
