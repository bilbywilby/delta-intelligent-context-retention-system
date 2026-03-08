export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export interface Checkpoint {
  id: string;
  sessionId: string;
  content: string;
  timestamp: number;
  label?: string;
}
export interface Session {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  lastCheckpointId?: string;
}
export interface SessionState extends Session {
  checkpoints: Checkpoint[];
}
export interface DeletionEpisode {
  id: string;
  context: string;
  deletedContent: string;
  reason: string;
  outcome: 'success' | 'reverted' | 'neutral';
  timestamp: number;
}
export interface EnhanceResponse {
  suggestions: string[];
  relevantEpisodes: DeletionEpisode[];
}
export interface User {
  id: string;
  name: string;
}
export interface WebhookPayload {
  signature: string;
  iv: string;
  ciphertext: string;
  messageId: string;
}
export interface IngestPayload {
  title: string;
  content: string;
  source: string;
}
export interface SystemHealth {
  status: 'healthy' | 'degraded';
  storage: boolean;
  timestamp: string;
}