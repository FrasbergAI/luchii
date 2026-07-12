import type {
  ChatRequest,
  ChatResponse,
  EmbeddingsRequest,
  EmbeddingsResponse,
  ModelConfig,
  ModelProviderId,
} from "./types.js";

export interface ModelProvider {
  readonly id: ModelProviderId;
  chat(request: ChatRequest, modelConfig: ModelConfig): Promise<ChatResponse>;
  embeddings(
    request: EmbeddingsRequest,
    modelConfig: ModelConfig,
  ): Promise<EmbeddingsResponse>;
}

export interface ProviderRegistry {
  get(providerId: ModelProviderId): ModelProvider | undefined;
  require(providerId: ModelProviderId): ModelProvider;
  register(provider: ModelProvider): void;
  list(): ModelProvider[];
}

export class InMemoryProviderRegistry implements ProviderRegistry {
  private readonly providers = new Map<ModelProviderId, ModelProvider>();

  constructor(providers: ModelProvider[] = []) {
    for (const provider of providers) {
      this.register(provider);
    }
  }

  get(providerId: ModelProviderId): ModelProvider | undefined {
    return this.providers.get(providerId);
  }

  require(providerId: ModelProviderId): ModelProvider {
    const provider = this.get(providerId);

    if (!provider) {
      throw new Error(`No provider registered for '${providerId}'.`);
    }

    return provider;
  }

  register(provider: ModelProvider): void {
    this.providers.set(provider.id, provider);
  }

  list(): ModelProvider[] {
    return [...this.providers.values()];
  }
}
