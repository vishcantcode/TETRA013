// ============================================================================
// HEHCP – Capability 1: Enterprise Connector Framework
// ============================================================================

import {
  EnterpriseConnectorConfig,
  ConnectorHealthCheck,
  ConnectorState,
  EnterpriseSystemType,
} from './types';

export class HEHCPConnectorFramework {
  private connectors: Map<string, EnterpriseConnectorConfig> = new Map();
  private states: Map<string, ConnectorState> = new Map();

  constructor() {
    this.registerDefaultConnectors();
  }

  private registerDefaultConnectors(): void {
    const systems: { type: EnterpriseSystemType; name: string; url: string }[] = [
      { type: 'EHR', name: 'Epic / Cerner EHR Core', url: 'https://ehr.hospital.org/fhir' },
      { type: 'HIS', name: 'Main Hospital Information System', url: 'mllp://his.hospital.org:2575' },
      { type: 'LIS', name: 'Central Laboratory System', url: 'mllp://lis.lab.org:2576' },
      { type: 'RIS', name: 'Radiology Information System', url: 'mllp://ris.rad.org:2577' },
      { type: 'PACS', name: 'Imaging PACS Archive', url: 'https://pacs.imaging.org/dicom-web' },
      { type: 'PHARMACY', name: 'Inpatient Pharmacy System', url: 'https://pharmacy.hospital.org/api' },
      { type: 'SCHEDULING', name: 'Enterprise Scheduling System', url: 'https://schedule.hospital.org/api' },
      { type: 'BILLING', name: 'Claims & Billing System', url: 'sftp://billing.hospital.org/inbound' },
      { type: 'NOTIFICATION', name: 'Clinical Paging & Alerts', url: 'https://alerts.hospital.org/webhook' },
    ];

    for (let i = 0; i < systems.length; i++) {
      const sys = systems[i];
      const connectorId = `conn-${sys.type.toLowerCase()}-0${i + 1}`;
      const config: EnterpriseConnectorConfig = {
        connectorId,
        name: sys.name,
        systemType: sys.type,
        endpointUrl: sys.url,
        authStrategy: sys.url.startsWith('https') ? 'OAUTH2' : 'MTLS',
        retryAttempts: 3,
        timeoutMs: 5000,
        circuitBreakerThreshold: 5,
        active: true,
      };
      this.connectors.set(connectorId, config);
      this.states.set(connectorId, 'CONNECTED');
    }
  }

  public registerConnector(config: EnterpriseConnectorConfig): void {
    this.connectors.set(config.connectorId, config);
    this.states.set(config.connectorId, 'CONNECTED');
  }

  public updateConnectorState(connectorId: string, state: ConnectorState): void {
    if (this.connectors.has(connectorId)) {
      this.states.set(connectorId, state);
    }
  }

  public pingHealth(connectorId: string): ConnectorHealthCheck {
    const config = this.connectors.get(connectorId);
    const state = this.states.get(connectorId) || 'DISCONNECTED';

    if (!config) {
      return { connectorId, state: 'DISCONNECTED', latencyMs: 0, lastPing: new Date(), uptimePercent: 0 };
    }

    return {
      connectorId,
      state,
      latencyMs: state === 'CONNECTED' ? 12 : state === 'DEGRADED' ? 240 : 0,
      lastPing: new Date(),
      uptimePercent: state === 'CONNECTED' ? 99.9 : state === 'DEGRADED' ? 95.0 : 0,
    };
  }

  public getAllConnectors(): EnterpriseConnectorConfig[] {
    return Array.from(this.connectors.values());
  }

  public getConnectorState(connectorId: string): ConnectorState {
    return this.states.get(connectorId) || 'DISCONNECTED';
  }
}
