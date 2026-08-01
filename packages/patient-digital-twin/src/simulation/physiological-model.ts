import { IPhysiologicalModel, ClinicalStabilityState, PhysiologicalModelConfiguration, PhysiologicalModelConfigurationSchema } from './hpms-types';
import { StabilityEngine } from './stability-engine';
import { TrajectoryProjector } from './trajectory-projector';
import { ConstraintEngine } from './constraint-engine';
import { TwinState } from '../domain';
import { IKafkaProducer, createEventEnvelope } from '../events';
import { RedisStateCache } from '../cache/redis-state-cache';
import { TwinRepository } from '../repository/twin.repository';

export class PhysiologicalModelEngine implements IPhysiologicalModel {
  private config: PhysiologicalModelConfiguration;
  private twinRepo?: TwinRepository;
  private stateCache?: RedisStateCache;
  private kafkaProducer?: IKafkaProducer;

  constructor(
    config?: Partial<PhysiologicalModelConfiguration>,
    twinRepo?: TwinRepository,
    stateCache?: RedisStateCache,
    kafkaProducer?: IKafkaProducer
  ) {
    this.config = PhysiologicalModelConfigurationSchema.parse(config || {});
    this.twinRepo = twinRepo;
    this.stateCache = stateCache;
    this.kafkaProducer = kafkaProducer;
  }

  public async evolveState(currentState: TwinState, deltaTimeMs: number): Promise<TwinState> {
    const trajectory = TrajectoryProjector.projectTrajectory(currentState, 1, deltaTimeMs);
    const evolved = ConstraintEngine.enforceSafetyBounds(trajectory[0]);

    if (this.stateCache && this.config.enableWriteThroughCache) {
      await this.stateCache.setTwinState(evolved);
    }
    if (this.twinRepo && this.config.enableAuditLogging) {
      await this.twinRepo.saveTwin(evolved);
    }

    return evolved;
  }

  public async projectTrajectory(currentState: TwinState, steps: number, stepIntervalMs: number): Promise<TwinState[]> {
    const trajectory = TrajectoryProjector.projectTrajectory(currentState, steps, stepIntervalMs);

    if (this.kafkaProducer && this.config.enableKafkaEventPublishing) {
      const envelope = createEventEnvelope('patient.trajectory.projected', {
        patientId: currentState.patientId,
        steps,
        trajectory
      });
      await this.kafkaProducer.produce(
        'patient.trajectory.projected',
        currentState.patientId,
        JSON.stringify(envelope)
      );
    }

    return trajectory;
  }

  public evaluateStability(state: TwinState): ClinicalStabilityState {
    return StabilityEngine.classifyStability(state);
  }
}
