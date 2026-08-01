// ============================================================================
// HUCWP – Capability 3: Adaptive Workflow Engine
// ============================================================================

import crypto from 'node:crypto';
import { ClinicianRole, ClinicianTask, TaskPriority } from './types';

export class HUCWPAdaptiveWorkflowEngine {
  private taskStore: Map<string, ClinicianTask> = new Map();

  constructor() {
    this.seedDefaultTasks();
  }

  private seedDefaultTasks(): void {
    this.createTask('pt-9001', 'PHYSICIAN', 'Review Elevated BNP Results', 'Patient BNP 450 pg/mL requires clinical review.', 'CRITICAL');
    this.createTask('pt-9001', 'NURSE', 'Perform Morning Vital Signs Check', 'Check BP, HR, SpO2 and record fluid intake/output.', 'HIGH');
    this.createTask('pt-9001', 'PHARMACIST', 'Medication Reconciliation & Interaction Check', 'Reconcile Furosemide dose against renal function.', 'MEDIUM');
  }

  public createTask(
    patientId: string,
    assignedRole: ClinicianRole,
    title: string,
    description: string,
    priority: TaskPriority = 'MEDIUM'
  ): ClinicianTask {
    const taskId = `tsk-${crypto.randomUUID().slice(0, 8)}`;
    const task: ClinicianTask = {
      taskId,
      patientId,
      assignedRole,
      title,
      description,
      priority,
      status: 'PENDING',
      dueDate: new Date(Date.now() + 12 * 60 * 60 * 1000),
    };

    this.taskStore.set(taskId, task);
    return task;
  }

  public getTasksForRole(role: ClinicianRole): ClinicianTask[] {
    return Array.from(this.taskStore.values()).filter(t => t.assignedRole === role);
  }

  public updateTaskStatus(taskId: string, status: ClinicianTask['status']): ClinicianTask {
    const task = this.taskStore.get(taskId);
    if (!task) throw new Error(`Task ${taskId} not found.`);

    task.status = status;
    this.taskStore.set(taskId, task);
    return task;
  }
}
