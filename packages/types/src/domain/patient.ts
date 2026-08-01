import { z } from 'zod';

export const PatientSchema = z.object({
  id: z.string().uuid().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional().nullable(),
  // Generic fields for compilation
  name: z.string().optional(),
});

export type Patient = z.infer<typeof PatientSchema>;

export class PatientFactory {
  static create(data: Partial<Patient>): Patient {
    return PatientSchema.parse({
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data
    });
  }
}

export interface IPatientRepository {
  findById(id: string): Promise<Patient | null>;
  save(entity: Patient): Promise<void>;
  delete(id: string): Promise<void>;
}
