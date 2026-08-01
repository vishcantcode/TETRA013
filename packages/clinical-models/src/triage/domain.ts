import { z } from 'zod';

export const SymptomObservationSchema = z.object({
  id: z.string().uuid(),
  symptom: z.string(),
  duration: z.string().optional(),
  severity: z.number().min(1).max(10).optional(),
  timestamp: z.date()
});

export const TriageSessionSchema = z.object({
  id: z.string().uuid(),
  patientId: z.string().uuid(),
  status: z.enum(['started', 'in_progress', 'completed', 'cancelled']),
  symptoms: z.array(SymptomObservationSchema),
  startedAt: z.date(),
  updatedAt: z.date(),
  completedAt: z.date().optional()
});

export type SymptomObservation = z.infer<typeof SymptomObservationSchema>;
export type TriageSession = z.infer<typeof TriageSessionSchema>;

export interface FollowUpQuestion {
  id: string;
  type: 'single' | 'multi' | 'text';
  text: string;
  options?: string[];
  dependsOn?: string;
}

export interface TriageResult {
  sessionId: string;
  recommendation: string;
  isEmergency: boolean;
  confidence: number;
  explanation: {
    patient: string;
    clinician: string;
  };
}
