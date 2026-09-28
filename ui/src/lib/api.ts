// OpsMind API Client
// All API calls go through this module. The Vite proxy routes them to :8000.

import type {
  Incident,
  Insight,
  LearningStats,
  HealthStatus,
  OpenIncidentRequest,
  ResolveIncidentRequest,
  ReflectRequest,
  FeedbackRequest,
  SuggestionFeedback,
  SeedResult,
} from '@/types';

// Backend target URL
const LOCALHOST_URL = 'http://localhost:8000';

// Resolve the API base URL - default strictly to local backend http://localhost:8000
const getBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/$/, '');
  }
  return LOCALHOST_URL;
};

const BASE = getBaseUrl();


async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { detail?: string; error?: string }).detail ??
        (err as { detail?: string; error?: string }).error ??
        `HTTP ${res.status} on ${path}`
    );
  }
  return res.json() as Promise<T>;
}

export const api = {
  // Health
  health: () => request<HealthStatus>('GET', '/health'),

  // Incidents
  listIncidents: (params?: { service?: string; status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.service) qs.set('service', params.service);
    if (params?.status) qs.set('status', params.status);
    const q = qs.toString();
    return request<Incident[]>('GET', `/incidents${q ? `?${q}` : ''}`);
  },
  getIncident: (id: string) => request<Incident>('GET', `/incidents/${id}`),
  openIncident: (body: OpenIncidentRequest) =>
    request<Incident>('POST', '/incidents', body),
  resolveIncident: (id: string, body: ResolveIncidentRequest) =>
    request<Incident>('POST', `/incidents/${id}/resolve`, body),
  submitFeedback: (id: string, body: FeedbackRequest) =>
    request<SuggestionFeedback>('POST', `/incidents/${id}/feedback`, body),

  // Memory & Reflection
  reflect: (body: ReflectRequest) => request<Insight>('POST', '/reflect', body),
  listInsights: (service?: string) => {
    const qs = service ? `?service=${encodeURIComponent(service)}` : '';
    return request<Insight[]>('GET', `/insights${qs}`);
  },

  // Stats
  stats: () => request<LearningStats>('GET', '/stats'),

  // Demo
  seedDemo: () => request<SeedResult>('POST', '/demo/seed'),
};
