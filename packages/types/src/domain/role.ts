import { z } from 'zod';

export const RoleSchema = z.object({
  id: z.string().uuid().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional().nullable(),
  // Generic fields for compilation
  name: z.string().optional(),
});

export type Role = z.infer<typeof RoleSchema>;

export class RoleFactory {
  static create(data: Partial<Role>): Role {
    return RoleSchema.parse({
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data
    });
  }
}

export interface IRoleRepository {
  findById(id: string): Promise<Role | null>;
  save(entity: Role): Promise<void>;
  delete(id: string): Promise<void>;
}
