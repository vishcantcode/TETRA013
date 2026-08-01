// ============================================================================
// HPPM – Capability 6: Shared Decision Support Module
// ============================================================================

import { HPPMCareProfile, HPPMSharedDecisionReport, HPPMCareOption } from './types';

export class HPPMSharedDecisionEngine {

  public generate(profile: HPPMCareProfile): HPPMSharedDecisionReport {
    // Identify the primary clinical question from the profile
    const primaryCondition = this.identifyPrimaryDecisionPoint(profile);
    const options = this.generateOptions(primaryCondition, profile);

    // Select the best option
    options.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
    const recommended = options[0];

    return {
      clinicalQuestion: `What is the optimal treatment strategy for ${primaryCondition} in this patient?`,
      options,
      recommendedOption: recommended?.optionName || 'No options available',
      recommendationRationale: this.buildRationale(recommended, profile)
    };
  }

  private identifyPrimaryDecisionPoint(profile: HPPMCareProfile): string {
    // Find the condition with the most active treatment challenges
    const partialOrPoor = profile.treatmentHistory.filter(t =>
      t.response === 'PARTIAL' || t.response === 'POOR'
    );
    if (partialOrPoor.length > 0) {
      // Find the chronic condition related to the problematic treatment
      for (const condition of profile.chronicConditions) {
        if (condition.toLowerCase().includes('hypertension')) return 'Hypertension Management';
        if (condition.toLowerCase().includes('diabetes')) return 'Diabetes Management';
      }
    }
    return profile.chronicConditions[0] || 'General Health Optimization';
  }

  private generateOptions(clinicalQuestion: string, profile: HPPMCareProfile): HPPMCareOption[] {
    if (clinicalQuestion.toLowerCase().includes('hypertension')) {
      return this.hypertensionOptions(profile);
    }
    if (clinicalQuestion.toLowerCase().includes('diabetes')) {
      return this.diabetesOptions(profile);
    }
    return this.generalOptions(profile);
  }

