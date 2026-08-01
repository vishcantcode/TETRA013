import { HIEKContext } from './context';
import { pool } from '@healthsense/db';

export type HIEKDomainEventType = 
  | 'PatientRegistered'
  | 'AssessmentStarted'
  | 'AssessmentCompleted'
  | 'ClinicalReasoningCompleted'
  | 'DecisionGenerated'
  | 'ReportCreated'
  | 'NotificationSent'
  | 'MedicationEnrolled'
  | 'CarePlanCreated'
  | 'RecordUploaded';

export interface HIEKDomainEvent {
  id: string;
  eventType: HIEKDomainEventType;
  executionId: string;
  correlationId: string;
  patientId: string | null;
  payload: any;
  timestamp: Date;
}

export type HIEKEventSubscriber = (event: HIEKDomainEvent) => Promise<void> | void;

export class HIEKEventBus {
  private static instance: HIEKEventBus;
  private subscribers: Map<string, HIEKEventSubscriber[]> = new Map();
  private eventLog: HIEKDomainEvent[] = [];

  public static getInstance(): HIEKEventBus {
    if (!HIEKEventBus.instance) {
      HIEKEventBus.instance = new HIEKEventBus();
    }
    return HIEKEventBus.instance;
  }

  public subscribe(eventType: HIEKDomainEventType | '*', handler: HIEKEventSubscriber): void {
    const list = this.subscribers.get(eventType) || [];
    list.push(handler);
    this.subscribers.set(eventType, list);
  }

  public async publish(eventType: HIEKDomainEventType, ctx: HIEKContext, payload: any): Promise<HIEKDomainEvent> {
    const event: HIEKDomainEvent = {
      id: crypto.randomUUID(),
      eventType,
      executionId: ctx.executionId,
      correlationId: ctx.correlationId,
      patientId: ctx.patientId,
      payload,
      timestamp: new Date()
    };

    this.eventLog.push(event);

    // Non-blocking async persistence to analytics_events table
    pool.query(
      `INSERT INTO analytics_events (event_name, category, user_role, anonymized_session_id, payload) VALUES ($1, $2, $3, $4, $5)`,
      [eventType, 'domain_event', ctx.user?.role || 'system', ctx.correlationId, JSON.stringify({ executionId: ctx.executionId, payload })]
    ).catch(() => {});

    // Trigger subscribers
    const handlers = [...(this.subscribers.get(eventType) || []), ...(this.subscribers.get('*') || [])];
    for (const fn of handlers) {
      try {
        await fn(event);
      } catch (err) {
        console.error(`[HIEK Event Subscriber Error] ${eventType}:`, err);
      }
    }

    return event;
  }

  public getEventHistory(): HIEKDomainEvent[] {
    return [...this.eventLog];
  }

  public clearHistory(): void {
    this.eventLog = [];
  }
}
