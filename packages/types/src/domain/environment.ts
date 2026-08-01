import { z } from 'zod';

export const EnvironmentSchema = z.object({
  id: z.string().uuid().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional().nullable(),
  // Generic fields for compilation
  name: z.string().optional(),
});

export type Environment = z.infer<typeof EnvironmentSchema>;

export class EnvironmentFactory {
  static create(data: Partial<Environment>): Environment {
    return EnvironmentSchema.parse({
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data
    });
  }
}

export interface IEnvironmentRepository {
  findById(id: string): Promise<Environment | null>;
  save(entity: Environment): Promise<void>;
  delete(id: string): Promise<void>;
}
