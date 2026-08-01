import { WorkflowDefinition } from './types';

export class WorkflowRegistry {
  private workflows = new Map<string, WorkflowDefinition>();

  register(definition: WorkflowDefinition) {
    this.workflows.set(definition.metadata.name, definition);
  }

  get(name: string): WorkflowDefinition {
    const wf = this.workflows.get(name);
    if (!wf) throw new Error(`Workflow ${name} not found`);
    return wf;
  }
}
