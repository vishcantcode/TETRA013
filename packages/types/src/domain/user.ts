import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().uuid().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional().nullable(),
  // Generic fields for compilation
  name: z.string().optional(),
});

export type User = z.infer<typeof UserSchema>;

export class UserFactory {
  static create(data: Partial<User>): User {
    return UserSchema.parse({
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data
    });
  }
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  save(entity: User): Promise<void>;
  delete(id: string): Promise<void>;
}
