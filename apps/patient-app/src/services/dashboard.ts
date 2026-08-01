import { fetchApi } from './api';

export interface SystemStatusResponse {
  systemStatus: string;
  version: string;
  environment: string;
  uptimeSeconds: number;
  totalLatencyMs: number;
  services: {
    gemini: { status: string; message: string; latencyMs: number };
    ocr: { status: string; message: string; latencyMs: number };
    predictionEngine: { status: string; message: string; latencyMs: number };
    fhirServer: { status: string; endpoint: string; latencyMs: number };
    database: { status: string; mode: string; latencyMs: number };
  };
}

export const dashboardService = {
  getStatus: () => fetchApi<SystemStatusResponse>('/api/status'),
  getDashboardData: () => fetchApi<any>('/dashboard'),
};
