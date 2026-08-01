const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
