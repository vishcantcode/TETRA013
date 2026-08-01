export interface AgentMessage {
  role: 'system' | 'user' | 'assistant' | 'agent';
  content: string;
  confidence?: number;
  sources?: string[];
}

export interface IntelligenceContext {
  workflowId: string;
  sessionId: string;
  patientId: string;
  activeAgents: string[];
  history: AgentMessage[];
  sharedMemory: Record<string, any>;
  escalationRequired: boolean;
  maxTokens?: number;
  temperature?: number;
}
