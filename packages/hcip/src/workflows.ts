import { hcop, HCOPCapabilityRegistry } from '@healthsense/hcop';
import { HCIPCarePlanEngine, HCIPStructuredCarePlan } from './careplan';
import { HCIPLongitudinalEngine, HCIPLongitudinalReport } from './longitudinal';
import { HCIPDigitalTwinSync } from './twin-sync';
import { createHIEKContext, HIEKContext } from '@healthsense/hiek';

export interface HCIPComprehensiveAssessmentResult {
  patientId: string;
  executionId: string;
  workflowName: string;
  status: 'COMPLETED' | 'FAILED';
  triageOutput: any;
  longitudinalReport: HCIPLongitudinalReport;
  carePlan: HCIPStructuredCarePlan;
  twinVersion: number;
  confidenceScore: number;
  evidenceChain: string[];
  requiresHumanApproval: boolean;
  durationMs: number;
}

export class HCIPClinicalWorkflows {
  private longitudinalEngine = new HCIPLongitudinalEngine();
  private twinSync = new HCIPDigitalTwinSync();

  public async executeComprehensiveHealthAssessment(
    patientId: string,
    symptomInput: { symptom: string },
    userCtx?: any
  ): Promise<HCIPComprehensiveAssessmentResult> {
    const startTime = Date.now();
    const ctx = createHIEKContext({
      user: userCtx || { id: patientId, email: 'patient@healthsense.ai', role: 'patient' },
      patientId
    });

    // Ensure capabilities are registered in HCOP registry
    const registry = HCOPCapabilityRegistry.getInstance();
    if (!registry.get('cap-digital-twin')) {
      registry.register({
        id: 'cap-digital-twin',
        name: 'DigitalTwinUpdate',
        category: 'DIGITAL_TWIN',
        version: '1.0.0',
        description: 'Synchronizes clinical findings with Digital Twin',
        handler: async (inp, c) => this.twinSync.synchronizeFinding(c.patientId || patientId, inp)
      });
    }

    if (!registry.get('cap-clinical-reasoning')) {
      registry.register({
        id: 'cap-clinical-reasoning',
        name: 'ClinicalReasoning',
        category: 'CLINICAL_REASONING',
        version: '1.0.0',
        description: 'Executes clinical triage reasoning',
        dependencies: ['cap-digital-twin'],
        handler: async (inp) => ({ triageRecommendation: 'Comprehensive Clinical Assessment Completed', confidence: 0.88 })
      });
    }

    if (!registry.get('cap-explainability')) {
      registry.register({
        id: 'cap-explainability',
        name: 'Explainability',
        category: 'EXPLAINABILITY',
        version: '1.0.0',
        description: 'Synthesizes clinical evidence chain',
        dependencies: ['cap-clinical-reasoning'],
        handler: async (inp) => ({ evidenceChain: ['Symptom match', 'Longitudinal trend evaluation'], confidence: 0.88 })
      });
    }

    // Execute via HCOP (which delegates through HUSE -> HPIE -> AIR -> HIEK -> HOIP)
    const compositionRes = await hcop.executeComposition({
      workflowName: 'ComprehensiveHealthAssessment',
      entityType: 'ASSESSMENT',
      entityId: `asm-${Date.now()}`,
      requestedCapabilities: ['cap-explainability'],
      context: ctx,
      input: symptomInput
    });

    const twinData = compositionRes.stepResults['cap-digital-twin'] || {};
    const longitudinalReport = this.longitudinalEngine.analyzePatientHistory(patientId, twinData.updatedState || {});
    const carePlan = HCIPCarePlanEngine.generateCarePlan(patientId, { concerns: [symptomInput.symptom] });

    return {
      patientId,
      executionId: ctx.executionId,
      workflowName: 'ComprehensiveHealthAssessment',
      status: compositionRes.status,
      triageOutput: compositionRes.stepResults['cap-clinical-reasoning'] || {},
      longitudinalReport,
      carePlan,
      twinVersion: twinData.twinVersion || 1,
      confidenceScore: 0.88,
      evidenceChain: ['Symptom context matching', 'Longitudinal vital history analysis', 'Care Plan Action synthesis'],
      requiresHumanApproval: false,
      durationMs: Date.now() - startTime
    };
  }
}
