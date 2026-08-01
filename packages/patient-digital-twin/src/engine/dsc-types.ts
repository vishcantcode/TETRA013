import { z } from 'zod';
import { TwinState, TwinStateVector } from '../domain';
import { EventEnvelope } from '../events';

export const CompilerConfigurationSchema = z.object({
  defaultHalfLifeMs: z.number().int().positive().default(300000), // 5 minutes
  maxRebuildLookbackDays: z.number().int().positive().default(30),
  enableWriteThroughCache: z.boolean().default(true),
  enableAuditSnapshotLogging: z.boolean().default(true),
  enableKafkaEventPublishing: z.boolean().default(true)
});
export type CompilerConfiguration = z.infer<typeof CompilerConfigurationSchema>;

export interface IDynamicStateCompiler {
  compile(patientId: string, events: EventEnvelope<any>[]): Promise<TwinState>;
  update(currentState: TwinState, newEvent: EventEnvelope<any>): Promise<TwinState>;
  rebuild(patientId: string): Promise<TwinState>;
  snapshot(state: TwinState): TwinStateVector;
  calculateConfidence(state: TwinState, targetTimeISO?: string): number;
  exportState(state: TwinState): string;
  importState(serialized: string): TwinState;
}
