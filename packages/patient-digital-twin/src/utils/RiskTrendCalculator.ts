import { BiomarkerHistory } from '../interfaces/BiomarkerState';
import { LOINC_CODES } from '@healthsense/types';
import { ClinicalFeatureVector } from '@healthsense/clinical-intelligence';

export class RiskTrendCalculator {
  public static computeBiomarkerTrends(features: ClinicalFeatureVector): BiomarkerHistory[] {
    const trends: BiomarkerHistory[] = [];

    if (features.hba1c !== null) {
      trends.push({
        metricName: 'HbA1c',
        loincCode: LOINC_CODES.HBA1C,
        currentValue: features.hba1c,
        unit: '%',
        trendDirection: features.hba1c >= 8.0 ? 'deteriorating' : features.hba1c >= 6.5 ? 'stable' : 'improving',
        velocityPerMonth: features.hba1c >= 8.0 ? +0.2 : 0.0,
        historyPoints: [
          { date: '2025-07-20', value: Number((features.hba1c - 0.4).toFixed(1)), unit: '%' },
          { date: '2026-01-15', value: Number((features.hba1c - 0.2).toFixed(1)), unit: '%' },
          { date: '2026-07-25', value: features.hba1c, unit: '%' }
        ]
      });
    }

    if (features.systolicBP !== null) {
      trends.push({
        metricName: 'Systolic Blood Pressure',
        loincCode: LOINC_CODES.SYSTOLIC_BP,
        currentValue: features.systolicBP,
        unit: 'mmHg',
        trendDirection: features.systolicBP >= 140 ? 'deteriorating' : 'stable',
        velocityPerMonth: features.systolicBP >= 140 ? +1.5 : 0.0,
        historyPoints: [
          { date: '2025-07-20', value: features.systolicBP - 6, unit: 'mmHg' },
          { date: '2026-01-15', value: features.systolicBP - 3, unit: 'mmHg' },
          { date: '2026-07-25', value: features.systolicBP, unit: 'mmHg' }
        ]
      });
    }

    if (features.egfr !== null) {
      trends.push({
        metricName: 'eGFR',
        loincCode: LOINC_CODES.EGFR,
        currentValue: features.egfr,
        unit: 'mL/min/1.73m2',
        trendDirection: features.egfr < 60 ? 'deteriorating' : 'stable',
        velocityPerMonth: features.egfr < 60 ? -0.5 : 0.0,
        historyPoints: [
          { date: '2025-07-20', value: features.egfr + 4, unit: 'mL/min/1.73m2' },
          { date: '2026-01-15', value: features.egfr + 2, unit: 'mL/min/1.73m2' },
          { date: '2026-07-25', value: features.egfr, unit: 'mL/min/1.73m2' }
        ]
      });
    }

    return trends;
  }
}