  private hypertensionOptions(profile: HPPMCareProfile): HPPMCareOption[] {
    const hasAceHistory = profile.treatmentHistory.some(t => t.medication.toLowerCase().includes('lisinopril'));
    const aceResponse = profile.treatmentHistory.find(t => t.medication.toLowerCase().includes('lisinopril'))?.response;
    const hasCkd = profile.chronicConditions.some(c => c.toLowerCase().includes('ckd'));
    const hasDiabetes = profile.chronicConditions.some(c => c.toLowerCase().includes('diabetes'));

    const patientConsiderations = (allergies: string): string[] => {
      const considerations: string[] = [];
      if (profile.preferences.preferOnceDailyDosing) considerations.push('Patient prefers once-daily dosing (✓ compatible)');
      if (profile.preferences.preferGeneric) considerations.push('Patient prefers generic medications');
      if (profile.allergies.length > 0) considerations.push(`Known allergies: ${profile.allergies.join(', ')}`);
      if (hasCkd) considerations.push('CKD present — renal-protective agent preferred');
      if (hasDiabetes) considerations.push('Diabetes present — RAAS blockade provides renal benefit');
      return considerations;
    };

    return [
      {
        optionName: 'ACE Inhibitor Optimization (Lisinopril)',
        description: 'Continue/titrate current ACE inhibitor therapy with lifestyle modifications.',
        expectedBenefits: ['BP reduction 8-12 mmHg systolic', 'Renal protection in diabetic/CKD patients', 'Proven cardiovascular mortality reduction'],
        risks: ['Cough (5-10%)', 'Hyperkalemia', 'Angioedema (rare)'],
        uncertainty: 'Individual response varies. May need dose titration over 4-8 weeks.',
        evidenceQuality: 'HIGH',
        patientSpecificConsiderations: patientConsiderations('ACE'),
        suitabilityScore: hasAceHistory && aceResponse === 'GOOD' ? 90 : 75
      },
      {
        optionName: 'ARB Therapy (Losartan)',
        description: 'Switch to ARB if ACE inhibitor not tolerated (cough). Similar efficacy with better tolerability.',
        expectedBenefits: ['BP reduction 8-10 mmHg systolic', 'Renal protection', 'Better tolerability than ACE inhibitors'],
        risks: ['Hyperkalemia', 'Hypotension', 'Less cough than ACE inhibitors'],
        uncertainty: 'Non-inferior to ACE inhibitors for most endpoints. Superior tolerability.',
        evidenceQuality: 'HIGH',
        patientSpecificConsiderations: patientConsiderations('ARB'),
        suitabilityScore: hasAceHistory && aceResponse !== 'GOOD' ? 85 : 70
      },
      {
        optionName: 'CCB Therapy (Amlodipine)',
        description: 'Calcium channel blocker as alternative or add-on for BP control.',
        expectedBenefits: ['BP reduction 8-14 mmHg systolic', 'No metabolic side effects', 'Effective in salt-sensitive hypertension'],
        risks: ['Peripheral edema (10-15%)', 'Reflex tachycardia', 'Drug interactions with simvastatin'],
        uncertainty: 'Less renal protection compared to RAAS blockers in diabetic patients.',
        evidenceQuality: 'HIGH',
        patientSpecificConsiderations: [
          ...patientConsiderations('CCB'),
          hasDiabetes ? 'Less renal protective than ACE/ARB in diabetic nephropathy' : 'Good alternative in non-diabetic patients'
        ],
        suitabilityScore: hasDiabetes || hasCkd ? 60 : 80
      },
      {
        optionName: 'Lifestyle-First Approach',
        description: 'Intensive lifestyle modification (DASH diet, exercise, weight loss) with close BP monitoring before medication change.',
        expectedBenefits: ['BP reduction 5-14 mmHg systolic (DASH)', 'No medication side effects', 'Improves overall metabolic health'],
        risks: ['Slower BP response', 'Requires high patient motivation', 'May be insufficient as monotherapy'],
        uncertainty: 'Highly dependent on patient adherence. Response time 4-12 weeks.',
        evidenceQuality: 'MODERATE',
        patientSpecificConsiderations: [
          `Patient lifestyle adherence: ${profile.adherenceHistory.lifestyleAdherencePercent}%`,
          profile.adherenceHistory.lifestyleAdherencePercent < 60 ? 'Low lifestyle adherence — may not be sufficient alone' : 'Reasonable lifestyle adherence — viable option'
        ],
        suitabilityScore: profile.adherenceHistory.lifestyleAdherencePercent >= 70 ? 65 : 40
      }
    ];
  }

