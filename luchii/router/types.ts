export type ModelProviderId = string;

export interface ModelConfig {
  providerId: ModelProviderId;
  model: string;
  temperature?: number;
  maxTokens?: number;
  metadata?: Record<string, string>;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
}

export interface ToolCallDefinition {
  name: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
}

export interface ToolInvocation {
  id?: string;
  toolName: string;
  arguments: Record<string, unknown>;
}

export interface ChatRequest {
  tenant?: string;
  domain?: string;
  region?: string;
  messages: ChatMessage[];
  tools?: ToolCallDefinition[];
  toolInvocations?: ToolInvocation[];
  metadata?: Record<string, string>;
}

export interface ChatResponse {
  providerId: ModelProviderId;
  model: string;
  message: ChatMessage;
  toolInvocations?: ToolInvocation[];
  metadata?: Record<string, string>;
}

export interface EmbeddingsRequest {
  tenant?: string;
  domain?: string;
  region?: string;
  input: string | string[];
  metadata?: Record<string, string>;
}

export interface EmbeddingsResponse {
  providerId: ModelProviderId;
  model: string;
  embeddings: number[][];
  metadata?: Record<string, string>;
}
