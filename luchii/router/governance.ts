import type {
  ChatRequest,
  ChatResponse,
  EmbeddingsRequest,
  EmbeddingsResponse,
  ModelConfig,
} from "./types.js";

export interface GovernanceHooks {
  beforeChat?(request: ChatRequest, modelConfig: ModelConfig): Promise<ChatRequest> | ChatRequest;
  afterChat?(
    response: ChatResponse,
    request: ChatRequest,
    modelConfig: ModelConfig,
  ): Promise<ChatResponse> | ChatResponse;
  beforeEmbeddings?(
    request: EmbeddingsRequest,
    modelConfig: ModelConfig,
  ): Promise<EmbeddingsRequest> | EmbeddingsRequest;
  afterEmbeddings?(
    response: EmbeddingsResponse,
    request: EmbeddingsRequest,
    modelConfig: ModelConfig,
  ): Promise<EmbeddingsResponse> | EmbeddingsResponse;
}
