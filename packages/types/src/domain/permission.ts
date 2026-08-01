import { z } from 'zod';

export const PermissionSchema = z.object({
  id: z.string().uuid().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional().nullable(),
  // Generic fields for compilation
  name: z.string().optional(),
});

export type Permission = z.infer<typeof PermissionSchema>;

export class PermissionFactory {
  static create(data: Partial<Permission>): Permission {
    return PermissionSchema.parse({
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data
    });
  }
}

export interface IPermissionRepository {
  findById(id: string): Promise<Permission | null>;
  save(entity: Permission): Promise<void>;
  delete(id: string): Promise<void>;
}
