import { HPPHIHealthOpportunityEngine } from '@healthsense/hpphi';

export class WorkflowTriggerEngine {
  private static instance: WorkflowTriggerEngine;

  public static getInstance(): WorkflowTriggerEngine {
    if (!WorkflowTriggerEngine.instance) {
      WorkflowTriggerEngine.instance = new WorkflowTriggerEngine();
    }
    return WorkflowTriggerEngine.instance;
  }

  public triggerClinicalWorkflow(eventTypeOrEvent: any, payloadInput?: any): { triggeredModule: string; executionResult: any } {
    const eventType = typeof eventTypeOrEvent === 'object' && eventTypeOrEvent !== null ? (eventTypeOrEvent.eventType || 'UNKNOWN') : eventTypeOrEvent;
    const payload = typeof eventTypeOrEvent === 'object' && eventTypeOrEvent !== null ? (eventTypeOrEvent.payload || eventTypeOrEvent.data || eventTypeOrEvent) : payloadInput;

    switch (eventType) {

      case 'CLINICAL_ENCOUNTER':
      case 'PATIENT_ADMISSION':
        return this.triggerSymptomTriage(payload);
      case 'VITAL_SIGNS_UPDATE':
      case 'LAB_RESULT':
        return this.triggerChronicDiseaseWorkflow(payload);
      case 'PREVENTIVE_SCREENING':
      case 'WELLNESS_CHECK':
        return this.triggerPreventiveIntelligenceWorkflow(payload);
      default:
        return {
          triggeredModule: 'NONE',
          executionResult: { status: 'IGNORED', reason: `No workflow mapping for eventType: ${eventType}` },
        };
    }
  }

  private triggerSymptomTriage(payload: any): { triggeredModule: string; executionResult: any } {
    return {
      triggeredModule: 'SymptomTriageEngine',
      executionResult: {
        status: 'DISPATCHED',
        payloadSummary: typeof payload === 'object' ? Object.keys(payload || {}) : 'primitive',
        timestamp: new Date().toISOString(),
      },
    };
  }

  private triggerChronicDiseaseWorkflow(payload: any): { triggeredModule: string; executionResult: any } {
    return {
      triggeredModule: 'ChronicDiseaseWorkflowEngine',
      executionResult: {
        status: 'DISPATCHED',
        targetCondition: payload?.conditionName || 'HYPERTENSION',
        timestamp: new Date().toISOString(),
      },
    };
  }

  private triggerPreventiveIntelligenceWorkflow(payload: any): { triggeredModule: string; executionResult: any } {
    const hpphi = new HPPHIHealthOpportunityEngine();
    const patientId = payload?.patientId || 'pt-demo-001';
    const patientInput: any = {
      patientId,
      demographics: { age: 58, sex: 'M' as const },
      chronicConditions: ['Hypertension'],
      vitalSigns: [{ metric: 'Systolic BP', value: 140, unit: 'mmHg' }],
      laboratoryResults: [{ test: 'HbA1c', value: 7.4, unit: '%' }],
      lifestyleFactors: {
        smokingStatus: 'NEVER' as const,
        physicalActivityMinPerWeek: 90,
        sleepHoursPerNight: 6.5,
        dietQuality: 'FAIR' as const,
        alcoholUnitsPerWeek: 2,
      },
      preventiveHistory: {
        lastBPMeasurement: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        lastGlucoseHbA1cTest: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        lastLipidPanel: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
      },
    };
    const result = hpphi.evaluatePatient(patientInput);
    return { triggeredModule: 'HPPHI', executionResult: result };
  }
}
