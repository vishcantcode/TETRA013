const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: any };
  metadata: { correlationId: string; timestamp: string; durationMs?: number };
}

export class ApiError extends Error {
  constructor(public code: string, message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function fetchApi<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('hs_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

  if (response.status === 401) {
    localStorage.removeItem('hs_token');
    localStorage.removeItem('hs_user');
    if (!window.location.pathname.startsWith('/auth')) {
      window.location.href = '/auth';
    }
    throw new ApiError('UNAUTHORIZED', 'Session expired', 401);
  }

  const body: ApiResponse<T> = await response.json().catch(() => ({
    success: false,
    error: { code: 'PARSE_ERROR', message: response.statusText },
    metadata: { correlationId: '', timestamp: new Date().toISOString() }
  }));

  if (!response.ok || !body.success) {
    throw new ApiError(
      body.error?.code || 'UNKNOWN',
      body.error?.message || response.statusText,
      response.status
    );
  }

  return body.data as T;
}

// Typed API helpers
export const api = {
  auth: {
    login: (email: string, password: string) =>
      fetchApi<{ token: string; user: any }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    register: (data: { email: string; password: string; firstName: string; lastName: string; dateOfBirth: string; gender: string }) =>
      fetchApi<{ token: string; user: any }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    me: () => fetchApi<{ user: any; profile: any }>('/auth/me'),
  },
  dashboard: () => fetchApi<any>('/dashboard'),
  timeline: () => fetchApi<any>('/timeline'),
  profile: {
    get: () => fetchApi<any>('/profile'),
    update: (data: any) => fetchApi<any>('/profile', { method: 'PUT', body: JSON.stringify(data) }),
  },
  carePlan: () => fetchApi<any>('/care-plan'),
  medications: {
    list: () => fetchApi<any>('/medications'),
    enroll: (data: any) => fetchApi<any>('/medications/enroll', { method: 'POST', body: JSON.stringify(data) }),
    administer: (data: any) => fetchApi<any>('/medications/administer', { method: 'POST', body: JSON.stringify(data) }),
  },
  preventive: {
    assessment: () => fetchApi<any>('/preventive/assessment'),
    risk: () => fetchApi<any>('/preventive/risk'),
    trends: () => fetchApi<any>('/preventive/trends'),
  },
  triage: {
    start: (data?: any) => fetchApi<any>('/triage/start', { method: 'POST', body: JSON.stringify(data || {}) }),
    answer: (data: any) => fetchApi<any>('/triage/answer', { method: 'POST', body: JSON.stringify(data) }),
    complete: (data: any) => fetchApi<any>('/triage/complete', { method: 'POST', body: JSON.stringify(data) }),
  },
  assessments: {
    list: () => fetchApi<any>('/assessments'),
    get: (id: string) => fetchApi<any>(`/assessments/${id}`),
  },
  records: {
    list: () => fetchApi<any>('/records'),
    upload: (data: { recordType: string; title: string; data: any }) =>
      fetchApi<any>('/records/upload', { method: 'POST', body: JSON.stringify(data) }),
  },
  admin: {
    users: () => fetchApi<{ users: any[] }>('/admin/users'),
    createUser: (data: any) => fetchApi<{ user: any }>('/admin/users', { method: 'POST', body: JSON.stringify(data) }),
    audit: () => fetchApi<{ logs: any[] }>('/admin/audit'),
    metrics: () => fetchApi<any>('/admin/metrics'),
    analytics: () => fetchApi<any>('/admin/analytics'),
  },
  clinician: {
    patients: () => fetchApi<{ patients: any[] }>('/clinician/patients'),
    patientDetail: (id: string) => fetchApi<any>(`/clinician/patients/${id}`),
    invite: (patientEmail: string) =>
      fetchApi<{ invitation: any }>('/clinician/invite', { method: 'POST', body: JSON.stringify({ patientEmail }) }),
  },
  analytics: {
    log: (eventName: string, category: string, payload?: any) =>
      fetchApi<{ logged: boolean }>('/analytics/event', { method: 'POST', body: JSON.stringify({ eventName, category, payload }) }),
  },
  demo: {
    seed: () => fetchApi<any>('/demo/seed', { method: 'POST' }),
    reset: () => fetchApi<any>('/demo/reset', { method: 'POST' }),
  },
};
