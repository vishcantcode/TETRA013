import { IEventHandler } from './event-router';
import { EventEnvelope } from './event-models';
import { TwinState, Vital } from '../domain';
import { TwinRepository } from '../repository/twin.repository';
import { VitalTelemetryRepository } from '../repository/vital-telemetry.repository';
import { RedisStateCache } from '../cache/redis-state-cache';
import { CacheInvalidationManager } from '../cache/cache-invalidation-manager';

/**
 * Handler processing twin state update events.
 * Persists to PostgreSQL master schema and updates Redis hot-state cache.
 */
export class TwinStateUpdateHandler implements IEventHandler<TwinState> {
  private twinRepo: TwinRepository;
  private stateCache: RedisStateCache;

  constructor(twinRepo: TwinRepository, stateCache: RedisStateCache) {
    this.twinRepo = twinRepo;
    this.stateCache = stateCache;
  }

  public async handle(envelope: EventEnvelope<TwinState>): Promise<void> {
    const state = envelope.payload;
    const saved = await this.twinRepo.saveTwin(state);
    await this.stateCache.setTwinState(saved);
  }
}

/**
 * Handler processing high-frequency physiological vital sign telemetry ingestion.
 * Bulk inserts into TimescaleDB vitals_telemetry hypertable and updates Redis vitals cache.
 */
export class VitalIngestionHandler implements IEventHandler<Vital[]> {
  private vitalTelemetryRepo: VitalTelemetryRepository;
  private stateCache: RedisStateCache;

  constructor(vitalTelemetryRepo: VitalTelemetryRepository, stateCache: RedisStateCache) {
    this.vitalTelemetryRepo = vitalTelemetryRepo;
    this.stateCache = stateCache;
  }

  public async handle(envelope: EventEnvelope<Vital[]>): Promise<void> {
    const vitals = envelope.payload;
    if (vitals.length === 0) return;

    // 1. Bulk insert to TimescaleDB
    await this.vitalTelemetryRepo.bulkInsertVitals(vitals);

    // 2. Update Redis vitals cache
    const patientId = vitals[0].patientId;
    const existingCache = (await this.stateCache.getVitalsCache(patientId)) || {};
    for (const v of vitals) {
      existingCache[v.metric] = v;
    }
    await this.stateCache.setVitalsCache(patientId, existingCache);
  }
}

/**
 * Handler processing explicit twin cache invalidation events.
 */
export class CacheInvalidationHandler implements IEventHandler<{ patientId: string }> {
  private invalidationManager: CacheInvalidationManager;

  constructor(invalidationManager: CacheInvalidationManager) {
    this.invalidationManager = invalidationManager;
  }

  public async handle(envelope: EventEnvelope<{ patientId: string }>): Promise<void> {
    const { patientId } = envelope.payload;
    await this.invalidationManager.invalidatePatientAll(patientId);
  }
}
