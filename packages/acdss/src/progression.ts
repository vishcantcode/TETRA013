// ============================================================================
// ACDSS – Capability 4: Disease Progression Module
// ============================================================================

import { ACDSSPatientCase, ACDSSProgressionEstimate, ProgressionTrajectory } from './types';
import { hcpi } from '@healthsense/hcpi';

export class ACDSSProgressionEngine {

  public evaluate(patientCase: ACDSSPatientCase): ACDSSProgressionEstimate[] {
    const estimates: ACDSSProgressionEstimate[] = [];

    // Leverage HCPI longitudinal analysis for overall trajectory
    const longitudinalResult = hcpi.analyzePatientLongitudinal(patientCase.patientId);
    const overallTrajectory = longitudinalResult.riskEvolution.trajectory;

    for (const condition of patientCase.chronicConditions) {
      const estimate = this.estimateForCondition(condition, patientCase, overallTrajectory);
      if (estimate) estimates.push(estimate);
    }

    return estimates;
  }

  private estimateForCondition(
    condition: string,
    patientCase: ACDSSPatientCase,
    overallTrajectory: 'IMPROVING' | 'STABLE' | 'DETERIORATING'
  ): ACDSSProgressionEstimate | null {
    const normalizedCondition = condition.toLowerCase();

    if (normalizedCondition.includes('hypertension')) {
      return this.estimateHypertension(condition, patientCase, overallTrajectory);
    }
    if (normalizedCondition.includes('diabetes')) {
      return this.estimateDiabetes(condition, patientCase, overallTrajectory);
    }
    if (normalizedCondition.includes('ckd') || normalizedCondition.includes('kidney')) {
      return this.estimateCKD(condition, patientCase, overallTrajectory);
    }
    if (normalizedCondition.includes('obesity')) {
      return this.estimateObesity(condition, patientCase, overallTrajectory);
    }

    // Generic fallback
    return {
      condition,
      trajectory: this.mapTrajectory(overallTrajectory),
      projectedEvolution: `${condition} follows overall patient trajectory: ${overallTrajectory}.`,
      contributingFactors: ['Longitudinal risk trend', 'Medication adherence pattern'],
      timeHorizon: '6-12 months',
      confidence: 0.65
    };
  }

  private estimateHypertension(
    condition: string,
    patientCase: ACDSSPatientCase,
    overallTrajectory: string
  ): ACDSSProgressionEstimate {
    const sysBp = patientCase.vitalSigns.find(v => v.metric === 'Systolic BP')?.value || 130;
    const factors: string[] = [];
    let trajectory: ProgressionTrajectory = 'STABLE';

    if (sysBp >= 150) {
      trajectory = 'DETERIORATING';
      factors.push(`Systolic BP elevated at ${sysBp} mmHg (target <130)`);
    } else if (sysBp < 130) {
      trajectory = 'IMPROVING';
      factors.push(`Systolic BP controlled at ${sysBp} mmHg`);
    } else {
      factors.push(`Systolic BP borderline at ${sysBp} mmHg`);
    }

    const onAntihypertensive = patientCase.medications.some(m =>
      m.toLowerCase().includes('lisinopril') ||
      m.toLowerCase().includes('amlodipine') ||
      m.toLowerCase().includes('losartan')
    );
    if (onAntihypertensive) factors.push('Currently on antihypertensive therapy');
    else factors.push('No antihypertensive medication detected');

    return {
      condition,
      trajectory,
      projectedEvolution: trajectory === 'DETERIORATING'
        ? 'Without medication adjustment, risk of hypertensive target organ damage increases over 6-12 months.'
        : trajectory === 'IMPROVING'
        ? 'Current management is effective. Continue monitoring every 3-6 months.'
        : 'Blood pressure is borderline controlled. Lifestyle modifications and medication adherence are critical.',
      contributingFactors: factors,
      timeHorizon: '6-12 months',
      confidence: 0.84
    };
  }

