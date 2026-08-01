// ============================================================================
// HEAGCP – Capability 8: Platform Lifecycle Management
// ============================================================================

import { PlatformLifecycleVersion, EnvironmentProfile } from './types';

export class HEAGCPPlatformLifecycleManagement {
  private versionStore: Map<string, PlatformLifecycleVersion> = new Map();

  constructor() {
    this.seedDefaultVersions();
  }

  private seedDefaultVersions(): void {
    const versions: PlatformLifecycleVersion[] = [
      {
        versionId: 'ver-v5-24-0-prod',
        releaseTag: 'v5.24.0',
        environment: 'PRODUCTION',
        migrationStatus: 'COMPLETED',
        deployedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        readinessScorePercent: 100,
      },
      {
        versionId: 'ver-v5-25-0-stg',
        releaseTag: 'v5.25.0-rc1',
        environment: 'STAGING',
        migrationStatus: 'COMPLETED',
        deployedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        readinessScorePercent: 98.5,
      },
    ];

    for (const v of versions) {
      this.versionStore.set(v.versionId, v);
    }
  }

  public getActiveVersion(environment: EnvironmentProfile = 'PRODUCTION'): PlatformLifecycleVersion | undefined {
    return Array.from(this.versionStore.values()).find(v => v.environment === environment);
  }

  public getVersions(): PlatformLifecycleVersion[] {
    return Array.from(this.versionStore.values());
  }
}
