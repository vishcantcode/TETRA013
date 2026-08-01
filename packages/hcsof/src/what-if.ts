// ============================================================================
// HCSOF – Capability 6: What-If Analysis Engine
// ============================================================================

import { DigitalTwinState, WhatIfParameters, WhatIfResult } from './types';
import { HCSOFDigitalTwinEngine } from './digital-twin';

export class HCSOFWhatIfEngine {
  private twinEngine = new HCSOFDigitalTwinEngine();

  /**
   * Perform a what-if scenario exploration against a digital twin state.
   * Ensures the input twin state remains pristine by working on an isolated clone.
   */
  public runWhatIf(
    baseTwin: DigitalTwinState,
    scenarioName: string,
    params: WhatIfParameters
  ): WhatIfResult {
    // Clone twin to maintain complete isolation
    const twin = this.twinEngine.cloneSnapshot(baseTwin);

    let bpChange = 0;
    let hba1cChange = 0;
    let ldlChange = 0;
    let cvdRiskChange = 0;
    let scoreDelta = 0;
    const explanations: string[] = [];

    // 1. Adherence Change
    if (params.adherenceChangePercent) {
      twin.simulatedLifestyle.adherencePercent = Math.min(
        100,
        Math.max(0, twin.simulatedLifestyle.adherencePercent + params.adherenceChangePercent)
      );
      if (params.adherenceChangePercent > 0) {
        bpChange -= Math.round(params.adherenceChangePercent * 0.25);
        hba1cChange -= parseFloat((params.adherenceChangePercent * 0.015).toFixed(2));
        scoreDelta += Math.round(params.adherenceChangePercent * 0.3);
        explanations.push(`Adherence improved by +${params.adherenceChangePercent}%, enhancing therapeutic efficacy.`);
      } else {
        bpChange += Math.round(Math.abs(params.adherenceChangePercent) * 0.2);
        hba1cChange += parseFloat((Math.abs(params.adherenceChangePercent) * 0.012).toFixed(2));
        scoreDelta -= Math.round(Math.abs(params.adherenceChangePercent) * 0.3);
        explanations.push(`Adherence declined by ${params.adherenceChangePercent}%, increasing risk of therapeutic failure.`);
      }
    }

    // 2. Physical Activity Change
    if (params.physicalActivityChangeMin) {
      twin.simulatedLifestyle.physicalActivityMinPerWeek = Math.max(
        0,
        twin.simulatedLifestyle.physicalActivityMinPerWeek + params.physicalActivityChangeMin
      );
      if (params.physicalActivityChangeMin > 0) {
        bpChange -= Math.round((params.physicalActivityChangeMin / 60) * 2);
        hba1cChange -= parseFloat(((params.physicalActivityChangeMin / 60) * 0.1).toFixed(2));
        cvdRiskChange -= Math.round((params.physicalActivityChangeMin / 60) * 1.5);
        scoreDelta += Math.round((params.physicalActivityChangeMin / 60) * 3);
        explanations.push(`Physical activity increased by +${params.physicalActivityChangeMin} min/week.`);
      }
    }

    // 3. Weight Loss
    if (params.weightChangeKg) {
      const currentBmi = twin.simulatedLabs.find(l => l.test === 'BMI')?.value ?? 28;
      const newBmi = Math.max(18.5, currentBmi - params.weightChangeKg * 0.35);
      const bmiLab = twin.simulatedLabs.find(l => l.test === 'BMI');
      if (bmiLab) bmiLab.value = parseFloat(newBmi.toFixed(1));

      if (params.weightChangeKg < 0) { // negative means weight loss
        const loss = Math.abs(params.weightChangeKg);
        bpChange -= Math.round(loss * 1.2);
        hba1cChange -= parseFloat((loss * 0.08).toFixed(2));
        ldlChange -= Math.round(loss * 1.5);
        scoreDelta += Math.round(loss * 2.5);
        explanations.push(`Weight reduction of ${loss} kg lowers BP, improves glycemic control, and reduces metabolic load.`);
      }
    }

    // 4. Smoking Cessation
    if (params.smokingCessation && twin.simulatedLifestyle.smokingStatus === 'CURRENT') {
      twin.simulatedLifestyle.smokingStatus = 'FORMER';
      cvdRiskChange -= 25;
      scoreDelta += 15;
      explanations.push('Smoking cessation halves 1-year cardiovascular risk and significantly boosts overall health score.');
    }

    // 5. Medication Additions / Discontinuations
    if (params.addedMedication) {
      twin.simulatedMedications.push(params.addedMedication);
      if (params.addedMedication.toLowerCase().includes('statin')) {
        ldlChange -= 45;
        scoreDelta += 8;
        explanations.push(`Added ${params.addedMedication}: significant LDL reduction and ASCVD risk mitigation.`);
      } else if (params.addedMedication.toLowerCase().includes('sglt2') || params.addedMedication.toLowerCase().includes('empagliflozin')) {
        hba1cChange -= 0.7;
        bpChange -= 4;
        scoreDelta += 10;
        explanations.push(`Added SGLT2i (${params.addedMedication}): combined glycemic, BP, and cardiorenal protection.`);
      }
    }

    if (params.discontinuedMedication) {
      twin.simulatedMedications = twin.simulatedMedications.filter(
        m => !m.toLowerCase().includes(params.discontinuedMedication!.toLowerCase())
      );
      scoreDelta -= 8;
      explanations.push(`Discontinued ${params.discontinuedMedication}. Monitor for loss of therapeutic control.`);
    }

    // Update twin vitals & risk score based on impacts
    const sysBp = twin.simulatedVitals.find(v => v.metric === 'Systolic BP');
    if (sysBp) sysBp.value = Math.max(100, sysBp.value + bpChange);

    const hba1c = twin.simulatedLabs.find(l => l.test === 'HbA1c');
    if (hba1c) hba1c.value = parseFloat(Math.max(5.0, hba1c.value + hba1cChange).toFixed(1));

    const ldl = twin.simulatedLabs.find(l => l.test === 'LDL');
    if (ldl) ldl.value = Math.max(50, ldl.value + ldlChange);

    twin.simulatedRiskScore = Math.max(5, Math.min(100, twin.simulatedRiskScore + cvdRiskChange));

    return {
      scenarioName,
      parametersApplied: params,
      simulatedTwinState: twin,
      predictedImpact: {
        bpChangeSystolic: bpChange,
        hba1cChangePercent: hba1cChange,
        ldlChangeMgDl: ldlChange,
        cvdRiskChangePercent: cvdRiskChange,
        overallScoreDelta: scoreDelta,
      },
      confidence: 0.82,
      explanation: explanations.join(' '),
    };
  }
}
