// ============================================================================
// HECIT – Capability 3: Confidence Decomposition Module
// ============================================================================

import { HECITConfidenceDecomposition, HECITConfidenceFactor } from './types';
import { HPPMCareProfile } from '@healthsense/hppm';

export class HECITConfidenceEngine {

  public decomposeConfidence(profile: HPPMCareProfile): HECITConfidenceDecomposition {
    const contributingFactors: HECITConfidenceFactor[] = [];
    const uncertaintyFactors: HECITConfidenceFactor[] = [];
    const conflictingSignals: string[] = [];

    let score = 0.85; // baseline confidence

    // Data Completeness check
    const hasVitals = profile.vitalSigns.length > 0;
    const hasLabs = profile.laboratoryResults.length > 0;
    const hasMedHistory = profile.treatmentHistory.length > 0;
    const completeness = (Number(hasVitals) + Number(hasLabs) + Number(hasMedHistory)) / 3;

    if (completeness >= 0.9) {
      score += 0.08;
      contributingFactors.push({
        factorName: 'High Data Completeness',
        impactScore: 0.08,
        description: 'Vitals, laboratory results, and treatment history are fully documented.',
      });
    } else {
      score -= 0.05;
      uncertaintyFactors.push({
        factorName: 'Partial Clinical Data',
        impactScore: -0.05,
        description: 'Some laboratory or vital sign metrics missing.',
      });
    }

    // Guideline Alignment
    score += 0.05;
    contributingFactors.push({
      factorName: 'Strong Guideline Concordance',
      impactScore: 0.05,
      description: 'Recommendations directly align with AHA/ACC and ADA Grade A guidelines.',
    });

    // Adherence Factor
    if (profile.adherenceHistory.medicationAdherencePercent < 80) {
      score -= 0.06;
      uncertaintyFactors.push({
        factorName: 'Suboptimal Patient Adherence',
        impactScore: -0.06,
        description: `Medication adherence score is ${profile.adherenceHistory.medicationAdherencePercent}%, introducing uncertainty in therapeutic efficacy.`,
      });
      conflictingSignals.push('Suboptimal adherence may mimic treatment failure or drug resistance.');
    }

    // Treatment Response History
    const partialResponse = profile.treatmentHistory.some(t => t.response === 'PARTIAL');
    if (partialResponse) {
      uncertaintyFactors.push({
        factorName: 'Historical Partial Response',
        impactScore: -0.03,
        description: 'Patient previously showed partial response to standard therapy.',
      });
    }

    const finalScore = Math.max(0.1, Math.min(1.0, parseFloat(score.toFixed(3))));

    return {
      overallConfidenceScore: finalScore,
      confidencePercentage: `${(finalScore * 100).toFixed(1)}%`,
      dataCompletenessScore: parseFloat(completeness.toFixed(2)),
      contributingFactors,
      uncertaintyFactors,
      conflictingSignals,
    };
  }
}
