// ============================================================================
// HEHCP – Capability 3: Event Orchestration Platform
// ============================================================================

import { EnterpriseEventPayload } from './types';
import { AIRClassifier } from '@healthsense/air';
import { hcop } from '@healthsense/hcop';

export interface OrchestrationResult {
  eventId: string;
  workflowInitiated: string;
  hcopExecutionId?: string;
  airComplexity: string;
  status: 'ORCHESTRATED' | 'IGNORED' | 'FAILED';
  latencyMs: number;
}

export class HEHCPEventOrchestrationPlatform {

  constructor() {
    this.ensureHCOPCapabilities();
  }

  private ensureHCOPCapabilities(): void {
    const registry = hcop.getRegistry();
    const capabilities = [
      'patient_admission_triage',
      'lab_critical_result_screening',
      'medication_reconciliation',
      'clinical_evaluation',
    ];

    for (const capId of capabilities) {
      if (!registry.get(capId)) {
        registry.register({
          id: capId,
          name: capId.replace(/_/g, ' '),
          category: 'CLINICAL_REASONING',
          version: '1.0.0',
          description: `HCOP capability handler for ${capId}`,
          handler: async (inp: any) => ({ status: 'PROCESSED', processedAt: new Date(), input: inp }),
        });
      }
    }
  }

  /**
   * Orchestrate an inbound enterprise event via AIR classification & HCOP workflow engine.
   */
  public async orchestrateEvent(event: EnterpriseEventPayload): Promise<OrchestrationResult> {
    const start = performance.now();

    // 1. Classify event using AIR
    const classification = AIRClassifier.classify(`event_${event.eventType.toLowerCase()}`, event.data);

    // 2. Map event to capability workflow in HCOP
    let capabilityName = 'clinical_evaluation';
    if (event.eventType === 'ADMISSION') capabilityName = 'patient_admission_triage';
    if (event.eventType === 'LAB_RESULT') capabilityName = 'lab_critical_result_screening';
    if (event.eventType === 'MEDICATION_UPDATE') capabilityName = 'medication_reconciliation';

    // 3. Initiate HCOP composition execution
    const hcopResult = await hcop.executeComposition({
      workflowName: `wf-${event.eventType.toLowerCase()}`,
      entityType: 'PATIENT',
      entityId: event.patientId,
      requestedCapabilities: [capabilityName],
      input: event.data,
    });

    const latencyMs = parseFloat((performance.now() - start).toFixed(3));

    return {
      eventId: event.eventId,
      workflowInitiated: capabilityName,
      hcopExecutionId: hcopResult.plan.planId,
      airComplexity: classification.complexity,
      status: hcopResult.status === 'COMPLETED' ? 'ORCHESTRATED' : 'FAILED',
      latencyMs,
    };
  }
}
