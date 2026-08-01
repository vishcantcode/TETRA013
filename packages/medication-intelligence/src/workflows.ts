import { WorkflowDefinition, WorkflowContext } from '@healthsense/workflow-runtime';
import { MedicationSafetyEngine } from './safety-engine';
import { MedicationCourse } from './domain';

export const medicationIntelligenceWorkflows: WorkflowDefinition[] = [
  {
    metadata: {
      name: 'MedicationEnrollmentWorkflow',
      version: '1.0.0',
      description: 'Enrolls a patient in a new medication course with safety validation'
    },
    steps: [
      {
        name: 'check_safety',
        execute: async (context: WorkflowContext, input: { existingCourses?: MedicationCourse[] }) => {

          const twin = context?.data?.longitudinalContext;
          const newCourse: MedicationCourse = context?.data?.medication || { id: 'unknown', name: 'Unknown', dosage: 'Unknown', frequency: 'Unknown', startDate: new Date() };
          
          // Mock existing active courses mapped from twin
          const activeCourses: MedicationCourse[] = input?.existingCourses || [];
          activeCourses.push(newCourse);

          const safetyEngine = new MedicationSafetyEngine();
          const alerts = await safetyEngine.analyzeSafety(activeCourses, twin);

          if (alerts.some((a: any) => a.severity === 'critical')) {
            throw new Error('Critical medication safety alert triggered. Enrollment aborted.');
          }

          return { course: newCourse, alerts };
        }
      }
    ]
  }
];
