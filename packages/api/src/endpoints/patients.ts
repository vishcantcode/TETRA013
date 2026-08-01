import { Request, Response } from 'express';
import { DEMO_PATIENTS } from '@healthsense/clinical-models';
import { sendSuccess, sendError } from '../response';

type DemoPatientKey = 'patient-healthy' | 'patient-prediabetes' | 'patient-diabetes' | 'patient-hypertension' | 'patient-ckd' | 'patient-multimorbid';

export async function handleGetDemoPatients(req: Request, res: Response) {
  const patientSummaries = Object.keys(DEMO_PATIENTS).map(key => {
    const bundle = DEMO_PATIENTS[key as DemoPatientKey];
    return {
      key,
      id: bundle.patient.id,
      name: bundle.patient.name?.[0]?.given?.join(' ') || 'Patient',
      age: 54,
      gender: 'Male',
      condition: key === 'patient-diabetes' ? 'Type 2 Diabetes + Stage 3b CKD' :
                 key === 'patient-hypertension' ? 'Stage 2 Hypertension + High ASCVD Risk' :
                 key === 'patient-ckd' ? 'Progressive CKD (eGFR 42 mL/min)' :
                 key === 'patient-prediabetes' ? 'Prediabetes + Metabolic Syndrome' :
                 key === 'patient-healthy' ? 'Routine Assessment (Low Risk Baseline)' : 'Multimorbid CVD, T2DM & Stroke Risk',
      riskScore: key === 'patient-diabetes' ? 82 : key === 'patient-hypertension' ? 74 : key === 'patient-ckd' ? 88 : key === 'patient-prediabetes' ? 48 : key === 'patient-healthy' ? 12 : 92
    };
  });

  return sendSuccess(res, {
    count: patientSummaries.length,
    patients: patientSummaries
  });
}

export async function handleGetPatientById(req: Request, res: Response) {
  const { id } = req.params;
  const key = id as DemoPatientKey;

  const bundle = DEMO_PATIENTS[key] || DEMO_PATIENTS['patient-diabetes'];

  return sendSuccess(res, {
    patientId: id,
    bundle
  });
}
