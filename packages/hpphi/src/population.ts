// ============================================================================
// HPPHI – Capability 8: Population Preventive Analytics
// ============================================================================

import { HPPHIPatientInput, HPPHIPopulationReport, HPPHIPopulationInsight, HPPHIPreventiveHealthScore } from './types';

interface AggregatedPatient {
  healthScore: HPPHIPreventiveHealthScore;
  patient: HPPHIPatientInput;
}

export class HPPHIPopulationEngine {

  /**
   * Generate de-identified population-level preventive analytics.
   * Accepts an array of patients with their computed health scores.
   */
  public analyze(patients: AggregatedPatient[]): HPPHIPopulationReport {
    const total = patients.length;
    if (total === 0) {
      return {
        totalPatients: 0,
        commonPreventiveGaps: [],
        screeningCompliance: [],
        populationRiskTrends: [],
        interventionEffectiveness: []
      };
    }

    // ── 1. Common Preventive Gaps ──
    const gapCounts: Record<string, number> = {};
    for (const p of patients) {
      for (const comp of p.healthScore.components) {
        if (comp.status === 'WEAKNESS') {
          gapCounts[comp.factor] = (gapCounts[comp.factor] || 0) + 1;
        }
      }
    }
    const commonPreventiveGaps = Object.entries(gapCounts)
      .map(([gap, count]) => ({ gap, percentAffected: parseFloat(((count / total) * 100).toFixed(1)) }))
      .sort((a, b) => b.percentAffected - a.percentAffected);

    // ── 2. Screening Compliance ──
    const screeningCounts: Record<string, { compliant: number; total: number }> = {};
    const now = Date.now();
    for (const p of patients) {
      for (const scr of p.patient.previousScreenings) {
        if (!screeningCounts[scr.screening]) {
          screeningCounts[scr.screening] = { compliant: 0, total: 0 };
        }
        screeningCounts[scr.screening].total++;
        const daysSince = (now - scr.lastDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSince <= 730) { // within 2 years
          screeningCounts[scr.screening].compliant++;
        }
      }
    }
    const screeningCompliance = Object.entries(screeningCounts)
      .map(([screening, data]) => ({
        screening,
        compliancePercent: parseFloat(((data.compliant / data.total) * 100).toFixed(1))
      }))
      .sort((a, b) => a.compliancePercent - b.compliancePercent);

    // ── 3. Population Risk Trends ──
    const avgScore = patients.reduce((sum, p) => sum + p.healthScore.overallScore, 0) / total;
    const smokingRate = patients.filter(p => p.patient.lifestyleFactors.smokingStatus === 'CURRENT').length / total * 100;
    const sedentaryRate = patients.filter(p => p.patient.lifestyleFactors.physicalActivityMinPerWeek < 150).length / total * 100;
    const obesityRate = patients.filter(p => (p.patient.laboratoryResults.find(l => l.test === 'BMI')?.value ?? 0) >= 30).length / total * 100;

    const populationRiskTrends: HPPHIPopulationInsight[] = [
      {
        metric: 'Average Preventive Health Score',
        value: parseFloat(avgScore.toFixed(1)),
        description: `Population average preventive health score is ${avgScore.toFixed(1)}/100.`,
        trend: avgScore >= 70 ? 'STABLE' : avgScore >= 50 ? 'STABLE' : 'WORSENING'
      },
      {
        metric: 'Active Smoking Rate',
        value: parseFloat(smokingRate.toFixed(1)),
        description: `${smokingRate.toFixed(1)}% of patients are active smokers.`,
        trend: smokingRate > 20 ? 'WORSENING' : smokingRate > 10 ? 'STABLE' : 'IMPROVING'
      },
      {
        metric: 'Sedentary Lifestyle Rate',
        value: parseFloat(sedentaryRate.toFixed(1)),
        description: `${sedentaryRate.toFixed(1)}% of patients have insufficient physical activity.`,
        trend: sedentaryRate > 50 ? 'WORSENING' : 'STABLE'
      },
      {
        metric: 'Obesity Prevalence',
        value: parseFloat(obesityRate.toFixed(1)),
        description: `${obesityRate.toFixed(1)}% of patients have BMI ≥30.`,
        trend: obesityRate > 40 ? 'WORSENING' : 'STABLE'
      }
    ];

    // ── 4. Intervention Effectiveness (simulated population-level data) ──
    const interventionEffectiveness = [
      { intervention: 'Smoking Cessation Program', successRate: 35.0 },
      { intervention: 'DASH Diet Counseling', successRate: 55.0 },
      { intervention: 'Exercise Prescription', successRate: 48.0 },
      { intervention: 'Statin Therapy Initiation', successRate: 72.0 },
      { intervention: 'Sleep Hygiene Education', successRate: 42.0 },
      { intervention: 'Weight Management Program', successRate: 38.0 }
    ];

    return {
      totalPatients: total,
      commonPreventiveGaps,
      screeningCompliance,
      populationRiskTrends,
      interventionEffectiveness
    };
  }
}
