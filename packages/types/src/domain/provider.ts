import { z } from 'zod';

export const ProviderSchema = z.object({
  id: z.string().uuid().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional().nullable(),
  // Generic fields for compilation
  name: z.string().optional(),
});

export type Provider = z.infer<typeof ProviderSchema>;

export class ProviderFactory {
  static create(data: Partial<Provider>): Provider {
    return ProviderSchema.parse({
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data
    });
  }
}

export interface IProviderRepository {
  findById(id: string): Promise<Provider | null>;
  save(entity: Provider): Promise<void>;
  delete(id: string): Promise<void>;
}
