// ============================================================================
// HPEDEP – Capability 1: Secure Plugin Architecture & Lifecycle Manager
// ============================================================================

import crypto from 'node:crypto';
import { PlatformPlugin, PluginType, PluginStatus } from './types';

export class HPEDEPPluginFramework {
  private pluginStore: Map<string, PlatformPlugin> = new Map();

  constructor() {
    this.seedDefaultPlugins();
  }

  private seedDefaultPlugins(): void {
    const plugins: PlatformPlugin[] = [
      {
        pluginId: 'plg-oncology-cds-01',
        name: 'Oncology Care Pathway Assistant',
        type: 'CLINICAL',
        version: 'v1.4.0',
        publisher: 'HealthSense Clinical Ecosystem',
        minHealthSenseVersion: 'v5.0.0',
        status: 'ACTIVE',
        permissions: ['READ_PATIENT_RECORD', 'SURFACE_CDS_ALERT'],
        installedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
      {
        pluginId: 'plg-telehealth-ui-02',
        name: 'Telehealth Video Call UI Extension',
        type: 'UI',
        version: 'v2.1.0',
        publisher: 'Partner Health Apps',
        minHealthSenseVersion: 'v5.10.0',
        status: 'ACTIVE',
        permissions: ['EMBED_UI_WIDGET'],
        installedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      },
    ];

    for (const p of plugins) {
      this.pluginStore.set(p.pluginId, p);
    }
  }

  public installPlugin(
    name: string,
    type: PluginType,
    version: string,
    publisher: string,
    minHealthSenseVersion = 'v5.0.0',
    permissions: string[] = []
  ): PlatformPlugin {
    const pluginId = `plg-${crypto.randomUUID().slice(0, 8)}`;
    const plugin: PlatformPlugin = {
      pluginId,
      name,
      type,
      version,
      publisher,
      minHealthSenseVersion,
      status: 'ACTIVE',
      permissions,
      installedAt: new Date(),
    };

    this.pluginStore.set(pluginId, plugin);
    return plugin;
  }

  public updatePluginStatus(pluginId: string, status: PluginStatus): PlatformPlugin {
    const plugin = this.pluginStore.get(pluginId);
    if (!plugin) throw new Error(`Plugin ${pluginId} not found.`);

    plugin.status = status;
    this.pluginStore.set(pluginId, plugin);
    return plugin;
  }

  public getPlugins(): PlatformPlugin[] {
    return Array.from(this.pluginStore.values()).filter(p => p.status !== 'REMOVED');
  }
}
