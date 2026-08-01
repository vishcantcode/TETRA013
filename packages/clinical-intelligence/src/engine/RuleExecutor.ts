import { IRuleExecutor, TriggeredClinicalRule } from '../interfaces/RuleExecutorInterfaces';
import { ClinicalFeatureVector } from '../interfaces/PatientSnapshot';

export class RuleExecutor implements IRuleExecutor {
  public evaluateRules(_features: ClinicalFeatureVector): TriggeredClinicalRule[] {
    // Interface framework stub for future ICMR, ADA, KDIGO, AHA, WHO rules execution
    return [];
  }
}