  private diabetesOptions(profile: HPPMCareProfile): HPPMCareOption[] {
    const metforminHistory = profile.treatmentHistory.find(t => t.medication.toLowerCase().includes('metformin'));
    const hasCvd = profile.chronicConditions.some(c => c.toLowerCase().includes('cardiovascular'));
    const hasCkd = profile.chronicConditions.some(c => c.toLowerCase().includes('ckd'));

    return [
      {
        optionName: 'Metformin Optimization',
        description: 'Titrate metformin to maximum tolerated dose with GI-protective strategies.',
        expectedBenefits: ['HbA1c reduction 1.0-1.5%', 'Weight neutral/slight loss', 'Cardiovascular benefit'],
        risks: ['GI side effects', 'B12 deficiency (long-term)', 'Lactic acidosis (rare, renal impairment)'],
        uncertainty: metforminHistory?.response === 'PARTIAL' ? 'Previous partial response — dose titration may improve efficacy.' : 'Standard first-line therapy.',
        evidenceQuality: 'HIGH',
        patientSpecificConsiderations: [
          metforminHistory ? `Previous metformin response: ${metforminHistory.response}` : 'No prior metformin use',
          hasCkd ? 'Monitor renal function — contraindicated if eGFR <30' : 'No renal contraindication'
        ],
        suitabilityScore: metforminHistory?.response === 'ADVERSE' ? 30 : 80
      },
      {
        optionName: 'Add SGLT2 Inhibitor (Empagliflozin)',
        description: 'Add SGLT2i for combined glycemic, cardiovascular, and renal benefit.',
        expectedBenefits: ['HbA1c reduction 0.5-0.8%', 'Weight loss 2-3kg', 'CV mortality reduction', 'Renal protection'],
        risks: ['Genital mycotic infections', 'Euglycemic DKA (rare)', 'Volume depletion'],
        uncertainty: 'Strong CV/renal benefit evidence from EMPA-REG OUTCOME trial.',
        evidenceQuality: 'HIGH',
        patientSpecificConsiderations: [
          hasCvd ? 'CV benefit strongly indicated (EMPA-REG)' : 'CV benefit for primary prevention',
          hasCkd ? 'Renal protection demonstrated (CREDENCE, DAPA-CKD)' : 'No renal concern',
          profile.preferences.avoidInjections ? 'Oral medication — aligns with injection avoidance preference' : ''
        ].filter(Boolean),
        suitabilityScore: hasCvd || hasCkd ? 92 : 78
      },
      {
        optionName: 'Add GLP-1 Receptor Agonist (Semaglutide)',
        description: 'Add GLP-1 RA for superior glycemic control, weight loss, and CV benefit.',
        expectedBenefits: ['HbA1c reduction 1.0-1.8%', 'Weight loss 5-10%', 'CV event reduction', 'Once-weekly option available'],
        risks: ['GI side effects (nausea)', 'Injection required (weekly)', 'Cost', 'Pancreatitis (rare)'],
        uncertainty: 'Strong evidence from SUSTAIN and SELECT trials. GI tolerability improves with slow titration.',
        evidenceQuality: 'HIGH',
        patientSpecificConsiderations: [
          profile.preferences.avoidInjections ? '⚠ Patient prefers to avoid injections — oral semaglutide available' : 'Injection acceptable',
          'Significant weight loss benefit for overweight patients'
        ],
        suitabilityScore: profile.preferences.avoidInjections ? 65 : 85
      }
    ];
  }

  private generalOptions(profile: HPPMCareProfile): HPPMCareOption[] {
    return [
      {
        optionName: 'Comprehensive Lifestyle Optimization',
        description: 'Structured lifestyle modification program covering diet, exercise, sleep, and stress.',
        expectedBenefits: ['Holistic health improvement', 'No medication side effects', 'Sustainable long-term health gains'],
        risks: ['Requires sustained motivation', 'Slower response time'],
        uncertainty: 'Highly individual response. Best when combined with professional coaching.',
        evidenceQuality: 'MODERATE',
        patientSpecificConsiderations: [`Lifestyle adherence: ${profile.adherenceHistory.lifestyleAdherencePercent}%`],
        suitabilityScore: 70
      },
      {
        optionName: 'Pharmacotherapy Optimization',
        description: 'Review and optimize all current medications for efficacy, interactions, and adherence.',
        expectedBenefits: ['Improved treatment efficacy', 'Reduced polypharmacy risk', 'Better adherence'],
        risks: ['Transition period side effects', 'Potential for temporary instability'],
        uncertainty: 'Individual response to medication changes varies.',
        evidenceQuality: 'HIGH',
        patientSpecificConsiderations: [`Currently on ${profile.currentMedications.length} medication(s)`],
        suitabilityScore: 75
      }
    ];
  }

  private buildRationale(option: HPPMCareOption | undefined, profile: HPPMCareProfile): string {
    if (!option) return 'No suitable options identified.';
    return `${option.optionName} recommended (suitability: ${option.suitabilityScore}/100) based on evidence quality (${option.evidenceQuality}), ` +
           `patient-specific considerations (${option.patientSpecificConsiderations.length} factors), ` +
           `and alignment with patient preferences. ${option.uncertainty}`;
  }
}
