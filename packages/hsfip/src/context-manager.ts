// ============================================================================
// HSFIP – Capability 3: Context Management Services
// ============================================================================

import { SMARTContext } from './types';

export class HSFIPContextManagerServices {
  private activeContexts: Map<string, SMARTContext> = new Map();

  /**
   * Set and register an active SMART context for a session.
   */
  public registerContext(contextId: string, context: SMARTContext): void {
    this.activeContexts.set(contextId, context);
  }

  /**
   * Retrieve active SMART context.
   */
  public getContext(contextId: string): SMARTContext | undefined {
    return this.activeContexts.get(contextId);
  }

  /**
   * Verify if current context possesses a required scope (e.g. "patient/Observation.read").
   */
  public hasScope(context: SMARTContext, requiredScope: string): boolean {
    if (!context.active) return false;
    const [reqTarget, reqAction] = requiredScope.split('.');

    for (const scope of context.grantedScopes) {
      if (scope === requiredScope || scope === 'user/*.*' || scope === 'patient/*.*') return true;
      if (scope === 'patient/*.read' && reqAction === 'read') return true;
      if (scope === 'patient/*.write' && reqAction === 'write') return true;
      if (scope === 'user/*.read' && reqAction === 'read') return true;
    }
    return false;
  }
}
