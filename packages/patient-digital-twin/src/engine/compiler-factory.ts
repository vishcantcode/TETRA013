import { DynamicStateCompiler } from './dsc-compiler';
import { CompilerConfiguration } from './dsc-types';
import { TwinRepository } from '../repository/twin.repository';
import { VitalTelemetryRepository } from '../repository/vital-telemetry.repository';
import { RedisStateCache } from '../cache/redis-state-cache';
import { IKafkaProducer } from '../events';

/**
 * Dependency injection factory for instantiating the Dynamic State Compiler (DSC).
 */
export class CompilerFactory {
  public static createCompiler(
    config?: Partial<CompilerConfiguration>,
    twinRepo?: TwinRepository,
    vitalTelemetryRepo?: VitalTelemetryRepository,
    stateCache?: RedisStateCache,
    kafkaProducer?: IKafkaProducer
  ): DynamicStateCompiler {
    return new DynamicStateCompiler(config, twinRepo, vitalTelemetryRepo, stateCache, kafkaProducer);
  }
}
