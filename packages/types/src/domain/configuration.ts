import { z } from 'zod';

export const ConfigurationSchema = z.object({
  id: z.string().uuid().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional().nullable(),
  // Generic fields for compilation
  name: z.string().optional(),
});

export type Configuration = z.infer<typeof ConfigurationSchema>;

export class ConfigurationFactory {
  static create(data: Partial<Configuration>): Configuration {
    return ConfigurationSchema.parse({
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data
    });
  }
}

export interface IConfigurationRepository {
  findById(id: string): Promise<Configuration | null>;
  save(entity: Configuration): Promise<void>;
  delete(id: string): Promise<void>;
}
