import { z } from 'zod';

export const SessionSchema = z.object({
  id: z.string().uuid().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional().nullable(),
  // Generic fields for compilation
  name: z.string().optional(),
});

export type Session = z.infer<typeof SessionSchema>;

export class SessionFactory {
  static create(data: Partial<Session>): Session {
    return SessionSchema.parse({
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data
    });
  }
}

export interface ISessionRepository {
  findById(id: string): Promise<Session | null>;
  save(entity: Session): Promise<void>;
  delete(id: string): Promise<void>;
}
