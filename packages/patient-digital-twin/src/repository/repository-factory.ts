import { IDbExecutor } from './db-connection';
import { TwinRepository } from './twin.repository';
import { TwinVersionRepository } from './twin-version.repository';
import { VitalRepository } from './vital.repository';
import { BiomarkerRepository } from './biomarker.repository';
import { MedicationRepository } from './medication.repository';
import { RiskScoreRepository } from './risk-score.repository';
import { VitalTelemetryRepository } from './vital-telemetry.repository';
import { BiomarkerTelemetryRepository } from './biomarker-telemetry.repository';
import { RiskTelemetryRepository } from './risk-telemetry.repository';
import { TelemetryRepository } from './telemetry.repository';

/**
 * Dependency injection factory for instantiating digital twin & telemetry repositories.
 */
export class RepositoryFactory {
  private executor: IDbExecutor;

  constructor(executor: IDbExecutor) {
    this.executor = executor;
  }

  public createTwinRepository(): TwinRepository {
    return new TwinRepository(this.executor);
  }

  public createTwinVersionRepository(): TwinVersionRepository {
    return new TwinVersionRepository(this.executor);
  }

  public createVitalRepository(): VitalRepository {
    return new VitalRepository(this.executor);
  }

  public createBiomarkerRepository(): BiomarkerRepository {
    return new BiomarkerRepository(this.executor);
  }

  public createMedicationRepository(): MedicationRepository {
    return new MedicationRepository(this.executor);
  }

  public createRiskScoreRepository(): RiskScoreRepository {
    return new RiskScoreRepository(this.executor);
  }

  public createVitalTelemetryRepository(): VitalTelemetryRepository {
    return new VitalTelemetryRepository(this.executor);
  }

  public createBiomarkerTelemetryRepository(): BiomarkerTelemetryRepository {
    return new BiomarkerTelemetryRepository(this.executor);
  }

  public createRiskTelemetryRepository(): RiskTelemetryRepository {
    return new RiskTelemetryRepository(this.executor);
  }

  public createTelemetryRepository(): TelemetryRepository {
    return new TelemetryRepository(this.executor);
  }
}
