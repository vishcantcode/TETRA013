import { IDynamicStateCompiler, CompilerConfiguration, CompilerConfigurationSchema } from './dsc-types';
import { StateVectorEngine } from './state-vector';
import { MathEngine } from './math-engine';
import { TwinState, TwinStateVector, createInitialTwinState, validateVital } from '../domain';
import { EventEnvelope, PatientTwinTopics, createEventEnvelope, IKafkaProducer } from '../events';
import { TwinRepository } from '../repository/twin.repository';
import { VitalTelemetryRepository } from '../repository/vital-telemetry.repository';
import { RedisStateCache } from '../cache/redis-state-cache';

export class DynamicStateCompiler implements IDynamicStateCompiler {
  private config: CompilerConfiguration;
  private twinRepo?: TwinRepository;
  private vitalTelemetryRepo?: VitalTelemetryRepository;
  private stateCache?: RedisStateCache;
  private kafkaProducer?: IKafkaProducer;

  constructor(
    config?: Partial<CompilerConfiguration>,
    twinRepo?: TwinRepository,
    vitalTelemetryRepo?: VitalTelemetryRepository,
    stateCache?: RedisStateCache,
    kafkaProducer?: IKafkaProducer
  ) {
    this.config = CompilerConfigurationSchema.parse(config || {});
    this.twinRepo = twinRepo;
    this.vitalTelemetryRepo = vitalTelemetryRepo;
    this.stateCache = stateCache;
    this.kafkaProducer = kafkaProducer;
  }

  public async compile(patientId: string, events: EventEnvelope<any>[]): Promise<TwinState> {
    const sortedEvents = [...events].sort(
      (a, b) => new Date(a.metadata.timestamp).getTime() - new Date(b.metadata.timestamp).getTime()
    );

    let state = createInitialTwinState(patientId);

    for (const event of sortedEvents) {
      state = await this.applyEventToState(state, event);
    }

    await this.persistAndPublish(state);
    return state;
  }

  public async update(currentState: TwinState, newEvent: EventEnvelope<any>): Promise<TwinState> {
    const updatedState = await this.applyEventToState(currentState, newEvent);
    await this.persistAndPublish(updatedState);
    return updatedState;
  }

  public async rebuild(patientId: string): Promise<TwinState> {
    let state = createInitialTwinState(patientId);

    if (this.vitalTelemetryRepo) {
      const now = new Date();
      const startDate = new Date(now.getTime() - this.config.maxRebuildLookbackDays * 24 * 60 * 60 * 1000);
      const vitals = await this.vitalTelemetryRepo.queryTimeRange(
        patientId,
        'heartRate',
        startDate.toISOString(),
        now.toISOString(),
        1000
      );

      for (const v of vitals) {
        state.vitals[v.metric] = v;
      }
    }

    state.version += 1;
    state.lastTimestamp = new Date().toISOString();

    await this.persistAndPublish(state);
    return state;
  }

  public snapshot(state: TwinState): TwinStateVector {
    return StateVectorEngine.extractVector(state);
  }

  public calculateConfidence(state: TwinState, targetTimeISO?: string): number {
    return MathEngine.calculateOverallConfidence(state, targetTimeISO);
  }

  public exportState(state: TwinState): string {
    return JSON.stringify(state, Object.keys(state).sort());
  }

  public importState(serialized: string): TwinState {
    return JSON.parse(serialized) as TwinState;
  }

  private async applyEventToState(state: TwinState, event: EventEnvelope<any>): Promise<TwinState> {
    const nextState: TwinState = JSON.parse(JSON.stringify(state));
    nextState.version += 1;
    nextState.lastTimestamp = event.metadata.timestamp || new Date().toISOString();

    const payload = event.payload;

    if (Array.isArray(payload)) {
      for (const item of payload) {
        if (item && item.metric && item.value !== undefined) {
          const validated = validateVital(item);
          nextState.vitals[validated.metric] = validated;
        }
      }
    } else if (payload && payload.metric && payload.value !== undefined) {
      const validated = validateVital(payload);
      nextState.vitals[validated.metric] = validated;
    }

    return nextState;
  }

  private async persistAndPublish(state: TwinState): Promise<void> {
    if (this.stateCache && this.config.enableWriteThroughCache) {
      await this.stateCache.setTwinState(state);
    }

    if (this.twinRepo && this.config.enableAuditSnapshotLogging) {
      await this.twinRepo.saveTwin(state);
    }

    if (this.kafkaProducer && this.config.enableKafkaEventPublishing) {
      const envelope = createEventEnvelope(PatientTwinTopics.PATIENT_STATE_UPDATED, state);
      await this.kafkaProducer.produce(
        PatientTwinTopics.PATIENT_STATE_UPDATED,
        state.patientId,
        JSON.stringify(envelope)
      );
    }
  }
}
