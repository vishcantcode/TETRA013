export interface HCIPStructuredCarePlan {
  id: string;
  patientId: string;
  generatedDate: Date;
  identifiedConcerns: string[];
  recommendedActions: { id: string; title: string; description: string; priority: 'HIGH' | 'MEDIUM' | 'LOW' }[];
  monitoringSchedule: { metric: string; frequency: string }[];
  followUpReminders: { timeframe: string; recommendation: string }[];
  patientEducation: { topic: string; summary: string }[];
  escalationCriteria: string[];
}

export class HCIPCarePlanEngine {
  public static generateCarePlan(patientId: string, assessmentData: any): HCIPStructuredCarePlan {
    const concerns = assessmentData.concerns || ['Elevated blood pressure', 'Sub-optimal medication adherence'];

    return {
      id: `plan-${Date.now()}`,
      patientId,
      generatedDate: new Date(),
      identifiedConcerns: concerns,
      recommendedActions: [
        { id: 'act-01', title: 'Schedule Primary Care Consultation', description: 'Discuss blood pressure monitoring trends with primary care physician.', priority: 'HIGH' },
        { id: 'act-02', title: 'Daily Blood Pressure Log', description: 'Log morning and evening blood pressure measurements in HealthSense app.', priority: 'MEDIUM' }
      ],
      monitoringSchedule: [
        { metric: 'Blood Pressure', frequency: 'Twice Daily (Morning & Evening)' },
        { metric: 'Fasting Glucose', frequency: 'Weekly' }
      ],
      followUpReminders: [
        { timeframe: 'In 2 Weeks', recommendation: 'Complete follow-up symptom assessment in app.' }
      ],
      patientEducation: [
        { topic: 'Dietary Sodium Reduction', summary: 'Reducing daily sodium intake below 2,000mg helps stabilize blood pressure readings.' }
      ],
      escalationCriteria: [
        'Systolic blood pressure exceeding 180 mmHg',
        'Severe persistent headache or chest discomfort'
      ]
    };
  }
}
