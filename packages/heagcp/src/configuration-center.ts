// ============================================================================
// HEAGCP – Capability 4: Platform Configuration Center
// ============================================================================

import crypto from 'node:crypto';
import { PlatformConfiguration, FeatureFlags } from './types';

export class HEAGCPPlatformConfigurationCenter {
  private configStore: Map<string, PlatformConfiguration> = new Map();

  constructor() {
    this.seedDefaultConfig();
  }

  private seedDefaultConfig(): void {
    const defaultConfig: PlatformConfiguration = {
      configId: 'cfg-metrohealth-01',
      orgId: 'org-metrohealth',
      version: 1,
      featureFlags: {
        enableAICopilot: true,
        enableSMARTLaunch: true,
        enablePredictiveSimulations: true,
        enableCaregiverPortal: true,
        enableHL7Messaging: true,
      },
      sessionTimeoutMin: 30,
      mfaRequired: true,
      activeLanguage: 'en',
      updatedAt: new Date(),
    };

    this.configStore.set('org-metrohealth', defaultConfig);
  }

  public getConfiguration(orgId: string): PlatformConfiguration {
    return this.configStore.get(orgId) || this.configStore.get('org-metrohealth')!;
  }

  public updateFeatureFlags(orgId: string, flags: Partial<FeatureFlags>): PlatformConfiguration {
    const current = this.getConfiguration(orgId);
    current.featureFlags = { ...current.featureFlags, ...flags };
    current.version += 1;
    current.updatedAt = new Date();

    this.configStore.set(orgId, current);
    return current;
  }
}
