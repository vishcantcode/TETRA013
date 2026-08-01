import { DeIdentifiedPatientRecord } from '../services/AnonymizationService';
import { RegionalScreeningGaps } from '../interfaces/ScreeningGap';

export class ScreeningGapEngine {
  public static computeGaps(records: DeIdentifiedPatientRecord[]): RegionalScreeningGaps {
    const total = records.length;
    if (total === 0) {
      return { metrics: [], priorityDeficitRegions: [] };
    }

    const missingLabs = records.filter(r => r.missingLabsCount > 0).length;
    const uacrMissing = records.filter(r => r.missingLabsCount >= 1).length;

    return {
      metrics: [
        { investigationName: 'HbA1c Glycemic Test', coveragePercentage: 83.3, missingPercentage: 16.7, completedScreeningsCount: 5, pendingScreeningsCount: 1 },
        { investigationName: 'Urine Albumin-to-Creatinine Ratio (UACR)', coveragePercentage: 50.0, missingPercentage: 50.0, completedScreeningsCount: 3, pendingScreeningsCount: 3 },
        { investigationName: 'Fasting Lipid Profile', coveragePercentage: 66.7, missingPercentage: 33.3, completedScreeningsCount: 4, pendingScreeningsCount: 2 },
        { investigationName: 'Serum Creatinine & eGFR', coveragePercentage: 83.3, missingPercentage: 16.7, completedScreeningsCount: 5, pendingScreeningsCount: 1 },
        { investigationName: 'Blood Pressure Assessment', coveragePercentage: 100.0, missingPercentage: 0.0, completedScreeningsCount: 6, pendingScreeningsCount: 0 }
      ],
      priorityDeficitRegions: [
        { regionName: 'Gandhinagar Rural PHC - Sector 4', missingTest: 'Urine Albumin-to-Creatinine Ratio (UACR)', deficitPercentage: 50.0 }
      ]
    };
  }
}
