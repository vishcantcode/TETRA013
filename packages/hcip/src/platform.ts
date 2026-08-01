import { HCIPClinicalWorkflows, HCIPComprehensiveAssessmentResult } from './workflows';
import { HCIPCarePlanEngine, HCIPStructuredCarePlan } from './careplan';
import { HCIPLongitudinalEngine } from './longitudinal';
import { HCIPDigitalTwinSync } from './twin-sync';

export class HealthSenseClinicalIntelligencePlatform {
  private static instance: HealthSenseClinicalIntelligencePlatform;
  private workflows = new HCIPClinicalWorkflows();
  private carePlanEngine = new HCIPCarePlanEngine();
  private longitudinalEngine = new HCIPLongitudinalEngine();
  private twinSync = new HCIPDigitalTwinSync();

  public static getInstance(): HealthSenseClinicalIntelligencePlatform {
    if (!HealthSenseClinicalIntelligencePlatform.instance) {
      HealthSenseClinicalIntelligencePlatform.instance = new HealthSenseClinicalIntelligencePlatform();
    }
    return HealthSenseClinicalIntelligencePlatform.instance;
  }

  public async runComprehensiveAssessment(
    patientId: string,
    symptomInput: { symptom: string },
    userCtx?: any
  ): Promise<HCIPComprehensiveAssessmentResult> {
    return this.workflows.executeComprehensiveHealthAssessment(patientId, symptomInput, userCtx);
  }

  public generateStructuredCarePlan(patientId: string, assessmentData: any): HCIPStructuredCarePlan {
    return HCIPCarePlanEngine.generateCarePlan(patientId, assessmentData);
  }

  public getLongitudinalEngine(): HCIPLongitudinalEngine {
    return this.longitudinalEngine;
  }

  public getDigitalTwinSync(): HCIPDigitalTwinSync {
    return this.twinSync;
  }
}

export const hcip = HealthSenseClinicalIntelligencePlatform.getInstance();
