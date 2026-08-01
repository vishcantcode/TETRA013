import { ClinicalDecisionEngine } from './clinical-decision-engine';
import { ClinicalDecisionConfiguration } from './cdis-types';
import { TwinRepository } from '../repository/twin.repository';
import { RedisStateCache } from '../cache/redis-state-cache';
import { IKafkaProducer } from '../events';

export class ClinicalDecisionFactory {
  public static createEngine(
    config?: Partial<ClinicalDecisionConfiguration>,
    twinRepo?: TwinRepository,
    stateCache?: RedisStateCache,
    kafkaProducer?: IKafkaProducer
  ): ClinicalDecisionEngine {
    return new ClinicalDecisionEngine(config, twinRepo, stateCache, kafkaProducer);
  }
}
