import { fetchApi } from './api';

export interface PatientSummary {
  key: string;
  id: string;
  name: string;
  age: number;
  gender: string;
  condition: string;
  riskScore: number;
}

export const patientService = {
  getDemoPatients: () => fetchApi<{ count: number; patients: PatientSummary[] }>('/api/demoPatients'),
  getPatientById: (id: string) => fetchApi<{ patientId: string; bundle: any }>(`/api/patient/${id}`),
};
