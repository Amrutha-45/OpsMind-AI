// OpsMind AI — Core TypeScript Types
// These mirror the Python dataclass models in backend/opsmind/models.py

export type Severity = 'SEV1' | 'SEV2' | 'SEV3' | 'SEV4';
export type IncidentStatus = 'open' | 'resolved';

export interface SimilarIncident {
  text: string;
  memory_type: string;
  score: number;
}

export interface Incident {
  id: string;
  service: string;
  title: string;
  description: string;
  severity: Severity;
  status: IncidentStatus;
  created_at: string;
  resolved_at: string | null;
  root_cause: string | null;
  resolution: string | null;
  tags: string[];
  similar_past_incidents: SimilarIncident[];
}

export interface Insight {
  id: string;
  bank_id: string;
  question: string;
  answer: string;
  based_on: Array<{ text?: string; content?: string; [key: string]: unknown }>;
  confidence: number | null;
  created_at: string;
}

export interface SuggestionFeedback {
  id: string;
  incident_id: string;
  suggestion_text: string;
  was_helpful: boolean;
  created_at: string;
}

export interface LearningStats {
  total_feedback: number;
  helpful: number;
  not_helpful: number;
  acceptance_rate: number | null;
}

export interface HealthStatus {
  status: 'ok' | 'error';
  hindsight: { status?: string; error?: string };
}

// API Request Bodies
export interface OpenIncidentRequest {
  service: string;
  title: string;
  description: string;
  severity: Severity;
  tags: string[];
}

export interface ResolveIncidentRequest {
  root_cause: string;
  resolution: string;
}

export interface ReflectRequest {
  service: string;
  question: string;
}

export interface FeedbackRequest {
  suggestion_text: string;
  was_helpful: boolean;
}

export interface SeedResult {
  status: string;
  loaded_count: number;
  incidents: Incident[];
}

// UI Navigation Routes
export type PageRoute =
  | 'overview'
  | 'incidents'
  | 'incident-details'
  | 'memory'
  | 'agent-activity'
  | 'scoreboard'
  | 'architecture';

export type ViewTab = 'incidents' | 'reflect' | 'scoreboard' | 'arch';

export interface AppState {
  incidents: Incident[];
  insights: Insight[];
  stats: LearningStats | null;
  selectedIncidentId: string | null;
  activeView: ViewTab;
  knownServices: string[];
  isHealthy: boolean;
  hindsightConnected: boolean;
}

export interface IncidentFilters {
  search: string;
  service: string;
  severity: string;
  status: string;
}
