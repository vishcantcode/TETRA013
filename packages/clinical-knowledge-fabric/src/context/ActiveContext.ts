import { AsyncLocalStorage } from 'async_hooks';

export interface CKFContext {
  contextDate: Date;
  snapshotId?: string;
  workflowId?: string;
  patientId?: string;
}

const contextStorage = new AsyncLocalStorage<CKFContext>();

export class ActiveContext {
  /**
   * Run a block of code within a specific CKF context.
   */
  public static run<T>(context: CKFContext, callback: () => T): T {
    return contextStorage.run(context, callback);
  }

  /**
   * Retrieve the current CKF context.
   * Throws an error if accessed outside of a run block, ensuring we never accidentally default to 'now' implicitly.
   */
  public static get(): CKFContext {
    const ctx = contextStorage.getStore();
    if (!ctx) {
      throw new Error('KnowledgeFabricError: No ActiveContext found. CKF services must be executed within ActiveContext.run()');
    }
    return ctx;
  }
}