  private estimateDiabetes(
    condition: string,
    patientCase: ACDSSPatientCase,
    overallTrajectory: string
  ): ACDSSProgressionEstimate {
    const hba1c = patientCase.laboratoryResults.find(l => l.test === 'HbA1c')?.value || 7.0;
    const factors: string[] = [];
    let trajectory: ProgressionTrajectory = 'STABLE';

    if (hba1c >= 9.0) {
      trajectory = 'DETERIORATING';
      factors.push(`HbA1c critically elevated at ${hba1c}% (target <7%)`);
    } else if (hba1c < 7.0) {
      trajectory = 'IMPROVING';
      factors.push(`HbA1c well controlled at ${hba1c}%`);
    } else {
      factors.push(`HbA1c suboptimal at ${hba1c}%`);
    }

    return {
      condition,
      trajectory,
      projectedEvolution: trajectory === 'DETERIORATING'
        ? 'Risk of microvascular complications (retinopathy, neuropathy, nephropathy) significantly elevated. Intensify glycemic management.'
        : trajectory === 'IMPROVING'
        ? 'Glycemic control adequate. Maintain current regimen with quarterly HbA1c monitoring.'
        : 'Glycemic control suboptimal. Consider medication intensification or adherence interventions.',
      contributingFactors: factors,
      timeHorizon: '3-12 months',
      confidence: 0.87
    };
  }

  private estimateCKD(
    condition: string,
    patientCase: ACDSSPatientCase,
    overallTrajectory: string
  ): ACDSSProgressionEstimate {
    const egfr = patientCase.laboratoryResults.find(l => l.test === 'eGFR')?.value || 60;
    const factors: string[] = [];
    let trajectory: ProgressionTrajectory = 'STABLE';

    if (egfr < 30) {
      trajectory = 'DETERIORATING';
      factors.push(`eGFR severely reduced at ${egfr} mL/min/1.73m² (Stage 4-5 CKD)`);
    } else if (egfr < 60) {
      trajectory = 'STABLE';
      factors.push(`eGFR moderately reduced at ${egfr} mL/min/1.73m² (Stage 3 CKD)`);
    } else {
      trajectory = 'IMPROVING';
      factors.push(`eGFR at ${egfr} mL/min/1.73m²`);
    }

    return {
      condition,
      trajectory,
      projectedEvolution: trajectory === 'DETERIORATING'
        ? 'Progressive CKD. Nephrology referral and renal replacement therapy planning recommended.'
        : 'Renal function stable. Continue monitoring eGFR and proteinuria every 3-6 months.',
      contributingFactors: factors,
      timeHorizon: '6-24 months',
      confidence: 0.80
    };
  }

  private estimateObesity(
    condition: string,
    patientCase: ACDSSPatientCase,
    overallTrajectory: string
  ): ACDSSProgressionEstimate {
    const bmi = patientCase.laboratoryResults.find(l => l.test === 'BMI')?.value || 30;
    const factors: string[] = [];
    let trajectory: ProgressionTrajectory = 'STABLE';

    if (bmi >= 40) {
      trajectory = 'DETERIORATING';
      factors.push(`BMI at ${bmi} kg/m² (Class III Obesity)`);
    } else if (bmi >= 30) {
      trajectory = 'STABLE';
      factors.push(`BMI at ${bmi} kg/m² (Class I-II Obesity)`);
    }

    return {
      condition,
      trajectory,
      projectedEvolution: trajectory === 'DETERIORATING'
        ? 'Morbid obesity increases risk for metabolic syndrome, OSA, and cardiovascular events. Consider bariatric surgery evaluation.'
        : 'Structured lifestyle intervention with dietary counseling and supervised exercise recommended.',
      contributingFactors: factors,
      timeHorizon: '6-12 months',
      confidence: 0.78
    };
  }

  private mapTrajectory(t: string): ProgressionTrajectory {
    if (t === 'IMPROVING') return 'IMPROVING';
    if (t === 'DETERIORATING') return 'DETERIORATING';
    return 'STABLE';
  }
}
