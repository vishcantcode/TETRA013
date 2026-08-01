import { DeIdentifiedPatientRecord } from '../services/AnonymizationService';
import { ResourceForecast } from '../interfaces/ResourceForecast';

export class ResourcePlanningEngine {
  public static forecastResources(records: DeIdentifiedPatientRecord[]): ResourceForecast {
    const nephrologyCount = records.filter(r => r.referralSpecialties.includes('Nephrologist')).length;
    const cardiologyCount = records.filter(r => r.referralSpecialties.includes('Cardiologist')).length;
    const endocrinologyCount = records.filter(r => r.referralSpecialties.includes('Endocrinologist')).length;

    return {
      estimatedSpecialistVisitsNeeded: [
        { specialty: 'Nephrology Consultations', requiredVisitsPerMonth: Math.max(2, nephrologyCount * 4) },
        { specialty: 'Cardiology Consultations', requiredVisitsPerMonth: Math.max(2, cardiologyCount * 3) },
        { specialty: 'Endocrinology Consultations', requiredVisitsPerMonth: Math.max(2, endocrinologyCount * 2) }
      ],
      labKitDemand: [
        { testName: 'Urine Albumin-to-Creatinine Ratio (UACR) Strips', requiredKitsNext30Days: 150 },
        { testName: 'HbA1c Cartridges', requiredKitsNext30Days: 200 },
        { testName: 'Lipid Profile Reagents', requiredKitsNext30Days: 100 }
      ],
      screeningCampPriorities: [
        { villageName: 'Pethapur Rural Cluster', priorityScore: 92, recommendedFocus: 'Microalbuminuria & Diabetic Nephropathy Screening' },
        { villageName: 'Koliwada Sector 2', priorityScore: 85, recommendedFocus: 'Hypertension & ASCVD Risk Screening' }
      ]
    };
  }
}
