// ============================================================================
// HLEMP – Capability 6: Connector Framework
// ============================================================================

import { HL7ConnectorConfig, ConnectorSystemType, HL7MessageType } from './types';

export class HLEMPConnectorFramework {
  private connectors: Map<string, HL7ConnectorConfig> = new Map();

  constructor() {
    this.registerDefaultConnectors();
  }

  private registerDefaultConnectors(): void {
    this.registerConnector({
      connectorId: 'conn-his-01',
      connectorName: 'Hospital Information System (HIS)',
      systemType: 'HIS',
      endpointUrl: 'mllp://his.hospital.local:2575',
      protocol: 'MLLP',
      supportedMessageTypes: ['ADT', 'SIU', 'MDM'],
      active: true,
    });

    this.registerConnector({
      connectorId: 'conn-lis-01',
      connectorName: 'Laboratory Information System (LIS)',
      systemType: 'LIS',
      endpointUrl: 'mllp://lis.lab.local:2576',
      protocol: 'MLLP',
      supportedMessageTypes: ['ORM', 'ORU'],
      active: true,
    });

    this.registerConnector({
      connectorId: 'conn-ris-01',
      connectorName: 'Radiology Information System (RIS)',
      systemType: 'RIS',
      endpointUrl: 'mllp://ris.rad.local:2577',
      protocol: 'MLLP',
      supportedMessageTypes: ['ORM', 'ORU', 'MDM'],
      active: true,
    });

    this.registerConnector({
      connectorId: 'conn-pharm-01',
      connectorName: 'Pharmacy System',
      systemType: 'PHARMACY',
      endpointUrl: 'http://pharmacy.hospital.local/hl7/v2',
      protocol: 'HTTP_REST',
      supportedMessageTypes: ['ORM', 'ORU'],
      active: true,
    });

    this.registerConnector({
      connectorId: 'conn-bill-01',
      connectorName: 'Billing & Claims System',
      systemType: 'BILLING',
      endpointUrl: 'sftp://billing.hospital.local/inbound',
      protocol: 'SFTP',
      supportedMessageTypes: ['DFT', 'ADT'],
      active: true,
    });
  }

  public registerConnector(config: HL7ConnectorConfig): void {
    this.connectors.set(config.connectorId, config);
  }

  public getConnector(connectorId: string): HL7ConnectorConfig | undefined {
    return this.connectors.get(connectorId);
  }

  public findConnectorsBySystem(systemType: ConnectorSystemType): HL7ConnectorConfig[] {
    return Array.from(this.connectors.values()).filter(c => c.systemType === systemType && c.active);
  }

  public findConnectorsByMessageType(msgType: HL7MessageType): HL7ConnectorConfig[] {
    return Array.from(this.connectors.values()).filter(c => c.supportedMessageTypes.includes(msgType) && c.active);
  }
}
