import { fetchApi } from './api';

export interface ChatRequest {
  message: string;
  mode?: 'doctor' | 'patient';
  pageContext?: string;
  language?: string;
  patientContext?: any;
  conversationHistory?: any[];
}

export const chatService = {
  sendMessage: (payload: ChatRequest) =>
    fetchApi<{ reply: string; mode?: string; confidenceScore?: number; suggestedChips?: string[]; timestamp: string; guidelinesReferenced: string[] }>(
      '/api/chat',
      { method: 'POST', body: JSON.stringify(payload) }
    ),
  generateSOAP: (patient: any, assessment?: any) =>
    fetchApi<{ soapNote: string; generatedAt: string; guidelines: string[] }>(
      '/api/soap',
      { method: 'POST', body: JSON.stringify({ patient, assessment }) }
    ),
};
