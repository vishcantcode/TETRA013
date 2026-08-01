import { HUSEEntityType, HUSE_LIFECYCLE_GRAPHS } from './lifecycles';
import { HIEKEventBus, HIEKContext } from '@healthsense/hiek';
import { pool } from '@healthsense/db';

export interface HUSETransitionRecord {
  id: string;
  entityType: HUSEEntityType;
  entityId: string;
  fromState: string;
  toState: string;
  actorId?: string | null;
  correlationId?: string;
  executionId?: string;
  reason?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

let transitionSeq = 0;

export class HUSETransitionEngine {
  private static instance: HUSETransitionEngine;
  private currentStates: Map<string, string> = new Map();
  private transitionHistory: HUSETransitionRecord[] = [];
  private eventBus = HIEKEventBus.getInstance();

  public static getInstance(): HUSETransitionEngine {
    if (!HUSETransitionEngine.instance) {
      HUSETransitionEngine.instance = new HUSETransitionEngine();
    }
    return HUSETransitionEngine.instance;
  }

  private getEntityKey(entityType: HUSEEntityType, entityId: string): string {
    return `${entityType}:${entityId}`;
  }

  public getCurrentState(entityType: HUSEEntityType, entityId: string, initialState?: string): string {
    const key = this.getEntityKey(entityType, entityId);
    if (!this.currentStates.has(key) && initialState) {
      this.currentStates.set(key, initialState);
    }
    return this.currentStates.get(key) || initialState || 'INITIAL';
  }

  public async transition(options: {
    entityType: HUSEEntityType;
    entityId: string;
    toState: string;
    initialState?: string;
    context?: HIEKContext;
    reason?: string;
    metadata?: Record<string, any>;
  }): Promise<HUSETransitionRecord> {
    const { entityType, entityId, toState, initialState, context, reason, metadata } = options;
    const key = this.getEntityKey(entityType, entityId);
    const fromState = this.getCurrentState(entityType, entityId, initialState);

    // Skip redundant same-state transitions
    if (fromState === toState) {
      return {
        id: `tx-${Date.now()}-${++transitionSeq}`,
        entityType,
        entityId,
        fromState,
        toState,
        timestamp: new Date(),
        reason: 'No-op transition (already in target state)'
      };
    }

    // Validate transition against state graph
    const allowedGraph = HUSE_LIFECYCLE_GRAPHS[entityType];
    const allowedNextStates = allowedGraph ? allowedGraph[fromState] : null;

    if (allowedNextStates && !allowedNextStates.includes(toState)) {
      throw new Error(`Invalid HUSE State Transition for ${entityType}:${entityId}: Cannot transition from '${fromState}' to '${toState}'. Allowed next states: [${allowedNextStates.join(', ')}]`);
    }

    // Update in-memory state
    this.currentStates.set(key, toState);

    const record: HUSETransitionRecord = {
      id: `tx-${Date.now()}-${++transitionSeq}`,
      entityType,
      entityId,
      fromState,
      toState,
      actorId: context?.user?.id || null,
      correlationId: context?.correlationId,
      executionId: context?.executionId,
      reason,
      timestamp: new Date(),
      metadata
    };

    this.transitionHistory.push(record);

    // Non-blocking async DB insertion
    pool.query(
      `INSERT INTO huse_state_transitions (id, entity_type, entity_id, from_state, to_state, actor_id, correlation_id, execution_id, reason, metadata) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        record.id,
        entityType,
        entityId,
        fromState,
        toState,
        record.actorId,
        record.correlationId || null,
        record.executionId || null,
        reason || null,
        JSON.stringify(metadata || {})
      ]
    ).catch(() => {});

    // Publish state event via HIEK Event Bus if context provided
    if (context) {
      this.eventBus.publish('AssessmentCompleted' as any, context, { entityType, entityId, fromState, toState }).catch(() => {});
    }

    return record;
  }

  public getHistory(entityType?: HUSEEntityType, entityId?: string): HUSETransitionRecord[] {
    if (entityType && entityId) {
      return this.transitionHistory.filter(h => h.entityType === entityType && h.entityId === entityId);
    }
    return [...this.transitionHistory];
  }

  public clearHistory(): void {
    this.currentStates.clear();
    this.transitionHistory = [];
  }
}
