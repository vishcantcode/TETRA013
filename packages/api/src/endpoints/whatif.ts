import { Request, Response } from 'express';
import { ClinicalEngine } from '@healthsense/clinical-intelligence';
import { InterventionSimulator } from '@healthsense/patient-digital-twin';
import { sendSuccess, sendError } from '../response';

const clinicalEngine = new ClinicalEngine();

export async function handleWhatIf(req: Request, res: Response) {
  try {
    const {
      patient, vitals = [], labs = [], conditions = [],
      hba1cDelta = -1.0, systolicBPDelta = -10, bmiDelta = -2.0, quitSmoking = true,
      exerciseHoursWeekly = 3, ldlDelta = -15
    } = req.body;

    if (!patient || !patient.id) {
      return sendError(res, 400, 'INVALID_INPUT', 'Patient data is required for simulation.');
    }

    const baselineAssessment = clinicalEngine.evaluatePatient(patient, vitals, labs, conditions, [], []);

    const simResult = InterventionSimulator.simulate(baselineAssessment, {
      hba1cDelta,
      systolicBPDelta,
      bmiDelta,
      quitSmoking
    });

    const riskShift = baselineAssessment.overallRiskScore - simResult.simulatedRiskScore;
    const healthyYearsGained = Number((Math.max(0, riskShift) * 0.12 + (exerciseHoursWeekly * 0.4)).toFixed(1));
    const lifeExpectancyGain = Number((Math.max(0, riskShift) * 0.15 + (quitSmoking ? 2.5 : 0)).toFixed(1));

    return sendSuccess(res, {
      baselineRiskScore: baselineAssessment.overallRiskScore,
      simulatedRiskScore: simResult.simulatedRiskScore,
      baselineTier: simResult.baselineTier,
      simulatedTier: simResult.simulatedTier,
      riskReductionPercentage: simResult.riskReductionPercentage,
      healthyYearsGained,
      lifeExpectancyGain,
      clinicalImpactSummary: simResult.clinicalImpactSummary,
      organProjections: [
        { organ: 'Heart', baselineHealth: 65, simulatedHealth: Math.min(100, 65 + Math.abs(systolicBPDelta)) },
        { organ: 'Kidneys', baselineHealth: 70, simulatedHealth: Math.min(100, 70 + Math.abs(hba1cDelta * 8)) },
        { organ: 'Eyes', baselineHealth: 72, simulatedHealth: Math.min(100, 72 + Math.abs(hba1cDelta * 6)) },
        { organ: 'Brain', baselineHealth: 68, simulatedHealth: Math.min(100, 68 + Math.abs(systolicBPDelta * 0.8)) }
      ]
    });
  } catch (error: any) {
    console.error('[handleWhatIf Error]', error);
    return sendError(res, 500, 'WHATIF_SIMULATION_FAILED', error.message || 'Error executing simulation.');
  }
}
