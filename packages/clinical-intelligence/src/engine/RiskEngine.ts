import { ClinicalFeatureVector } from '../interfaces/PatientSnapshot';
import { DiseaseRiskResult, DiseaseId } from '../interfaces/RiskModel';
import { DiabetesRiskModel } from '../models/DiabetesRisk';
import { HypertensionRiskModel } from '../models/HypertensionRisk';
import { CKDRiskModel } from '../models/CKDRisk';
import { CVDRiskModel } from '../models/CVDRisk';
import { StrokeRiskModel } from '../models/StrokeRisk';
import { MetabolicSyndromeRiskModel } from '../models/MetabolicSyndromeRisk';
import { DiabeticNeuropathyRiskModel } from '../models/DiabeticNeuropathyRisk';
import { DiabeticRetinopathyRiskModel } from '../models/DiabeticRetinopathyRisk';
import { HeartFailureRiskModel } from '../models/HeartFailureRisk';
import { RiskNormalizer } from '../services/RiskNormalizer';

export class RiskEngine {
  private diabetesModel = new DiabetesRiskModel();
  private hypertensionModel = new HypertensionRiskModel();
  private ckdModel = new CKDRiskModel();
  private cvdModel = new CVDRiskModel();
  private strokeModel = new StrokeRiskModel();
  private metabolicSyndromeModel = new MetabolicSyndromeRiskModel();
  private diabeticNeuropathyModel = new DiabeticNeuropathyRiskModel();
  private diabeticRetinopathyModel = new DiabeticRetinopathyRiskModel();
  private heartFailureModel = new HeartFailureRiskModel();

  public evaluateAllRisks(features: ClinicalFeatureVector): Record<DiseaseId, DiseaseRiskResult> {
    return {
      diabetes: RiskNormalizer.sanitizeResult(this.diabetesModel.calculateRisk(features)),
      hypertension: RiskNormalizer.sanitizeResult(this.hypertensionModel.calculateRisk(features)),
      ckd: RiskNormalizer.sanitizeResult(this.ckdModel.calculateRisk(features)),
      cvd: RiskNormalizer.sanitizeResult(this.cvdModel.calculateRisk(features)),
      stroke: RiskNormalizer.sanitizeResult(this.strokeModel.calculateRisk(features)),
      metabolic_syndrome: RiskNormalizer.sanitizeResult(this.metabolicSyndromeModel.calculateRisk(features)),
      diabetic_neuropathy: RiskNormalizer.sanitizeResult(this.diabeticNeuropathyModel.calculateRisk(features)),
      diabetic_retinopathy: RiskNormalizer.sanitizeResult(this.diabeticRetinopathyModel.calculateRisk(features)),
      heart_failure: RiskNormalizer.sanitizeResult(this.heartFailureModel.calculateRisk(features))
    };
  }
}
