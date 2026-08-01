// ============================================================================
// HPOIP – Capability 1: Population Health Dashboard Framework
// ============================================================================

import { PopulationCohort, CareGap } from './types';

export class HPOIPPopulationDashboardFramework {
  private cohortStore: Map<string, PopulationCohort> = new Map();
  private careGapStore: Map<string, CareGap[]> = new Map();

  constructor() {
    this.seedDefaultCohorts();
  }

  private seedDefaultCohorts(): void {
    const cohorts: PopulationCohort[] = [
      {
        cohortId: 'coh-htn-01',
        name: 'Hypertension High Risk Cohort',
        totalPatientsCount: 1420,
        highRiskCount: 310,
        preventiveCompliancePercent: 88.5,
        averageAge: 62.4,
        topCareGapsCount: 45,
      },
      {
        cohortId: 'coh-t2d-02',
        name: 'Type 2 Diabetes Cohort',
        totalPatientsCount: 980,
        highRiskCount: 195,
        preventiveCompliancePercent: 82.0,
        averageAge: 58.1,
        topCareGapsCount: 38,
      },
      {
        cohortId: 'coh-hf-03',
        name: 'Heart Failure HFrEF Cohort',
        totalPatientsCount: 450,
        highRiskCount: 140,
        preventiveCompliancePercent: 91.2,
        averageAge: 67.8,
        topCareGapsCount: 22,
      },
    ];

    for (const c of cohorts) {
      this.cohortStore.set(c.cohortId, c);
    }

    const htnGaps: CareGap[] = [
      {
        gapId: 'gap-101',
        cohortId: 'coh-htn-01',
        title: 'Overdue Annual Kidney Function Screening (eGFR/UACR)',
        affectedPatientsCount: 45,
        urgency: 'HIGH',
        recommendedAction: 'Issue automated patient portal reminder for lab scheduling',
      },
      {
        gapId: 'gap-102',
        cohortId: 'coh-htn-01',
        title: 'Uncontrolled Systolic BP > 140 mmHg',
        affectedPatientsCount: 68,
        urgency: 'CRITICAL',
        recommendedAction: 'Schedule priority nurse follow-up for medication titration',
      },
    ];

    this.careGapStore.set('coh-htn-01', htnGaps);
  }

  public getCohorts(): PopulationCohort[] {
    return Array.from(this.cohortStore.values());
  }

  public getCohort(cohortId: string): PopulationCohort | undefined {
    return this.cohortStore.get(cohortId);
  }

  public getCareGaps(cohortId: string): CareGap[] {
    return this.careGapStore.get(cohortId) || [];
  }
}
