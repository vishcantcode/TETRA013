// ============================================================================
// HECIT – Capability 4: Alternative Care Pathway Explorer
// ============================================================================

import { HECITAlternativePathway } from './types';
import { HPPMCareProfile } from '@healthsense/hppm';

export class HECITAlternativesEngine {

  public exploreAlternatives(profile: HPPMCareProfile): HECITAlternativePathway[] {
    const alternatives: HECITAlternativePathway[] = [];

    // Alternative 1: ARB Switch
    alternatives.push({
      pathwayId: 'alt-arb-switch',
      pathwayName: 'Switch ACE Inhibitor to ARB (Losartan/Valsartan)',
      description: 'Replace ACE inhibitor with Angiotensin Receptor Blocker to eliminate cough risk while preserving renal & BP benefits.',
      expectedBenefits: ['BP reduction 8-12 mmHg', 'Renal protection', 'Zero incidence of ACE-inhibitor cough'],
      expectedRisks: ['Hyperkalemia risk', 'Mild transient dizziness'],
      confidence: 0.88,
      supportingRationale: 'Grade A evidence for ARBs in hypertensive diabetic/CKD patients who cannot tolerate ACE inhibitors.',
      reasonNotSelectedAsPrimary: 'Patient currently tolerates Lisinopril well (response: GOOD) without documented cough; switching classes prematurely adds unnecessary transition risk.',
    });

    // Alternative 2: SGLT2i Add-on
    alternatives.push({
      pathwayId: 'alt-sglt2i-addon',
      pathwayName: 'Early Addition of SGLT2i (Empagliflozin)',
      description: 'Add oral SGLT2 inhibitor for dual glycemic and renal/cardiovascular protection.',
      expectedBenefits: ['HbA1c reduction 0.6-0.9%', 'Weight loss 2-3 kg', 'Cardiovascular & renal death risk reduction'],
      expectedRisks: ['Mycotic genital infections', 'Mild volume depletion'],
      confidence: 0.90,
      supportingRationale: 'ADA 2024 Grade A recommendation for T2D with CKD or CVD risk.',
      reasonNotSelectedAsPrimary: 'Patient medication adherence is currently 78%; optimizing adherence to existing regimen is prioritized before adding new therapeutic agents.',
    });

    // Alternative 3: Lifestyle Monotherapy
    alternatives.push({
      pathwayId: 'alt-lifestyle-monotherapy',
      pathwayName: 'Intensive Lifestyle Modification Monotherapy',
      description: 'Defer medication changes and engage in 12-week intensive DASH diet & exercise intervention.',
      expectedBenefits: ['BP reduction 5-10 mmHg', 'No medication side effects', 'Weight reduction'],
      expectedRisks: ['Delayed BP/HbA1c control', 'High dependency on patient compliance'],
      confidence: 0.70,
      supportingRationale: 'Effective in early Stage 1 hypertension without end-organ damage.',
      reasonNotSelectedAsPrimary: 'Patient has Stage 2 hypertension (SBP ≥140) and CKD Stage 3a, where pharmacotherapy is mandatorily indicated alongside lifestyle changes.',
    });

    return alternatives;
  }
}
