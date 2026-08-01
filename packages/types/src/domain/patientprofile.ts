import { z } from 'zod';

export const PatientProfileSchema = z.object({
  id: z.string().uuid().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional().nullable(),
  // Generic fields for compilation
  name: z.string().optional(),
});

export type PatientProfile = z.infer<typeof PatientProfileSchema>;

export class PatientProfileFactory {
  static create(data: Partial<PatientProfile>): PatientProfile {
    return PatientProfileSchema.parse({
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data
    });
  }
}

export interface IPatientProfileRepository {
  findById(id: string): Promise<PatientProfile | null>;
  save(entity: PatientProfile): Promise<void>;
  delete(id: string): Promise<void>;
}
