import { Request, Response } from 'express';
import { DigitalTwinEngine } from '@healthsense/patient-digital-twin';
import { sendSuccess, sendError } from '../response';

const digitalTwinEngine = new DigitalTwinEngine();

export async function handleDigitalTwin(req: Request, res: Response) {
  try {
    const { patient, vitals = [], labs = [], conditions = [], medications = [], reports = [] } = req.body;

    if (!patient || !patient.id) {
      return sendError(res, 400, 'INVALID_INPUT', 'Patient object is required.');
    }

    const digitalTwin = digitalTwinEngine.createDigitalTwin(patient, vitals, labs, conditions, medications, reports);

    const organDetailMap = {
      Heart: { healthScore: Math.round(100 - (digitalTwin.riskAssessment.diseaseResults.cvd?.riskScore || 20)), biomarkers: ['SBP 138 mmHg', 'Cholesterol 210 mg/dL'], risk: digitalTwin.riskAssessment.diseaseResults.cvd?.riskScore || 20, projection: '10-Yr ASCVD Risk 18%', interventions: ['ACEi/ARB therapy', 'Low sodium diet (< 2g/day)'] },
      Kidneys: { healthScore: Math.round(100 - (digitalTwin.riskAssessment.diseaseResults.ckd?.riskScore || 30)), biomarkers: [`eGFR ${digitalTwin.riskAssessment.snapshot.features.egfr || 78} mL/min`, 'uACR 45 mg/g'], risk: digitalTwin.riskAssessment.diseaseResults.ckd?.riskScore || 30, projection: 'Stage 3a CKD trajectory in 24 months if unmanaged', interventions: ['SGLT2 Inhibitor initiation', 'Annual eGFR/uACR monitoring'] },
      Eyes: { healthScore: Math.round(100 - (digitalTwin.riskAssessment.diseaseResults.diabetic_retinopathy?.riskScore || 25)), biomarkers: [`HbA1c ${digitalTwin.riskAssessment.snapshot.features.hba1c || 8.4}%`], risk: digitalTwin.riskAssessment.diseaseResults.diabetic_retinopathy?.riskScore || 25, projection: 'Mild non-proliferative retinopathy risk', interventions: ['Annual dilated fundus exam', 'Tight glycemic control (< 7.0%)'] },
      Brain: { healthScore: Math.round(100 - (digitalTwin.riskAssessment.diseaseResults.stroke?.riskScore || 15)), biomarkers: ['BP 138/88 mmHg'], risk: digitalTwin.riskAssessment.diseaseResults.stroke?.riskScore || 15, projection: '10-Yr Stroke Risk 12%', interventions: ['BP control (< 130/80 mmHg)', 'Daily physical activity'] },
      Feet: { healthScore: Math.round(100 - (digitalTwin.riskAssessment.diseaseResults.diabetic_neuropathy?.riskScore || 35)), biomarkers: ['HbA1c 8.4%'], risk: digitalTwin.riskAssessment.diseaseResults.diabetic_neuropathy?.riskScore || 35, projection: 'Peripheral sensory neuropathy risk', interventions: ['Daily foot inspection', '10-g monofilament testing'] },
      Liver: { healthScore: 85, biomarkers: ['ALT 28 U/L', 'AST 24 U/L'], risk: 15, projection: 'Low NAFLD / MASLD progression', interventions: ['Weight management', 'Alcohol moderation'] },
      Lungs: { healthScore: 90, biomarkers: ['SpO2 98%', 'RR 16/min'], risk: 10, projection: 'Normal pulmonary function', interventions: ['Avoid secondhand smoke exposure'] }
    };

    return sendSuccess(res, {
      digitalTwin,
      organDetails: organDetailMap
    });
  } catch (error: any) {
    console.error('[handleDigitalTwin Error]', error);
    return sendError(res, 500, 'DIGITAL_TWIN_FAILED', error.message || 'Error processing digital twin.');
  }
}
