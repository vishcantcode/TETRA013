// ============================================================================
// HLEMP – Capability 2: Message Routing Engine
// ============================================================================

import { HL7ParsedMessage } from './types';
import { HLEMPConnectorFramework } from './connectors';
import { AIRClassifier } from '@healthsense/air';

export interface MessageRoutingResult {
  messageControlId: string;
  routedConnectors: string[];
  routeStatus: 'ROUTED_SUCCESSFULLY' | 'NO_MATCHING_ROUTE' | 'ROUTING_FAILED';
  appliedPolicy: string;
  latencyMs: number;
}

export class HLEMPRoutingEngine {
  private connectorFramework = new HLEMPConnectorFramework();

  /**
   * Route an inbound HL7 message to appropriate target system connectors.
   * Leverages AIR (Adaptive Intelligence Router) for classification and routing policy.
   */
  public routeMessage(parsed: HL7ParsedMessage): MessageRoutingResult {
    const start = performance.now();

    // Use AIR Classifier for adaptive routing classification
    const classification = AIRClassifier.classify(`hl7_routing_${parsed.messageType.toLowerCase()}`, parsed);

    const targetConnectors = this.connectorFramework.findConnectorsByMessageType(parsed.messageType);
    const routedConnectorIds = targetConnectors.map(c => c.connectorId);

    const latencyMs = parseFloat((performance.now() - start).toFixed(3));

    return {
      messageControlId: parsed.controlId,
      routedConnectors: routedConnectorIds,
      routeStatus: routedConnectorIds.length > 0 ? 'ROUTED_SUCCESSFULLY' : 'NO_MATCHING_ROUTE',
      appliedPolicy: `AIR_Classification_${classification.complexity}`,
      latencyMs,
    };
  }
}
