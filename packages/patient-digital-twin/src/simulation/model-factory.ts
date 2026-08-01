import { PhysiologicalModelEngine } from './physiological-model';
import { PhysiologicalModelConfiguration } from './hpms-types';
import { TwinRepository } from '../repository/twin.repository';
import { RedisStateCache } from '../cache/redis-state-cache';
import { IKafkaProducer } from '../events';

export class PhysiologicalModelFactory {
  public static createModel(
    config?: Partial<PhysiologicalModelConfiguration>,
    twinRepo?: TwinRepository,
    stateCache?: RedisStateCache,
    kafkaProducer?: IKafkaProducer
  ): PhysiologicalModelEngine {
    return new PhysiologicalModelEngine(config, twinRepo, stateCache, kafkaProducer);
  }
}
