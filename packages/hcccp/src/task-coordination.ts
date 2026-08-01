// ============================================================================
// HCCCP – Capability 3: Task & Care Coordination Engine
// ============================================================================

import crypto from 'node:crypto';
import { CoordinatedTask, MultidisciplinaryRole } from './types';

export class HCCCPTaskCoordinationEngine {
  private taskStore: Map<string, CoordinatedTask> = new Map();

  /**
   * Create a coordinated care task with dependency tracking and priority levels.
   */
  public createCoordinatedTask(
    patientId: string,
    title: string,
    description: string,
    assigneeId: string,
    assigneeRole: MultidisciplinaryRole,
    priority: CoordinatedTask['priority'] = 'MEDIUM',
    dependsOnTaskId?: string
  ): CoordinatedTask {
    const taskId = `ctsk-${crypto.randomUUID().slice(0, 8)}`;
    const task: CoordinatedTask = {
      taskId,
      patientId,
      title,
      description,
      assigneeId,
      assigneeRole,
      priority,
      status: 'PENDING',
      dependsOnTaskId,
      dueDate: new Date(Date.now() + 8 * 60 * 60 * 1000),
    };

    this.taskStore.set(taskId, task);
    return task;
  }

  /**
   * Escalate an overdue or unfulfilled critical task to supervisor / senior role.
   */
  public escalateTask(taskId: string, escalateTo: string): CoordinatedTask {
    const task = this.taskStore.get(taskId);
    if (!task) throw new Error(`Task ${taskId} not found.`);

    task.status = 'ESCALATED';
    task.escalatedTo = escalateTo;
    this.taskStore.set(taskId, task);
    return task;
  }

  public getTasks(patientId: string): CoordinatedTask[] {
    return Array.from(this.taskStore.values()).filter(t => t.patientId === patientId);
  }
}
