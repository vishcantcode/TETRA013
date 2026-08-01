import { z } from 'zod';

export const FeatureFlagSchema = z.object({
  id: z.string().uuid().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional().nullable(),
  // Generic fields for compilation
  name: z.string().optional(),
});

export type FeatureFlag = z.infer<typeof FeatureFlagSchema>;

export class FeatureFlagFactory {
  static create(data: Partial<FeatureFlag>): FeatureFlag {
    return FeatureFlagSchema.parse({
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data
    });
  }
}

export interface IFeatureFlagRepository {
  findById(id: string): Promise<FeatureFlag | null>;
  save(entity: FeatureFlag): Promise<void>;
  delete(id: string): Promise<void>;
}
