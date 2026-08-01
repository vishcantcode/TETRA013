import { fetchApi } from './api';

export const predictionService = {
  predict: (data: any) => fetchApi<any>('/api/predict', { method: 'POST', body: JSON.stringify(data) }),
  explain: (diseaseId: string, patient: any, assessment?: any, language = 'en') =>
    fetchApi<any>('/api/explain', { method: 'POST', body: JSON.stringify({ diseaseId, patient, assessment, language }) }),
  whatIf: (data: any) => fetchApi<any>('/api/whatif', { method: 'POST', body: JSON.stringify(data) }),
  digitalTwin: (data: any) => fetchApi<any>('/api/digital-twin', { method: 'POST', body: JSON.stringify(data) }),
};
