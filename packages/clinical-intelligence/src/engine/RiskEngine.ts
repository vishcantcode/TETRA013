import { ClinicalFeatureVector } from '../interfaces/PatientSnapshot';
import { DiseaseRiskResult } from '../interfaces/RiskModel';
import { DiabetesRiskModel } from '../models/DiabetesRisk';
import { HypertensionRiskModel } from '../models/HypertensionRisk';
import { CKDRiskModel } from '../models/CKDRisk';
import { CVDRiskModel } from '../models/CVDRisk';
import { StrokeRiskModel } from '../models/StrokeRisk';
import { RiskNormalizer } from '../services/RiskNormalizer';

export class RiskEngine {
  private diabetesModel = new DiabetesRiskModel();
  private hypertensionModel = new HypertensionRiskModel();
  private ckdModel = new CKDRiskModel();
  private cvdModel = new CVDRiskModel();
  private strokeModel = new StrokeRiskModel();

  public evaluateAllRisks(features: ClinicalFeatureVector): Record<'diabetes' | 'hypertension' | 'ckd' | 'cvd' | 'stroke', DiseaseRiskResult> {
    return {
      diabetes: RiskNormalizer.sanitizeResult(this.diabetesModel.calculateRisk(features)),
      hypertension: RiskNormalizer.sanitizeResult(this.hypertensionModel.calculateRisk(features)),
      ckd: RiskNormalizer.sanitizeResult(this.ckdModel.calculateRisk(features)),
      cvd: RiskNormalizer.sanitizeResult(this.cvdModel.calculateRisk(features)),
      stroke: RiskNormalizer.sanitizeResult(this.strokeModel.calculateRisk(features))
    };
  }
}
