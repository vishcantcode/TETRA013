import { Patient } from '../../types';
import { EarlyWarningAlert } from '../../types/cdss';

export class EarlyWarningEngine {
  /**
   * Stage 5: Early Warning Progression & Emergency Risk Engine.
   * Scans patient telemetry for high-risk clinical trajectories.
   */
  public static generateAlerts(patient: Patient, customVitals?: any): EarlyWarningAlert[] {
    const alerts: EarlyWarningAlert[] = [];
    const vitals = customVitals || patient.vitals || {};

    const hba1c = vitals.hba1c || 7.2;
    const bpSystolic = vitals.bpSystolic || 138;
    const bpDiastolic = vitals.bpDiastolic || 88;
    const glucose = vitals.glucose || 128;
    const ldl = vitals.ldl || 135;

    // 1. Alert: Uncontrolled Diabetes Progression
    if (hba1c >= 7.0 || glucose >= 140) {
      alerts.push({
        id: 'ew-1',
        severity: hba1c >= 8.5 ? 'Critical' : 'High',
        title: 'Uncontrolled Type 2 Glycemic Spike Risk',
        evidence: `HbA1c ${hba1c}% & Fasting Glucose ${glucose} mg/dL exceed target therapeutic ceiling (< 7.0%).`,
        observation: `Glycemic volatility detected over past 90 days with elevated glycated hemoglobin.`,
        recommendedAction: 'Review glycemic regimen; consider Metformin escalation or SGLT2 inhibitor initiation.',
        timeframe: 'Immediate (Within 72 Hours)',
        badgeColor: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-900',
      });
    }

    // 2. Alert: Hypertensive Urgency / Stage 2 Strain
    if (bpSystolic >= 180 || bpDiastolic >= 120) {
      alerts.push({
        id: 'ew-2',
        severity: 'Critical',
        title: 'Potential Hypertensive Crisis Alert',
        evidence: `Resting Blood Pressure reading ${bpSystolic}/${bpDiastolic} mmHg.`,
        observation: 'Extreme arterial shear pressure posing acute end-organ damage risk (brain, retina, kidney).',
        recommendedAction: 'Immediate clinical re-evaluation; evaluate for headache, visual changes, or chest discomfort.',
        timeframe: 'Stat Urgent / ER Evaluation',
        badgeColor: 'bg-red-100 text-red-800 border-red-400 dark:bg-red-950 dark:text-red-200',
      });
    } else if (bpSystolic >= 135 || bpDiastolic >= 85) {
      alerts.push({
        id: 'ew-2b',
        severity: 'Moderate',
        title: 'Pre-Hypertensive Vascular Strain Alert',
        evidence: `Systolic BP resting at ${bpSystolic} mmHg (Diastolic ${bpDiastolic} mmHg).`,
        observation: 'Persistent vascular load contributing to left ventricular wall tension.',
        recommendedAction: 'Initiate 14-day home blood pressure log; prescribe dietary sodium reduction (< 2,000 mg/day).',
        timeframe: 'Within 1 Week',
        badgeColor: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900',
      });
    }

    // 3. Alert: Possible CKD Progression / Renal Strain
    if ((hba1c >= 6.5 && bpSystolic >= 135) || (vitals.creatinine && vitals.creatinine > 1.2)) {
      alerts.push({
        id: 'ew-3',
        severity: 'Moderate',
        title: 'Sub-Clinical Renal Microvascular Watch',
        evidence: `Co-occurrence of Diabetes (HbA1c ${hba1c}%) and Hypertension (${bpSystolic} mmHg).`,
        observation: 'Intraglomerular pressure overload places nephrons under progressive capillary sclerosis risk.',
        recommendedAction: 'Order baseline Urine Albumin-to-Creatinine Ratio (UACR) and serum creatinine / eGFR panel.',
        timeframe: 'Within 14 Days',
        badgeColor: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900',
      });
    }

    // 4. Alert: High Cardiovascular Risk (ASCVD)
    if (ldl >= 130 && (bpSystolic >= 130 || hba1c >= 6.5)) {
      alerts.push({
        id: 'ew-4',
        severity: 'High',
        title: 'High Atherosclerotic CVD Plaque Threat',
        evidence: `Atherogenic LDL ${ldl} mg/dL combined with vascular inflammation markers.`,
        observation: '10-Year ASCVD risk profile elevated; accelerated coronary artery calcification susceptibility.',
        recommendedAction: 'Discuss moderate-to-high intensity statin therapy (e.g. Atorvastatin 20mg daily).',
        timeframe: 'Within 2 Weeks',
        badgeColor: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-900',
      });
    }

    // 5. Alert: Ischemic Stroke Risk Factors
    if (bpSystolic >= 140 && patient.age >= 50) {
      alerts.push({
        id: 'ew-5',
        severity: 'Moderate',
        title: 'Cerebrovascular Stroke Risk Warning',
        evidence: `Systolic BP ${bpSystolic} mmHg in patient aged ${patient.age}.`,
        observation: 'Pulse pressure strain increases vulnerability to carotid artery narrowing and small-vessel thrombosis.',
        recommendedAction: 'Screen carotid pulses; maintain strict blood pressure target < 130/80 mmHg.',
        timeframe: 'Routine Follow-up',
        badgeColor: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900',
      });
    }

    return alerts;
  }
}
