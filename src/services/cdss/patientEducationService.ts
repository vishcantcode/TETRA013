import { Patient } from '../../types';
import { PatientEducation } from '../../types/cdss';

export class PatientEducationService {
  /**
   * Stage 8: Generates Dual-Perspective Clinical & Patient Communication Content.
   * Ensures strict separation between professional ICD-10 medical terminology and accessible patient language.
   */
  public static generateEducationContent(patient: Patient, customVitals?: any): PatientEducation {
    const vitals = customVitals || patient.vitals || {};
    const hba1c = vitals.hba1c || 7.2;
    const bpSystolic = vitals.bpSystolic || 138;
    const bpDiastolic = vitals.bpDiastolic || 88;
    const bmi = vitals.bmi || 27.4;
    const glucose = vitals.glucose || 128;

    return {
      doctorVersion: {
        diagnosisConsiderations: `Sub-optimally controlled Type 2 Diabetes Mellitus (ICD-10 E11.69) with fasting plasma glucose of ${glucose} mg/dL and HbA1c of ${hba1c}%. Essential Primary Hypertension (ICD-10 I10) with resting blood pressure ${bpSystolic}/${bpDiastolic} mmHg. Overweight status (ICD-10 E66.3) with BMI ${bmi} kg/m².`,
        therapeuticPlan: `Consider escalating Metformin to 500mg BD. Evaluate early addition of an SGLT2 inhibitor (e.g. Empagliflozin 10mg qd) or GLP-1 receptor agonist for combined glycemic control and cardiorenal risk reduction per ADA 2026 Standards of Care. Maintain BP target < 130/80 mmHg.`,
        medicalNutritionTherapy: `Prescribe Medical Nutrition Therapy (MNT). Target carbohydrate intake threshold to 45-60g per meal with low glycemic index complex carbs. Emphasize Mediterranean dietary pattern high in MUFAs and dietary fiber (> 30g/day). Sodium restriction < 2,000 mg/day.`,
        exerciseAndFollowUp: `Prescribe 150 minutes/week of moderate-intensity aerobic physical activity (e.g., brisk walking) combined with progressive resistance training 2-3 sessions/week. Re-evaluate HbA1c, fasting lipids, and UACR in 12 weeks.`,
        guidelineCitations: [
          'ADA Standards of Medical Care in Diabetes - 2026',
          'ACC/AHA High Blood Pressure Guidelines - Section 4.2',
          'KDIGO Clinical Practice Guideline for Diabetes Management in CKD',
        ],
      },
      patientVersion: {
        whatResultsMean: `Your recent health check shows that your blood sugar level (HbA1c ${hba1c}%) and blood pressure (${bpSystolic}/${bpDiastolic} mmHg) are slightly higher than recommended. Taking small, manageable steps now will help protect your heart, kidneys, eyes, and overall energy.`,
        healthyEatingTips: [
          'Fill half your plate with colorful non-starchy vegetables like spinach, broccoli, and peppers.',
          'Swap refined white bread and rice for whole grains like brown rice, oats, and quinoa.',
          'Choose lean protein sources like fish, chicken, beans, and lentils.',
          'Limit sugary drinks, sodas, and packaged snacks; replace them with water or herbal tea.',
        ],
        physicalActivityGuidance: `Aim for about 30 minutes of brisk walking or light activity 5 days a week. You don't need intense workouts—regular daily movement helps your muscles use blood sugar for energy naturally!`,
        medicationAndMonitoringTips: `Take any prescribed medications at the same time every day with meals as directed by your doctor. Keep a simple daily notebook log of your morning blood sugar and blood pressure readings.`,
        redFlagSymptomsToWatch: [
          'Unusual dizziness, faintness, or severe headache.',
          'Blurry vision or sudden trouble seeing clearly.',
          'Extreme thirst, frequent night urination, or unexplained fatigue.',
          'Chest pressure, shortness of breath, or leg swelling.',
        ],
      },
    };
  }
}
