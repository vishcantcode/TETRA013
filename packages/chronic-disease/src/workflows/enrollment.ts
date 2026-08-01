import { WorkflowDefinition, WorkflowContext } from '@healthsense/workflow-runtime';
import { ChronicCondition, CarePlan } from '../domain';

export const buildEnrollmentWorkflow = (conditionName: string): WorkflowDefinition => ({
  metadata: {
    name: `${conditionName}Enrollment`,
    version: '1.0.0',
    description: `Enrollment workflow for ${conditionName}`
  },
  steps: [
    {
      name: 'baseline_assessment',
      async execute(context: WorkflowContext, input: any) {
        // Load longitudinal context
        const twin = context.data.longitudinalContext;
        
        // Generate baseline state
        const condition: ChronicCondition = {
          id: crypto.randomUUID(),
          patientId: context.patientId,
          name: conditionName,
          active: true,
          profile: { diagnosisDate: new Date(), stage: 'early', severity: 'medium', tags: [] },
          carePlan: {
            id: crypto.randomUUID(),
            patientId: context.patientId,
            conditionId: '',
            targets: [],
            schedule: { frequencyDays: 30, metrics: ['blood_pressure', 'hba1c'], nextReviewDate: new Date(Date.now() + 86400000 * 30) },
            interventions: [],
            version: 1,
            lastUpdated: new Date()
          }
        };
        condition.carePlan.conditionId = condition.id;
        
        return { condition, baselineInput: input };
      }
    },
    {
      name: 'intelligence_kernel',
      async execute(context: WorkflowContext, input: any) {
        // AI recommends initial care plan targets based on twin and baseline
        input.condition.carePlan.targets.push({
          id: crypto.randomUUID(),
          metric: conditionName === 'diabetes' ? 'hba1c' : 'systolic_bp',
          targetValue: conditionName === 'diabetes' ? 7.0 : 130,
          unit: conditionName === 'diabetes' ? '%' : 'mmHg',
          operator: '<='
        });
        
        input.recommendation = {
          recommendation: `Initiate standard monitoring for ${conditionName}`,
          confidence: 0.95,
          evidence: ['Clinical Guidelines 2026'],
          explanation: { patient: 'We set baseline goals.', clinician: 'Standard protocol initiated.' }
        };
        return input;
      }
    }
  ]
});

export const diabetesEnrollmentWorkflow = buildEnrollmentWorkflow('diabetes');
export const hypertensionEnrollmentWorkflow = buildEnrollmentWorkflow('hypertension');
