// ============================================================================
// HCCCP – Capability 1: Multidisciplinary Care Team Workspace Engine
// ============================================================================

import { MultidisciplinaryWorkspaceView, CareTeamMember } from './types';

export class HCCCPCareTeamWorkspaceEngine {

  /**
   * Build shared Multidisciplinary Care Team Workspace view.
   */
  public buildCareTeamWorkspaceView(patientId: string): MultidisciplinaryWorkspaceView {
    const careTeam: CareTeamMember[] = [
      { memberId: 'tm-1', name: 'Dr. Sarah Jenkins', role: 'PHYSICIAN', specialty: 'Attending Cardiology', assignedTasksCount: 2 },
      { memberId: 'tm-2', name: 'Nurse Emily Clark', role: 'NURSE', assignedTasksCount: 3 },
      { memberId: 'tm-3', name: 'Dr. Marcus Vance', role: 'SPECIALIST', specialty: 'Electrophysiology', assignedTasksCount: 1 },
      { memberId: 'tm-4', name: 'PharmD Robert Chen', role: 'PHARMACIST', assignedTasksCount: 1 },
      { memberId: 'tm-5', name: 'Lisa Taylor', role: 'CARE_COORDINATOR', assignedTasksCount: 2 },
    ];

    return {
      patientId,
      patientName: 'Johnathan Doe',
      careTeam,
      assignedResponsibilities: [
        { role: 'PHYSICIAN', responsibility: 'Overall Clinical Management & Discharge Planning' },
        { role: 'NURSE', responsibility: 'Vital Signs Monitoring & IV Diuretic Administration' },
        { role: 'PHARMACIST', responsibility: 'SGLT2i Renal Dose Verification' },
        { role: 'CARE_COORDINATOR', responsibility: 'Post-Discharge Home Care & Transportation' },
      ],
      activeTasks: [
        { taskId: 'tsk-101', title: 'Review Elevated BNP Labs', assignee: 'Dr. Sarah Jenkins', priority: 'CRITICAL', dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000) },
        { taskId: 'tsk-102', title: 'Administer Morning Furosemide', assignee: 'Nurse Emily Clark', priority: 'HIGH', dueDate: new Date(Date.now() + 1 * 60 * 60 * 1000) },
        { taskId: 'tsk-103', title: 'Medication Reconciliation', assignee: 'PharmD Robert Chen', priority: 'MEDIUM', dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000) },
      ],
      careMilestones: [
        { milestoneId: 'ms-1', title: 'BNP Level Stabilized < 200 pg/mL', completed: false },
        { milestoneId: 'ms-2', title: 'Transition to Oral Diuretics', completed: false },
        { milestoneId: 'ms-3', title: 'Patient Education & Discharge Instructions', completed: false },
      ],
      pendingActionsCount: 3,
    };
  }
}
