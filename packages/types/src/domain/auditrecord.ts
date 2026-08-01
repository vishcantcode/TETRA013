import { z } from 'zod';

export const AuditRecordSchema = z.object({
  id: z.string().uuid().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional().nullable(),
  // Generic fields for compilation
  name: z.string().optional(),
});

export type AuditRecord = z.infer<typeof AuditRecordSchema>;

export class AuditRecordFactory {
  static create(data: Partial<AuditRecord>): AuditRecord {
    return AuditRecordSchema.parse({
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data
    });
  }
}

export interface IAuditRecordRepository {
  findById(id: string): Promise<AuditRecord | null>;
  save(entity: AuditRecord): Promise<void>;
  delete(id: string): Promise<void>;
}
