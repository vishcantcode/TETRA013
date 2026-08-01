import { IDbExecutor } from './db-connection';
import { VitalTelemetryRepository } from './vital-telemetry.repository';
import { BiomarkerTelemetryRepository } from './biomarker-telemetry.repository';
import { RiskTelemetryRepository } from './risk-telemetry.repository';

/**
 * Unified Telemetry Repository combining all time-series hypertable access layers.
 */
export class TelemetryRepository {
  public readonly vitals: VitalTelemetryRepository;
  public readonly biomarkers: BiomarkerTelemetryRepository;
  public readonly riskScores: RiskTelemetryRepository;

  constructor(executor: IDbExecutor) {
    this.vitals = new VitalTelemetryRepository(executor);
    this.biomarkers = new BiomarkerTelemetryRepository(executor);
    this.riskScores = new RiskTelemetryRepository(executor);
  }
}
