import { fetchApi } from './api';

export const ocrService = {
  extractLabReport: (documentText?: string, imageBase64?: string, filename?: string) =>
    fetchApi<any>('/api/ocr', { method: 'POST', body: JSON.stringify({ documentText, imageBase64, filename }) }),
};
