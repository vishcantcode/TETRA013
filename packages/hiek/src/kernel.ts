import { HIEKContext, createHIEKContext } from './context';
import { HIEKLifecycleTracker } from './lifecycle';
import { HIEKEventBus, HIEKDomainEventType } from './events';
import { HIEKExecutionPolicy, HIEKPolicyRunner } from './policies';
import { pool } from '@healthsense/db';

export interface HIEKWorkflowStep<TInput = any, TOutput = any> {
  name: string;
  handler: (input: TInput, ctx: HIEKContext) => Promise<TOutput>;
}

export interface HIEKWorkflowDefinition {
  name: string;
  version?: string;
  steps: HIEKWorkflowStep[];
}

export interface HIEKExecutionRequest<TInput = any, TOutput = any> {
  workflowName: string;
  context?: HIEKContext;
  input?: TInput;
  policy?: HIEKExecutionPolicy;
  eventTypeOnSuccess?: HIEKDomainEventType;
  handler: (input: TInput, ctx: HIEKContext) => Promise<TOutput>;
}

export interface HIEKExecutionResponse<TOutput = any> {
  executionId: string;
  correlationId: string;
  workflowName: string;
  status: 'COMPLETED' | 'FAILED' | 'CANCELLED';
  data?: TOutput;
  error?: string;
  durationMs: number;
  attempts: number;
  lifecycleHistory: any[];
}

export class HealthSenseIntelligentExecutionKernel {
  private static instance: HealthSenseIntelligentExecutionKernel;
  private eventBus = HIEKEventBus.getInstance();

  public static getInstance(): HealthSenseIntelligentExecutionKernel {
    if (!HealthSenseIntelligentExecutionKernel.instance) {
      HealthSenseIntelligentExecutionKernel.instance = new HealthSenseIntelligentExecutionKernel();
    }
    return HealthSenseIntelligentExecutionKernel.instance;
  }

  public async execute<TInput = any, TOutput = any>(
    request: HIEKExecutionRequest<TInput, TOutput>
  ): Promise<HIEKExecutionResponse<TOutput>> {
    const startTime = Date.now();
    const ctx = request.context || createHIEKContext();
    const tracker = new HIEKLifecycleTracker(ctx.executionId, request.workflowName);

    tracker.transition('VALIDATED', { inputSummary: typeof request.input === 'object' ? Object.keys(request.input || {}) : 'primitive' });
    tracker.transition('EXECUTING');

    let attempts = 1;
    let outputData: TOutput | undefined;
    let executionError: string | undefined;

    try {
      const { result, attempts: executedAttempts } = await HIEKPolicyRunner.executeWithPolicy(
        () => request.handler(request.input as TInput, ctx),
        request.policy
      );
      attempts = executedAttempts;
      outputData = result;
      tracker.transition('COMPLETED', { durationMs: Date.now() - startTime });

      if (request.eventTypeOnSuccess) {
        await this.eventBus.publish(request.eventTypeOnSuccess, ctx, outputData);
      }

      // Safe Audit Log insertion handling optional user ID foreign key constraint
      try {
        let validUserId: string | null = null;
        if (ctx.user?.id) {
          const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [ctx.user.id]);
          if (userCheck.rows.length > 0) {
            validUserId = ctx.user.id;
          }
        }

        await pool.query(
          `INSERT INTO audit_log (user_id, action, resource_type, resource_id, metadata, ip_address) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            validUserId,
            `HIEK_EXECUTE:${request.workflowName}`,
            'WORKFLOW_EXECUTION',
            ctx.executionId,
            JSON.stringify({ correlationId: ctx.correlationId, attempts, durationMs: Date.now() - startTime }),
            '127.0.0.1'
          ]
        );
      } catch (err) {
        // Non-blocking log persistence
      }

      return {
        executionId: ctx.executionId,
        correlationId: ctx.correlationId,
        workflowName: request.workflowName,
        status: 'COMPLETED',
        data: outputData,
        durationMs: Date.now() - startTime,
        attempts,
        lifecycleHistory: tracker.getHistory()
      };
    } catch (err: any) {
      executionError = err.message || 'Execution failed';
      tracker.transition('FAILED', {}, executionError);

      return {
        executionId: ctx.executionId,
        correlationId: ctx.correlationId,
        workflowName: request.workflowName,
        status: 'FAILED',
        error: executionError,
        durationMs: Date.now() - startTime,
        attempts,
        lifecycleHistory: tracker.getHistory()
      };
    }
  }
}

export const hiek = HealthSenseIntelligentExecutionKernel.getInstance();
